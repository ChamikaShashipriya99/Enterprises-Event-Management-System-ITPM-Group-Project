const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create or fetch a 1-to-1 chat
// @route   POST /api/chat
// @access  Private
const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log('UserId param not sent with request');
        return res.sendStatus(400);
    }

    let isChat = await Chat.find({
        participants: { $all: [req.user._id, userId] },
    })
        .populate('participants', '-password')
        .populate('lastMessage');

    isChat = await User.populate(isChat, {
        path: 'lastMessage.sender',
        select: 'name profilePicture email',
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: 'sender',
            participants: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                'participants',
                '-password'
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Private
const fetchChats = async (req, res) => {
    try {
        let chats = await Chat.find({
            participants: { $elemMatch: { $eq: req.user._id } },
        })
            .populate('participants', '-password')
            .populate('groupAdmin', '-password')
            .populate('lastMessage')
            .populate({
                path: 'pinnedMessages',
                populate: { path: 'sender', select: 'name profilePicture' }
            })
            .sort({ updatedAt: -1 });

        chats = await User.populate(chats, {
            path: 'lastMessage.sender',
            select: 'name profilePicture email',
        });

        // Add unread count to each chat
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: req.user._id },
                    isRead: false,
                });
                return { ...chat._doc, unreadCount };
            })
        );

        res.status(200).send(chatsWithUnread);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Send a message
// @route   POST /api/message
// @access  Private
const sendMessage = async (req, res) => {
    const { content, chatId, fileUrl, fileType } = req.body;

    if ((!content && !fileUrl) || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content || (fileType === 'image' ? 'Sent an image' : 'Sent a file'),
        chat: chatId,
        fileUrl: fileUrl,
        fileType: fileType || 'text',
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name profilePicture');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.participants',
            select: 'name profilePicture email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { lastMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Private
const allMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name profilePicture email')
            .populate('chat')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await Message.countDocuments({ chat: chatId });

        // Mark messages as read
        await Message.updateMany(
            { chat: chatId, sender: { $ne: req.user._id }, isRead: false },
            { $set: { isRead: true } }
        );

        // Reverse to show in chronological order
        res.json({
            messages: messages.reverse(),
            hasMore: totalMessages > skip + limit
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Edit a message
// @route   PUT /api/chat/message/:messageId
// @access  Private
const editMessage = async (req, res) => {
    const { content } = req.body;
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }
        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to edit this message');
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        const fullMessage = await Message.findById(message._id)
            .populate('sender', 'name profilePicture email')
            .populate('chat');

        res.json(fullMessage);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Delete a message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }
        if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this message');
        }

        if (req.user.role === 'admin' && message.sender.toString() !== req.user._id.toString()) {
            // Soft delete for Admins
            message.content = 'Message removed by administrator';
            message.fileUrl = null;
            message.fileType = 'text';
            message.isDeletedByAdmin = true;
            message.reactions = [];
            await message.save();

            const updatedMessage = await Message.findById(message._id)
                .populate('sender', 'name profilePicture email')
                .populate('chat');

            res.json({ 
                message: 'Message soft-deleted by admin', 
                type: 'soft', 
                updatedMessage 
            });
        } else {
            // Hard delete for owner
            await Message.deleteOne({ _id: req.params.messageId });
            res.json({ 
                message: 'Message deleted successfully', 
                type: 'hard', 
                messageId: req.params.messageId, 
                chatId: message.chat 
            });
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Search for students to chat with
// @route   GET /api/chat/users?search=
// @access  Private
const searchUsers = async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { name: { $regex: req.query.search, $options: 'i' } },
                  { email: { $regex: req.query.search, $options: 'i' } },
              ],
          }
        : {};

    const users = await User.find(keyword)
        .find({ _id: { $ne: req.user._id }, role: 'student' })
        .select('name email profilePicture');
    res.send(users);
};

// @desc    Access or create global students group chat
// @route   GET /api/chat/global
// @access  Private
const accessGlobalChat = async (req, res) => {
    try {
        let globalChat = await Chat.findOne({
            isGroupChat: true,
            chatName: 'Global Students',
        })
            .populate('participants', '-password')
            .populate('lastMessage')
            .populate({
                path: 'pinnedMessages',
                populate: { path: 'sender', select: 'name profilePicture' }
            });

        if (globalChat) {
            // Check if current user is in participants, if not add them
            if (!globalChat.participants.find(p => p._id.toString() === req.user._id.toString())) {
                globalChat.participants.push(req.user._id);
                await globalChat.save();
                globalChat = await Chat.findById(globalChat._id).populate('participants', '-password');
            }
            return res.status(200).send(globalChat);
        }

        // Create if not exists
        const allStudents = await User.find({ role: 'student' }).select('_id');
        const participantIds = allStudents.map(u => u._id);

        const chatData = {
            chatName: 'Global Students',
            isGroupChat: true,
            participants: participantIds,
        };

        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
            'participants',
            '-password'
        );
        res.status(200).json(fullChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Toggle emoji reaction on a message
// @route   POST /api/chat/message/:messageId/react
// @access  Private
const toggleReaction = async (req, res) => {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }

        const existingReactionIndex = message.reactions.findIndex(
            (r) => r.emoji === emoji && r.user.toString() === userId.toString()
        );

        if (existingReactionIndex > -1) {
            // Remove reaction
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Add reaction
            message.reactions.push({ emoji, user: userId });
        }

        await message.save();
        
        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'name profilePicture email')
            .populate('chat')
            .populate('reactions.user', 'name');

        res.json(updatedMessage);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Toggle pinning a message in a chat
// @route   POST /api/chat/:chatId/pin/:messageId
// @access  Private
const togglePinMessage = async (req, res) => {
    const { chatId, messageId } = req.params;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        const isPinned = chat.pinnedMessages.includes(messageId);

        if (isPinned) {
            // Unpin
            chat.pinnedMessages = chat.pinnedMessages.filter(
                (id) => id.toString() !== messageId.toString()
            );
        } else {
            // Pin (Limit to 5 for premium feel)
            // Note: We allow admins to pin/unpin anything. 
            // Regular students can also pin/unpin for now (collaborative).
            if (chat.pinnedMessages.length >= 5) {
                chat.pinnedMessages.shift(); // Remove oldest pin
            }
            chat.pinnedMessages.push(messageId);
        }

        await chat.save();

        const updatedChat = await Chat.findById(chatId)
            .populate('participants', '-password')
            .populate('groupAdmin', '-password')
            .populate('lastMessage')
            .populate({
                path: 'pinnedMessages',
                populate: { path: 'sender', select: 'name profilePicture' }
            });

        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Clear all messages in a chat (Admin only)
// @route   DELETE /api/chat/:chatId/clear
// @access  Private/Admin
const clearChatMessages = async (req, res) => {
    const { chatId } = req.params;

    if (req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }

    try {
        await Message.deleteMany({ chat: chatId });
        
        // Reset lastMessage and pinnedMessages in Chat model
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: null,
            pinnedMessages: []
        });

        res.status(200).json({ message: 'Chat history cleared' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

module.exports = {
    accessChat,
    fetchChats,
    sendMessage,
    allMessages,
    searchUsers,
    accessGlobalChat,
    editMessage,
    deleteMessage,
    toggleReaction,
    togglePinMessage,
    clearChatMessages,
};
