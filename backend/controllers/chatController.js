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
        Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
            .populate('participants', '-password')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'lastMessage.sender',
                    select: 'name profilePicture email',
                });
                res.status(200).send(results);
            });
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
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name profilePicture email')
            .populate('chat');
        res.json(messages);
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
            .populate('lastMessage');

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

module.exports = {
    accessChat,
    fetchChats,
    sendMessage,
    allMessages,
    searchUsers,
    accessGlobalChat,
};
