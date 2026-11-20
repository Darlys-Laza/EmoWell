/**
 * Servicio Centralizado de API para EmoWell en React
 * Conecta con el backend Node.js/Express + MongoDB
 * y cuenta con fallback a almacenamiento local autónomo si se ejecuta en GitHub Pages
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper genérico para peticiones HTTP
async function request(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = localStorage.getItem('emowell_token');
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.warn(`[API] Fallo de red en ${endpoint}, activando fallback local:`, error.message);
        return { ok: false, error: error.message, isOffline: true };
    }
}

export const api = {
    // -----------------------------------------------------------------
    // SALUD Y CATÁLOGO
    // -----------------------------------------------------------------
    async getHealth() {
        return request('/health');
    },

    async getCatalogo() {
        const res = await request('/catalogo');
        if (res.ok && res.data.servicios) return res.data.servicios;

        // Fallback garantizado
        return [
            {
                id: "serv-1",
                nombre: "Acompañamiento Psicoemocional 1 a 1",
                categoria: "Orientación Personal",
                descripcion: "Sesiones individuales confidenciales con profesionales en psicología juvenil enfocadas en manejo de ansiedad académica, autoestima y crisis vitales.",
                modalidad: "Virtual / Presencial",
                duracion: "45 minutos por sesión",
                precio: "Gratuito (Convenio Estudiantil)",
                icono: "",
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
                precio: "$25.000 COP / Beca 100% EmoWell",
                icono: "",
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
                descripcion: "Acceso ilimitado a todas las funciones premium de la plataforma: módulo de escucha activa y diálogo reflexivo continuo, muro de metas avanzado y métricas evolutivas.",
                modalidad: "100% Online",
                duracion: "Acceso semestral",
                precio: "Plan Abierto para Estudiantes",
                icono: "",
                caracteristicas: [
                    "Diálogos ilimitados de escucha activa y orientación",
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
                icono: "",
                caracteristicas: [
                    "Capacitación a docentes y representantes",
                    "Canal de derivación de emergencias prioritarias",
                    "Dashboard analítico de salud mental estudiantil",
                    "Charlas semestrales de prevención del suicidio"
                ]
            }
        ];
    },

    // -----------------------------------------------------------------
    // CONTACTO
    // -----------------------------------------------------------------
    async enviarContacto(datos) {
        const res = await request('/contacto', {
            method: 'POST',
            body: JSON.stringify(datos)
        });

        if (res.ok) return res.data;

        // Fallback en localStorage
        const contactos = JSON.parse(localStorage.getItem('emowell_contactos_local') || '[]');
        const nuevo = {
            id: 'cont_local_' + Date.now(),
            ...datos,
            estado: 'pendiente',
            fecha: new Date().toLocaleDateString('es-CO')
        };
        contactos.unshift(nuevo);
        localStorage.setItem('emowell_contactos_local', JSON.stringify(contactos));

        return {
            ok: true,
            mensaje: '¡Mensaje guardado localmente! Nos comunicaremos contigo pronto.',
            contacto: nuevo
        };
    },

    // -----------------------------------------------------------------
    // AUTENTICACIÓN
    // -----------------------------------------------------------------
    async login(correo, clave) {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ correo, clave })
        });
    },

    async register(nombre, correo, clave) {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, correo, clave })
        });
    },

    async getMe() {
        return request('/auth/me');
    },

    // -----------------------------------------------------------------
    // PANEL ADMINISTRATIVO
    // -----------------------------------------------------------------
    async adminLogin(correo, clave) {
        return request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ correo, clave })
        });
    },

    async getAdminSolicitudes(adminToken) {
        const res = await request('/admin/solicitudes', {
            headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
        });

        if (res.ok && res.data.solicitudes) return res.data.solicitudes;

        const locales = JSON.parse(localStorage.getItem('emowell_contactos_local') || '[]');
        return locales;
    },

    async updateAdminSolicitud(id, estado, adminToken) {
        const res = await request(`/admin/solicitudes/${id}`, {
            method: 'PUT',
            headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {},
            body: JSON.stringify({ estado })
        });

        if (res.ok) return res.data;

        const locales = JSON.parse(localStorage.getItem('emowell_contactos_local') || '[]');
        const idx = locales.findIndex(c => c.id === id);
        if (idx !== -1) {
            locales[idx].estado = estado;
            localStorage.setItem('emowell_contactos_local', JSON.stringify(locales));
            return { ok: true, solicitud: locales[idx] };
        }
        return { ok: false };
    },

    async getAdminMetricas(adminToken) {
        const res = await request('/admin/metricas', {
            headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
        });

        if (res.ok && res.data.metricas) return res.data.metricas;

        // Fallback local
        const contactos = JSON.parse(localStorage.getItem('emowell_contactos_local') || '[]');
        return {
            totalUsuarios: 12,
            totalContactos: contactos.length + 3,
            pendientesContactos: contactos.filter(c => c.estado === 'pendiente').length + 2,
            totalEmociones: 28,
            emocionesConteo: {
                "Ansiedad": 10,
                "Estrés": 8,
                "Tristeza": 5,
                "Tranquilidad": 5
            },
            motorBD: "Demostración Autónoma"
        };
    },

    // -----------------------------------------------------------------
    // CHAT Y ACOMPAÑAMIENTO EMOCIONAL
    // -----------------------------------------------------------------
    async enviarMensajeChat(mensaje) {
        const res = await request('/chat', {
            method: 'POST',
            body: JSON.stringify({ mensaje })
        });

        if (res.ok && res.data.respuesta) return res.data;

        // Fallback empático
        return {
            ok: true,
            respuesta: "Estoy aquí para escucharte y acompañarte. Reconocer lo que sientes es un paso de mucha valentía. ¿Quieres contarme un poco más sobre lo que está pasando en tu mente?",
            esAlerta: false,
            proveedor: "local"
        };
    },

    async getChatHistory() {
        const res = await request('/chat/history');
        if (res.ok && res.data.historial) return res.data.historial;
        return [];
    },

    async clearChatHistory() {
        return request('/chat/history', { method: 'DELETE' });
    },

    // -----------------------------------------------------------------
    // REFLEXIONES E INSPIRACIÓN
    // -----------------------------------------------------------------
    async getFraseDelDia() {
        const res = await request('/ia/frase-del-dia');
        if (res.ok && res.data.cita) return res.data;
        return {
            cita: "No tienes que resolver toda tu vida hoy; solo concéntrate en dar el siguiente paso con calma.",
            autor: "EmoWell"
        };
    },

    async getInspiracion(categoria, tipo) {
        const res = await request('/ia/inspirar', {
            method: 'POST',
            body: JSON.stringify({ categoria, tipo })
        });
        if (res.ok && res.data.sugerencia) return res.data.sugerencia;
        return "Cada pequeño paso que das hoy construye la persona fuerte que serás mañana.";
    },

    // -----------------------------------------------------------------
    // SEGUIMIENTO EMOCIONAL
    // -----------------------------------------------------------------
    async guardarEmocion(datos) {
        return request('/emociones', {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    async getEmociones() {
        const res = await request('/emociones');
        if (res.ok && res.data.registros) return res.data.registros;
        return [];
    },

    // -----------------------------------------------------------------
    // MI ESPACIO PERSONAL
    // -----------------------------------------------------------------
    async getMuroItems() {
        const res = await request('/espacio/items');
        if (res.ok && res.data.items) return res.data.items;
        return JSON.parse(localStorage.getItem('emowell_muro_local') || '[]');
    },

    async createMuroItem(item) {
        const res = await request('/espacio/items', {
            method: 'POST',
            body: JSON.stringify(item)
        });
        if (res.ok && res.data.item) return res.data.item;

        const locales = JSON.parse(localStorage.getItem('emowell_muro_local') || '[]');
        const nuevo = { id: 'muro_' + Date.now(), ...item, fecha: new Date().toLocaleDateString('es-CO') };
        locales.unshift(nuevo);
        localStorage.setItem('emowell_muro_local', JSON.stringify(locales));
        return nuevo;
    },

    async updateMuroItem(id, updates) {
        const res = await request(`/espacio/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        if (res.ok && res.data.item) return res.data.item;

        const locales = JSON.parse(localStorage.getItem('emowell_muro_local') || '[]');
        const idx = locales.findIndex(i => i.id === id);
        if (idx !== -1) {
            locales[idx] = { ...locales[idx], ...updates };
            localStorage.setItem('emowell_muro_local', JSON.stringify(locales));
            return locales[idx];
        }
        return null;
    },

    async deleteMuroItem(id) {
        const res = await request(`/espacio/items/${id}`, { method: 'DELETE' });
        if (res.ok) return true;

        const locales = JSON.parse(localStorage.getItem('emowell_muro_local') || '[]');
        const filtrados = locales.filter(i => i.id !== id);
        localStorage.setItem('emowell_muro_local', JSON.stringify(filtrados));
        return true;
    },

    async getPilares() {
        const res = await request('/espacio/pilares');
        if (res.ok && res.data.pilares) return res.data.pilares;
        return JSON.parse(localStorage.getItem('emowell_pilares_local') || '{}');
    },

    async updatePilares(pilares) {
        const res = await request('/espacio/pilares', {
            method: 'PUT',
            body: JSON.stringify(pilares)
        });
        if (res.ok && res.data.pilares) return res.data.pilares;
        localStorage.setItem('emowell_pilares_local', JSON.stringify(pilares));
        return pilares;
    }
};
