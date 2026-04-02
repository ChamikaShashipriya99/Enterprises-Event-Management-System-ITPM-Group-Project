const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: ['DELETE', 'PIN', 'UNPIN', 'ANNOUNCEMENT', 'CLEAR_CHAT', 'USER_DELETE'],
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetMessage: {
            type: String, // Storing ID or content snippet
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        },
        details: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
