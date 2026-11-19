const mongoose = require('mongoose');

const EmocionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    emocion: {
        type: String,
        required: true
    },
    nivel: {
        type: String,
        default: 'moderado'
    },
    respuestas: {
        type: Array,
        default: []
    },
    nota: {
        type: String,
        default: ''
    },
    fecha: {
        type: String,
        default: () => new Date().toLocaleDateString('es-ES')
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Emocion || mongoose.model('Emocion', EmocionSchema);
