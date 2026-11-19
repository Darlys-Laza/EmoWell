const mongoose = require('mongoose');

const MensajeSubSchema = new mongoose.Schema({
    emisor: {
        type: String,
        enum: ['usuario', 'emowell'],
        required: true
    },
    texto: {
        type: String,
        required: true
    },
    esAlerta: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const ChatLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    mensajes: {
        type: [MensajeSubSchema],
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.ChatLog || mongoose.model('ChatLog', ChatLogSchema);
