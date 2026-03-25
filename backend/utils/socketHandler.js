const User = require('../models/User');
const Message = require('../models/Message');

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        let currentUserData = null;

        socket.on('setup', async (userData) => {
            if (userData && userData._id) {
                currentUserData = userData;
                socket.join(userData._id);
                console.log(userData._id);
                
                // Mark user as online
                const onlineUser = await User.findByIdAndUpdate(userData._id, { isOnline: true }, { new: true });
                socket.broadcast.emit('user-status-changed', {
                    userId: onlineUser._id,
                    isOnline: true
                });

                socket.emit('connected');
            }
        });

        socket.on('join-chat', (room) => {
            socket.join(room);
            console.log('User joined chat room:', room);
        });

        socket.on('new-message', (newMessageReceived) => {
            if (!newMessageReceived || !newMessageReceived.chat) {
                console.log('Received null or malformed message:', newMessageReceived);
                return;
            }
            const chat = newMessageReceived.chat;
            if (!chat.participants) return console.log('Chat participants not defined');
            socket.in(chat._id).emit('message-received', newMessageReceived);
        });

        socket.on('message-edited', (updatedMessage) => {
            socket.in(updatedMessage.chat._id).emit('message-updated', updatedMessage);
        });

        socket.on('message-deleted', (data) => {
            socket.in(data.chatId).emit('message-removed', data.messageId);
        });

        socket.on("message-reacted", (updatedMessage) => {
            const chat = updatedMessage.chat;
            if (!chat.participants) return;
            chat.participants.forEach(user => {
                if (user._id == updatedMessage.sender._id) return;
                socket.in(user._id).emit("reaction-updated", updatedMessage);
            });
        });

        socket.on("message-pinned", (updatedChat) => {
            if (!updatedChat.participants) return;
            updatedChat.participants.forEach(user => {
                socket.in(user._id).emit("chat-pinned-updated", updatedChat);
            });
        });

        socket.on('mark-as-read', async (data) => {
            const { chatId, userId } = data;
            try {
                await Message.updateMany(
                    { chat: chatId, sender: { $ne: userId }, isRead: false },
                    { $set: { isRead: true } }
                );
                socket.in(chatId).emit('messages-read', { chatId, readerId: userId });
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        });

        socket.on('typing', (room) => socket.in(room).emit('typing', room));
        socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing', room));

        socket.on('disconnect', async () => {
            console.log('USER DISCONNECTED');
            if (currentUserData) {
                const user = await User.findById(currentUserData._id);
                if (user) {
                    user.isOnline = false;
                    user.lastSeen = Date.now();
                    await user.save();
                    socket.broadcast.emit('user-status-changed', {
                        userId: user._id,
                        isOnline: false,
                        lastSeen: user.lastSeen
                    });
                }
            }
        });
    });
};

module.exports = socketHandler;
