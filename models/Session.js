const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d'
    }
});

module.exports = mongoose.models.Session || mongoose.model('Session', SessionSchema);
