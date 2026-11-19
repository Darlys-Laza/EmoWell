const mongoose = require('mongoose');

const MuroItemSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    tipo: {
        type: String,
        required: true,
        trim: true
    },
    titulo: {
        type: String,
        default: '',
        trim: true
    },
    categoria: {
        type: String,
        default: 'Inspiración'
    },
    url: {
        type: String,
        default: null
    },
    archivoData: {
        type: String,
        default: null
    },
    archivoTipo: {
        type: String,
        default: null
    },
    completada: {
        type: Boolean,
        default: false
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

module.exports = mongoose.models.MuroItem || mongoose.model('MuroItem', MuroItemSchema);
