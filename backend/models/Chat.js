const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        chatName: {
            type: String,
            trim: true,
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
