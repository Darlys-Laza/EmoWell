const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Estructura inicial de la base de datos
const INITIAL_DATA = {
    users: [],
    sessions: [],
    emociones: [],
    muroItems: [],
    pilares: {},
    chatHistory: {}
};

// Asegurar que la carpeta y el archivo existan
function initDB() {
    if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
    }
}

// Leer datos de forma segura
function readDB() {
    initDB();
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Error al leer db.json, reinicializando:', err);
        return { ...INITIAL_DATA };
    }
}

// Escribir datos de forma atómica para evitar corrupción
function writeDB(data) {
    initDB();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
}

module.exports = {
    readDB,
    writeDB
};
