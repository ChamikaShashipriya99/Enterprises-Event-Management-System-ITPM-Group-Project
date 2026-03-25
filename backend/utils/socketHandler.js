const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('setup', (userData) => {
            if (userData && userData._id) {
                socket.join(userData._id);
                console.log('User joined room:', userData._id);
                socket.emit('connected');
            }
        });

        socket.on('join-chat', (room) => {
            socket.join(room);
            console.log('User joined chat room:', room);
        });

        socket.on('new-message', (newMessageReceived) => {
            const chat = newMessageReceived.chat;

            if (!chat.participants) return console.log('Chat participants not defined');

            // Emit to the chat room directly
            socket.in(chat._id).emit('message-received', newMessageReceived);
        });

        socket.on('typing', (room) => socket.in(room).emit('typing', room));
        socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing', room));

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
