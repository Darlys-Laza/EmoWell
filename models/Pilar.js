const mongoose = require('mongoose');

const PilarSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    fortalezas: {
        type: String,
        default: "Soy resiliente, reflexivo/a y tengo la capacidad de aprender y comenzar de nuevo."
    },
    disfruto: {
        type: String,
        default: "Escuchar buena música, pasear al aire libre, conversar en confianza y momentos de tranquilidad."
    },
    valoro: {
        type: String,
        default: "La honestidad, la paz mental, el respeto propio y la empatía con los demás."
    },
    recordatorio: {
        type: String,
        default: "Esto que siento es temporal. No tengo que tener todo resuelto hoy; un día a la vez es suficiente."
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Pilar || mongoose.model('Pilar', PilarSchema);
