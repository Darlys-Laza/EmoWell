const mongoose = require('mongoose');

const ContactoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    telefono: {
        type: String,
        trim: true,
        default: ''
    },
    servicioInteres: {
        type: String,
        trim: true,
        default: 'General'
    },
    mensaje: {
        type: String,
        required: true,
        trim: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'contactado', 'atendido'],
        default: 'pendiente'
    },
    fecha: {
        type: String,
        default: () => new Date().toLocaleDateString('es-CO')
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contacto', ContactoSchema);
