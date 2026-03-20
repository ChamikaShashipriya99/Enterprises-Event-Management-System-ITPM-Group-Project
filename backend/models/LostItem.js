const mongoose = require('mongoose');

const lostItemSchema = mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, 'Please specify if the item is Lost or Found'],
            enum: ['Lost', 'Found'],
        },
        itemName: {
            type: String,
            required: [true, 'Please provide an item name'],
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: ['Electronics', 'Clothing', 'Wallet', 'Keys', 'Other'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        location: {
            type: String,
            required: [true, 'Please provide the location'],
        },
        date: {
            type: Date,
            required: [true, 'Please provide the date it was lost/found'],
        },
        image: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Active', 'Resolved'],
            default: 'Active',
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('LostItem', lostItemSchema);
