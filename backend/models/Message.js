const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        reactions: [
            {
                emoji: String,
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
            }
        ],
        fileUrl: {
            type: String,
        },
        fileType: {
            type: String,
            enum: ['text', 'image', 'file', 'audio'],
            default: 'text',
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeletedByAdmin: {
            type: Boolean,
            default: false,
        },
        isAnnouncement: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
