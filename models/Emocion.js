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
        type: mongoose.Schema.Types.Mixed,
        default: '3.0'
    },
    etiqueta: {
        type: String,
        default: 'Moderado'
    },
    mensajeOrientador: {
        type: String,
        default: ''
    },
    semanaMes: {
        type: String,
        default: ''
    },
    hora: {
        type: String,
        default: ''
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
