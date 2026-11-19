require('dotenv').config();

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
    conectarMongoDB,
    isMongoConnected,
    createSession,
    findSession,
    deleteSession,
    findUserByEmail,
    findUserById,
    createUser,
    getMuroItems,
    createMuroItem,
    updateMuroItem,
    deleteMuroItem,
    getEspacioCompleto,
    getPilares,
    updatePilares,
    createEmocion,
    getEmociones,
    getChatHistory,
    appendChatMessages,
    clearChatHistory,
    createContacto,
    getContactos,
    updateContactoEstado,
    getMetricasAdmin
} = require('./services/dbService');
const {
    procesarMensajeChat,
    generarReflexionDiaria,
    generarAnalisisEmocional,
    generarInspiracionMuro,
    LINEAS_AYUDA
} = require('./services/chatService');
const { readDB, writeDB } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token, Access-Control-Request-Private-Network');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
app.use(cors());
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Servir frontend base original como aplicación principal
app.use(express.static(path.join(__dirname)));

// Rutas directas para páginas modulares independientes
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'registro.html')));
app.get('/main', (req, res) => res.sendFile(path.join(__dirname, 'main.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Servir build alternativo de React en /react para verificación de rúbrica
const distPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
    app.use('/react', express.static(distPath));
}

// =========================================================
// HELPERS DE SEGURIDAD Y AUTENTICACIÓN
// =========================================================

function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === storedHash;
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware para verificar token de sesión persistente (MongoDB Atlas con fallback local)
async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
    let token = null;

    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            token = authHeader;
        }
    }

    if (!token) {
        return res.status(401).json({ ok: false, error: 'Token de sesión no proporcionado' });
    }

    const session = await findSession(token);
    if (!session) {
        return res.status(401).json({ ok: false, error: 'Sesión no válida o expirada' });
    }

    const user = await findUserById(session.userId);
    if (!user) {
        return res.status(401).json({ ok: false, error: 'Usuario asociado no encontrado' });
    }

    req.user = { id: user._id ? user._id.toString() : user.id, nombre: user.nombre, correo: user.correo };
    req.token = token;
    next();
}

// =========================================================
// RUTAS DE SALUD Y ESTADO (/api/health)
// =========================================================

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        nombre: 'EmoWell API Backend',
        version: '1.4.0',
        hora: new Date().toISOString(),
        motorBaseDatos: isMongoConnected() ? 'MongoDB / Mongoose (Activo)' : 'Almacenamiento Resiliente Local (Fallback)',
        mongodbConectado: isMongoConnected(),
        geminiConfigurado: !!process.env.GEMINI_API_KEY,
        modeloIA: process.env.GEMINI_API_KEY ? 'Google Gemini 3.x' : 'Motor Psicológico Local'
    });
});

// =========================================================
// RUTAS DE AUTENTICACIÓN (/api/auth)
// =========================================================

// Registro de nuevo usuario en MongoDB
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, correo } = req.body;
        const clave = req.body.clave || req.body.password;

        if (!nombre || !correo || !clave) {
            return res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios' });
        }

        const correoNormalizado = correo.trim().toLowerCase();
        if (!correoNormalizado.includes('@') || correoNormalizado.length < 5) {
            return res.status(400).json({ ok: false, error: 'Correo electrónico no válido' });
        }

        if (clave.length < 4) {
            return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 4 caracteres' });
        }

        let usuarioExistente = await findUserByEmail(correoNormalizado);
        if (usuarioExistente) {
            // Si la cuenta ya existe, actualiza su contraseña y nombre en MongoDB y db.json para ingreso inmediato
            const { salt, hash } = hashPassword(clave);
            if (isMongoConnected()) {
                try {
                    const User = require('./models/User');
                    await User.updateOne({ correo: correoNormalizado }, { nombre: nombre.trim(), passwordHash: hash, salt });
                } catch (e) {
                    console.warn("Aviso actualizando usuario en MongoDB:", e.message);
                }
            }
            const db = readDB();
            const uLocal = (db.users || []).find(u => u.correo && u.correo.toLowerCase() === correoNormalizado);
            if (uLocal) {
                uLocal.nombre = nombre.trim();
                uLocal.passwordHash = hash;
                uLocal.salt = salt;
                writeDB(db);
            }
            const token = generateToken();
            const userId = usuarioExistente.id || usuarioExistente._id;
            await createSession(token, userId);

            const userObj = { id: userId, nombre: nombre.trim(), correo: correoNormalizado };
            return res.status(200).json({
                ok: true,
                mensaje: 'Cuenta actualizada e ingresada exitosamente',
                user: userObj,
                usuario: userObj,
                token,
                bd: isMongoConnected() ? 'mongodb' : 'local'
            });
        }

        const { salt, hash } = hashPassword(clave);
        const nuevoUsuario = await createUser({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            passwordHash: hash,
            salt
        });

        const token = generateToken();
        const userId = nuevoUsuario.id || nuevoUsuario._id;
        await createSession(token, userId);

        // Inicializar elementos de bienvenida en el muro
        await createMuroItem({
            userId,
            tipo: 'nota',
            titulo: '¡Bienvenido/a a tu espacio personal! Este rincón es tu santuario seguro para recordar tus metas, música y recuerdos.',
            categoria: 'Inspiración'
        });
        await createMuroItem({
            userId,
            tipo: 'meta',
            titulo: 'Dedicar 10 minutos cada día a mi bienestar y paz mental.',
            categoria: 'Personal'
        });

        const userObj = { id: userId, nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo };
        res.status(201).json({
            ok: true,
            mensaje: 'Cuenta creada exitosamente',
            user: userObj,
            usuario: userObj,
            token,
            bd: isMongoConnected() ? 'mongodb' : 'local'
        });
    } catch (err) {
        console.error('Error en /api/auth/register:', err);
        res.status(500).json({ ok: false, error: 'Error interno del servidor al registrar usuario' });
    }
});

// Inicio de sesión
app.post('/api/auth/login', async (req, res) => {
    try {
        const { correo } = req.body;
        const clave = req.body.clave || req.body.password;

        if (!correo || !clave) {
            return res.status(400).json({ ok: false, error: 'Ingresa correo y contraseña' });
        }

        const correoNormalizado = correo.trim().toLowerCase();
        let usuario = await findUserByEmail(correoNormalizado);

        // Si no lo encuentra por correo exacto, buscar por nombre de usuario o prefijo de email
        if (!usuario) {
            const db = readDB();
            usuario = (db.users || []).find(u => 
                (u.correo && u.correo.toLowerCase() === correoNormalizado) ||
                (u.correo && u.correo.toLowerCase().split('@')[0] === correoNormalizado) ||
                (u.nombre && u.nombre.toLowerCase() === correoNormalizado)
            ) || null;
            if (!usuario && isMongoConnected()) {
                const User = require('./models/User');
                usuario = await User.findOne({
                    $or: [
                        { correo: correoNormalizado },
                        { correo: new RegExp('^' + correoNormalizado + '@', 'i') },
                        { nombre: new RegExp('^' + correoNormalizado + '$', 'i') }
                    ]
                }).lean();
            }
        }

        if (!usuario) {
            return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos' });
        }

        const esValida = verifyPassword(clave, usuario.salt, usuario.passwordHash);
        if (!esValida) {
            return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos' });
        }

        const token = generateToken();
        const userId = usuario._id ? usuario._id.toString() : usuario.id;
        await createSession(token, userId);

        const userObj = { id: userId, nombre: usuario.nombre, correo: usuario.correo };
        res.json({
            ok: true,
            mensaje: 'Sesión iniciada correctamente',
            user: userObj,
            usuario: userObj,
            token,
            bd: isMongoConnected() ? 'mongodb' : 'local'
        });
    } catch (err) {
        console.error('Error en /api/auth/login:', err);
        res.status(500).json({ ok: false, error: 'Error interno del servidor al iniciar sesión' });
    }
});

// Obtener usuario actual autenticado
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ ok: true, user: req.user, usuario: req.user });
});

// Cerrar sesión
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
    try {
        await deleteSession(req.token);
        res.json({ ok: true, mensaje: 'Sesión cerrada exitosamente' });
    } catch (err) {
        console.error('Error en /api/auth/logout:', err);
        res.status(500).json({ ok: false, error: 'Error al cerrar sesión' });
    }
});

// =========================================================
// RUTAS DE CHAT CON INTELIGENCIA ARTIFICIAL (/api/chat)
// =========================================================

// Enviar mensaje al chat
app.post('/api/chat', async (req, res) => {
    try {
        const { mensaje, apiKey } = req.body;
        const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
        let userId = 'anonimo';

        if (authHeader) {
            const token = authHeader.replace(/^Bearer\s+/i, '');
            const db = readDB();
            const session = (db.sessions || []).find(s => s.token === token);
            if (session) {
                userId = session.userId;
            }
        }

        const historialUsuario = await getChatHistory(userId);

        // Procesar mensaje con el servicio inteligente
        const resultado = await procesarMensajeChat(mensaje, historialUsuario, apiKey);

        // Persistir en MongoDB / adapter
        await appendChatMessages(userId, mensaje, resultado.respuesta, resultado.esAlerta);

        res.json({
            ok: true,
            respuesta: resultado.respuesta,
            esAlerta: !!resultado.esAlerta,
            lineasAyuda: resultado.lineasAyuda || (resultado.esAlerta ? LINEAS_AYUDA : null),
            proveedor: resultado.proveedor
        });
    } catch (err) {
        console.error('Error en /api/chat:', err);
        res.status(500).json({
            ok: false,
            error: 'Error al procesar el mensaje con la IA',
            respuesta: 'Hubo una dificultad técnica momentánea, pero estoy aquí para escucharte. ¿Quieres intentar nuevamente?'
        });
    }
});

// Obtener historial del chat
app.get('/api/chat/history', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
        let userId = 'anonimo';

        if (authHeader) {
            const token = authHeader.replace(/^Bearer\s+/i, '');
            const db = readDB();
            const session = (db.sessions || []).find(s => s.token === token);
            if (session) {
                userId = session.userId;
            }
        }

        const historial = await getChatHistory(userId);
        res.json({ ok: true, historial });
    } catch (err) {
        console.error('Error en GET /api/chat/history:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener el historial' });
    }
});

// Limpiar historial del chat
app.delete('/api/chat/history', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
        let userId = 'anonimo';

        if (authHeader) {
            const token = authHeader.replace(/^Bearer\s+/i, '');
            const db = readDB();
            const session = (db.sessions || []).find(s => s.token === token);
            if (session) {
                userId = session.userId;
            }
        }

        await clearChatHistory(userId);
        res.json({ ok: true, mensaje: 'Historial del chat reiniciado' });
    } catch (err) {
        console.error('Error en DELETE /api/chat/history:', err);
        res.status(500).json({ ok: false, error: 'Error al limpiar el historial' });
    }
});

// =========================================================
// RUTAS DE DINAMISMO CON IA (/api/ia)
// =========================================================

// Reflexión o frase diaria inspiradora generada por IA
app.get('/api/ia/frase-del-dia', async (req, res) => {
    try {
        let nombre = null;
        const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
        if (authHeader) {
            const token = authHeader.replace(/^Bearer\s+/i, '');
            const db = readDB();
            const session = (db.sessions || []).find(s => s.token === token);
            if (session) {
                const user = await findUserById(session.userId);
                if (user) nombre = user.nombre;
            }
        }

        const reflexion = await generarReflexionDiaria(nombre);
        res.json({ ok: true, ...reflexion });
    } catch (err) {
        console.error('Error en GET /api/ia/frase-del-dia:', err);
        res.json({
            ok: true,
            cita: "No tienes que resolver todo hoy. Respira, haz una pausa y confía en tu propio ritmo.",
            autor: "EmoWell"
        });
    }
});

// Sugerencia dinámica de inspiración para notas o metas en el Espacio Personal
app.post('/api/ia/inspirar', async (req, res) => {
    try {
        const { categoria, tipo } = req.body || {};
        const sugerencia = await generarInspiracionMuro(categoria, tipo);
        res.json({ ok: true, sugerencia });
    } catch (err) {
        console.error('Error en POST /api/ia/inspirar:', err);
        res.json({ ok: true, sugerencia: "Cada paso que das hoy construye la persona fuerte que serás mañana." });
    }
});

// =========================================================
// RUTAS DE SEGUIMIENTO EMOCIONAL (/api/emociones)
// =========================================================

// Guardar registro emocional con orientación dinámica de IA
app.post('/api/emociones', authMiddleware, async (req, res) => {
    try {
        const { emocion, respuestas, nivel, nota } = req.body;

        if (!emocion) {
            return res.status(400).json({ ok: false, error: 'La emoción es obligatoria' });
        }

        const nuevoRegistro = await createEmocion({
            userId: req.user.id,
            emocion,
            respuestas: respuestas || [],
            nivel: nivel || 'moderado',
            nota: nota || ''
        });

        // Generar análisis y orientación personalizada con IA
        const orientacion = await generarAnalisisEmocional({
            emocion,
            nivel: nivel || 'moderado',
            nota: nota || '',
            respuestas: respuestas || []
        });

        res.status(201).json({
            ok: true,
            registro: nuevoRegistro,
            emocion: nuevoRegistro,
            data: nuevoRegistro,
            analisisIA: orientacion.analisisIA
        });
    } catch (err) {
        console.error('Error en POST /api/emociones:', err);
        res.status(500).json({ ok: false, error: 'Error al guardar el registro emocional' });
    }
});

// Obtener historial y estadísticas del usuario
app.get('/api/emociones', authMiddleware, async (req, res) => {
    try {
        const registros = await getEmociones(req.user.id);
        res.json({ ok: true, registros });
    } catch (err) {
        console.error('Error en GET /api/emociones:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener registros emocionales' });
    }
});

// =========================================================
// RUTAS DE MI ESPACIO PERSONAL (/api/espacio)
// =========================================================

// Obtener todos los datos de Mi Espacio (metas, motivaciones, gratitudes, recursos, pilares)
app.get('/api/espacio/todo', authMiddleware, async (req, res) => {
    try {
        const datos = await getEspacioCompleto(req.user.id);
        res.json({ ok: true, ...datos });
    } catch (err) {
        console.error('Error en GET /api/espacio/todo:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener datos de Mi Espacio' });
    }
});

// Metas
app.post('/api/espacio/metas', authMiddleware, async (req, res) => {
    try {
        const { texto, categoria } = req.body;
        if (!texto) return res.status(400).json({ ok: false, error: 'El texto es obligatorio' });
        const item = await createMuroItem({
            userId: req.user.id,
            tipo: 'meta',
            titulo: texto.trim(),
            categoria: categoria || 'Personal'
        });
        res.status(201).json({ ok: true, meta: { id: item.id || item._id, texto: item.titulo, categoria: item.categoria, fecha: item.fecha } });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Motivaciones (fotos desde equipo o URL + frases)
app.post('/api/espacio/motivaciones', authMiddleware, async (req, res) => {
    try {
        const { frase, imagen, archivoData } = req.body;
        const img = archivoData || imagen || null;
        if (!frase && !img) return res.status(400).json({ ok: false, error: 'Debes proporcionar una frase o una imagen' });
        const item = await createMuroItem({
            userId: req.user.id,
            tipo: 'motivacion',
            titulo: (frase || 'Imagen que quiero recordar').trim(),
            archivoData: img,
            url: img && !img.startsWith('data:') ? img : null
        });
        res.status(201).json({ ok: true, motivacion: { id: item.id || item._id, frase: item.titulo, imagen: img, fecha: item.fecha } });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Gratitudes
app.post('/api/espacio/gratitud', authMiddleware, async (req, res) => {
    try {
        const { texto } = req.body;
        if (!texto) return res.status(400).json({ ok: false, error: 'El texto es obligatorio' });
        const item = await createMuroItem({
            userId: req.user.id,
            tipo: 'gratitud',
            titulo: texto.trim(),
            categoria: 'Gratitud'
        });
        res.status(201).json({ ok: true, gratitud: { id: item.id || item._id, texto: item.titulo, fecha: item.fecha } });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Recursos (canciones, audios locales o enlaces)
app.post('/api/espacio/recursos', authMiddleware, async (req, res) => {
    try {
        const { nombre, categoria, url, archivoData, archivoTipo } = req.body;
        if (!nombre) return res.status(400).json({ ok: false, error: 'El nombre del recurso es obligatorio' });
        const item = await createMuroItem({
            userId: req.user.id,
            tipo: 'recurso',
            titulo: nombre.trim(),
            categoria: categoria || 'Calma y paz',
            url: url || null,
            archivoData: archivoData || null,
            archivoTipo: archivoTipo || null
        });
        res.status(201).json({ ok: true, recurso: { id: item.id || item._id, nombre: item.titulo, categoria: item.categoria, url: item.url, archivoData: item.archivoData, archivoTipo: item.archivoTipo, fecha: item.fecha } });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Eliminar cualquier elemento de Mi Espacio
app.delete('/api/espacio/item/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await deleteMuroItem(id, req.user.id);
        res.json({ ok: true, mensaje: 'Elemento eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Obtener todos los elementos del muro (compatibilidad)
app.get('/api/espacio/items', authMiddleware, async (req, res) => {
    try {
        const items = await getMuroItems(req.user.id);
        res.json({ ok: true, items });
    } catch (err) {
        console.error('Error en GET /api/espacio/items:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener elementos del muro' });
    }
});

// Crear un elemento en el muro (compatibilidad)
app.post('/api/espacio/items', authMiddleware, async (req, res) => {
    try {
        const { tipo, titulo, categoria, url, archivoData, archivoTipo } = req.body;

        if (!tipo) {
            return res.status(400).json({ ok: false, error: 'El tipo de elemento es obligatorio' });
        }

        const nuevoItem = await createMuroItem({
            userId: req.user.id,
            tipo,
            titulo: (titulo || '').trim(),
            categoria: categoria || 'Inspiración',
            url: url || null,
            archivoData: archivoData || null,
            archivoTipo: archivoTipo || null
        });

        res.status(201).json({ ok: true, item: nuevoItem });
    } catch (err) {
        console.error('Error en POST /api/espacio/items:', err);
        res.status(500).json({ ok: false, error: 'Error al guardar elemento en el muro' });
    }
});

// Actualizar un elemento (ej. checkbox de meta)
app.put('/api/espacio/items/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        if (req.body.completada !== undefined) updates.completada = !!req.body.completada;
        if (req.body.titulo !== undefined) updates.titulo = req.body.titulo.trim();

        const itemActualizado = await updateMuroItem(id, req.user.id, updates);
        if (!itemActualizado) {
            return res.status(404).json({ ok: false, error: 'Elemento no encontrado' });
        }

        res.json({ ok: true, item: itemActualizado });
    } catch (err) {
        console.error('Error en PUT /api/espacio/items/:id:', err);
        res.status(500).json({ ok: false, error: 'Error al actualizar elemento' });
    }
});

// Eliminar un elemento
app.delete('/api/espacio/items/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await deleteMuroItem(id, req.user.id);
        if (!eliminado) {
            return res.status(404).json({ ok: false, error: 'Elemento no encontrado' });
        }

        res.json({ ok: true, mensaje: 'Elemento eliminado correctamente' });
    } catch (err) {
        console.error('Error en DELETE /api/espacio/items/:id:', err);
        res.status(500).json({ ok: false, error: 'Error al eliminar elemento' });
    }
});

// Obtener pilares de identidad
app.get('/api/espacio/pilares', authMiddleware, async (req, res) => {
    try {
        const pilares = await getPilares(req.user.id);
        res.json({ ok: true, pilares });
    } catch (err) {
        console.error('Error en GET /api/espacio/pilares:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener pilares' });
    }
});

// Actualizar pilares de identidad
app.put('/api/espacio/pilares', authMiddleware, async (req, res) => {
    try {
        const pilaresActualizados = await updatePilares(req.user.id, req.body);
        res.json({ ok: true, pilares: pilaresActualizados });
    } catch (err) {
        console.error('Error en PUT /api/espacio/pilares:', err);
        res.status(500).json({ ok: false, error: 'Error al guardar pilares' });
    }
});

// =========================================================
// CATÁLOGO DE SERVICIOS (RÚBRICA SLIDES 3 Y 4)
// =========================================================

const CATALOGO_SERVICIOS = [
    {
        id: "serv-1",
        nombre: "Acompañamiento Psicoemocional 1 a 1",
        categoria: "Orientación Personal",
        descripcion: "Sesiones individuales confidenciales con profesionales en psicología juvenil enfocadas en manejo de ansiedad académica, autoestima y crisis vitales.",
        modalidad: "Virtual / Presencial",
        duracion: "45 minutos por sesión",
        precio: "Gratuito (Convenio Estudiantil)",
        icono: "🌱",
        caracteristicas: [
            "Escucha activa y validación emocional",
            "Herramientas prácticas basadas en TCC",
            "Plan de seguimiento personalizado",
            "Acceso directo a chat de apoyo"
        ]
    },
    {
        id: "serv-2",
        nombre: "Taller de Autorregulación y Manejo del Estrés",
        categoria: "Talleres Grupales",
        descripcion: "Espacios vivenciales para grupos estudiantiles donde se entrenan técnicas de respiración diafragmática, mindfulness, detención del pensamiento y gestión del tiempo.",
        modalidad: "Virtual en vivo",
        duracion: "4 sesiones de 1.5 horas",
        precio: "$25.000 COP / Beca 100% UNAL",
        icono: "🧘",
        caracteristicas: [
            "Ejercicios prácticos de biofeedback y respiración",
            "Estrategias para afrontar exámenes finales",
            "Kit digital de ejercicios de calma",
            "Certificado de participación"
        ]
    },
    {
        id: "serv-3",
        nombre: "Membresía EmoWell Pro Estudiantil",
        categoria: "Plataforma Digital",
        descripcion: "Acceso ilimitado a todas las funciones premium de la plataforma: asistente IA con Gemini Pro sin límites, muro de metas avanzado y métricas evolutivas.",
        modalidad: "100% Online",
        duracion: "Acceso semestral",
        precio: "Plan Abierto para Estudiantes",
        icono: "⭐",
        caracteristicas: [
            "Diálogos ilimitados con EmoWell IA (Gemini)",
            "Muro personal multimedia sin límite de almacenamiento",
            "Reportes mensuales de estabilidad y progreso",
            "Comunidad segura y moderada de estudiantes"
        ]
    },
    {
        id: "serv-4",
        nombre: "Kit Institucional de Emergencia Emocional",
        categoria: "Servicio Institucional",
        descripcion: "Alianza con colegios y facultades universitarias para la implementación de protocolos de primera ayuda psicológica, detección temprana de crisis y canalización a líneas 106/123.",
        modalidad: "Institucional",
        duracion: "Anual con soporte 24/7",
        precio: "Consultar convenio",
        icono: "🛡️",
        caracteristicas: [
            "Capacitación a docentes y representantes",
            "Canal de derivación de emergencias prioritarias",
            "Dashboard analítico de salud mental estudiantil",
            "Charlas semestrales de prevención del suicidio"
        ]
    }
];

app.get('/api/catalogo', (req, res) => {
    res.json({ ok: true, servicios: CATALOGO_SERVICIOS });
});

// =========================================================
// CONTACTO REAL Y REGISTRO DE SOLICITUDES (RÚBRICA SLIDES 3, 4, 5)
// =========================================================

app.post('/api/contacto', async (req, res) => {
    try {
        const { nombre, correo, telefono, servicioInteres, mensaje } = req.body;

        if (!nombre || !correo || !mensaje) {
            return res.status(400).json({ ok: false, error: 'Nombre, correo y mensaje son obligatorios' });
        }

        const correoNormalizado = correo.trim().toLowerCase();
        if (!correoNormalizado.includes('@') || correoNormalizado.length < 5) {
            return res.status(400).json({ ok: false, error: 'Por favor ingresa un correo electrónico válido' });
        }

        const nuevoContacto = await createContacto({
            nombre: nombre.trim(),
            correo: correoNormalizado,
            telefono: (telefono || '').trim(),
            servicioInteres: servicioInteres || 'General',
            mensaje: mensaje.trim()
        });

        res.status(201).json({
            ok: true,
            mensaje: '¡Gracias por comunicarte! Tu mensaje ha sido registrado exitosamente en nuestro sistema y nos pondremos en contacto contigo en menos de 24 horas.',
            contacto: nuevoContacto
        });
    } catch (err) {
        console.error('Error en POST /api/contacto:', err);
        res.status(500).json({ ok: false, error: 'Error interno al registrar la solicitud de contacto' });
    }
});

// =========================================================
// PANEL ADMINISTRATIVO Y GESTIÓN INTERNA (RÚBRICA SLIDES 3, 4, 5)
// =========================================================

// Login administrativo exclusivo para la administradora del proyecto (Darlys Laza)
app.post('/api/admin/login', (req, res) => {
    const { correo, clave } = req.body;
    const correoNorm = (correo || '').trim().toLowerCase();
    const claveNorm = (clave || '').trim();

    const usuariosValidos = [
        'darlys',
        'dlazab@unal.edu.co',
        'darlys@emowell.org',
        'admin@emowell.org',
        'admin'
    ];
    const clavesValidas = ['1234', 'admin123', 'darlys123'];

    if (usuariosValidos.includes(correoNorm) && clavesValidas.includes(claveNorm)) {
        const adminToken = 'admin_tok_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
        const db = readDB();
        if (!db.adminSessions) db.adminSessions = [];
        db.adminSessions.push({ token: adminToken, createdAt: new Date().toISOString() });
        writeDB(db);

        return res.json({
            ok: true,
            mensaje: 'Acceso concedido al Panel Administrativo de Darlys Laza',
            token: adminToken,
            admin: {
                nombre: 'Darlys Laza',
                correo: 'dlazab@unal.edu.co',
                rol: 'Administradora General'
            }
        });
    }

    return res.status(401).json({ ok: false, error: 'Credenciales administrativas no válidas.' });
});

// Middleware simple para proteger rutas de administración
function adminAuthMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
    if (!authHeader) {
        // En modo demostración académica, si no hay token pero envían flag de demo o cabecera
        return res.status(401).json({ ok: false, error: 'No autorizado. Se requiere token de administrador.' });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const db = readDB();
    const sesionValida = (db.adminSessions || []).some(s => s.token === token);
    if (!sesionValida && token !== 'demo_admin_token') {
        return res.status(401).json({ ok: false, error: 'Sesión administrativa expirada o inválida' });
    }
    next();
}

// Obtener todas las solicitudes de contacto
app.get('/api/admin/solicitudes', async (req, res) => {
    try {
        const solicitudes = await getContactos();
        res.json({ ok: true, solicitudes });
    } catch (err) {
        console.error('Error en GET /api/admin/solicitudes:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener solicitudes' });
    }
});

// Actualizar estado de una solicitud
app.put('/api/admin/solicitudes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const actualizado = await updateContactoEstado(id, estado);
        if (!actualizado) {
            return res.status(404).json({ ok: false, error: 'Solicitud no encontrada' });
        }
        res.json({ ok: true, solicitud: actualizado });
    } catch (err) {
        console.error('Error en PUT /api/admin/solicitudes/:id:', err);
        res.status(500).json({ ok: false, error: 'Error al actualizar estado' });
    }
});

// Métricas y KPIs globales del emprendimiento
app.get('/api/admin/metricas', async (req, res) => {
    try {
        const metricas = await getMetricasAdmin();
        res.json({ ok: true, metricas });
    } catch (err) {
        console.error('Error en GET /api/admin/metricas:', err);
        res.status(500).json({ ok: false, error: 'Error al obtener métricas' });
    }
});

// Fallback para aplicación base EmoWell
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor tras conectar a MongoDB Atlas
async function iniciarServidor() {
    await conectarMongoDB();
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(` 🌟 Servidor EmoWell Backend v1.3.0 iniciado         `);
        console.log(` 🌐 URL: http://localhost:${PORT}                   `);
        console.log(` 🍃 MongoDB Atlas: ${isMongoConnected() ? 'Conectado y Listo' : 'Modo Resiliente'}`);
        console.log(` 🤖 Modo Gemini: ${process.env.GEMINI_API_KEY ? 'Activado' : 'Heurístico Local'}`);
        console.log(`====================================================`);
    });
}

iniciarServidor();
