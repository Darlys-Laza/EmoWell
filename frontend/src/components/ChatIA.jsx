import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, AlertTriangle, Phone, ShieldCheck, Heart } from 'lucide-react';
import { api } from '../services/api';

export default function ChatIA() {
    const [mensajes, setMensajes] = useState([
        {
            id: 'init-1',
            emisor: 'asistente',
            texto: '¡Hola! Me alegra que estés aquí. Este es tu rincón seguro para respirar, desahogarte y ordenar lo que sientes sin prisas ni juicios. ¿Cómo te encuentras hoy?',
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputTexto, setInputTexto] = useState('');
    const [cargando, setCargando] = useState(false);
    const [alertaCrisis, setAlertaCrisis] = useState(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes, cargando]);

    const temasRapidos = [
        "Quiero desahogarme",
        "Me siento con agobio por parciales",
        "Tengo mucha ansiedad y sobrepienso",
        "Me cuesta ponerle nombre a lo que siento"
    ];

    const enviarMensaje = async (textoAEnviar) => {
        const texto = (textoAEnviar || inputTexto).trim();
        if (!texto || cargando) return;

        const mensajeUsuario = {
            id: 'user_' + Date.now(),
            emisor: 'usuario',
            texto,
            timestamp: new Date().toISOString()
        };

        setMensajes(prev => [...prev, mensajeUsuario]);
        setInputTexto('');
        setCargando(true);

        try {
            const res = await api.enviarMensajeChat(texto);
            if (res && res.respuesta) {
                const mensajeAsistente = {
                    id: 'bot_' + Date.now(),
                    emisor: 'asistente',
                    texto: res.respuesta,
                    esAlerta: res.esAlerta,
                    proveedor: res.proveedor,
                    timestamp: new Date().toISOString()
                };
                setMensajes(prev => [...prev, mensajeAsistente]);

                if (res.esAlerta && res.lineasAyuda) {
                    setAlertaCrisis(res.lineasAyuda);
                }
            }
        } catch (err) {
            console.error('Error enviando mensaje al chat:', err);
        } finally {
            setCargando(false);
        }
    };

    const limpiarChat = async () => {
        if (window.confirm('¿Deseas reiniciar esta conversación para empezar de nuevo?')) {
            await api.clearChatHistory();
            setMensajes([
                {
                    id: 'init-2',
                    emisor: 'asistente',
                    texto: 'Conversación reiniciada. Estoy aquí cuando quieras comenzar.',
                    timestamp: new Date().toISOString()
                }
            ]);
            setAlertaCrisis(null);
        }
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* BARRA LATERAL CON TEMAS */}
                <div className="chat-sidebar">
                    <h3>¿De qué quieres hablar hoy?</h3>
                    <p className="sidebar-hint">Selecciona una idea para romper el hielo o escribe libremente lo que sientas:</p>
                    <div className="temas-list">
                        {temasRapidos.map((tema, idx) => (
                            <button
                                key={idx}
                                className="btn-tema-chip"
                                onClick={() => enviarMensaje(tema)}
                                disabled={cargando}
                            >
                                {tema}
                            </button>
                        ))}
                    </div>

                    <div className="ai-badge-card">
                        <Sparkles size={16} className="sparkle-teal" />
                        <div>
                            <strong>Espacio Seguro de Escucha Activa</strong>
                            <p>Acompañamiento reflexivo con psicología cognitivo-conductual (TCC).</p>
                        </div>
                    </div>
                </div>

                {/* VENTANA PRINCIPAL DE DIÁLOGO */}
                <div className="chat-main-window">
                    <div className="chat-header">
                        <div>
                            <h2>EmoWell — Acompañamiento</h2>
                            <span className="chat-status">
                                <span className="status-dot-green"></span> Escuchándote activamente
                            </span>
                        </div>
                        <button className="btn-clear-chat" onClick={limpiarChat} title="Reiniciar conversación">
                            <RefreshCw size={14} />
                            <span>Nueva conversación</span>
                        </button>
                    </div>

                    {/* ALERTA DE SEGURIDAD Y CRISIS */}
                    {alertaCrisis && (
                        <div className="crisis-alert-banner">
                            <div className="crisis-alert-title">
                                <AlertTriangle size={18} />
                                <strong>Líneas Oficiales de Apoyo Inmediato (Colombia)</strong>
                            </div>
                            <p>Tu bienestar es prioritario. Por favor comunícate directamente con:</p>
                            <div className="crisis-hotlines-grid">
                                {alertaCrisis.map((l, i) => (
                                    <div key={i} className="hotline-pill">
                                        <Phone size={13} />
                                        <span><strong>{l.nombre}:</strong> {l.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MENSAJES */}
                    <div className="chat-messages-scroll">
                        {mensajes.map(m => (
                            <div
                                key={m.id}
                                className={`chat-bubble-row ${m.emisor === 'usuario' ? 'bubble-user' : 'bubble-assistant'}`}
                            >
                                <div className="chat-bubble-content">
                                    <p>{m.texto}</p>
                                </div>
                            </div>
                        ))}

                        {/* INDICADOR DE ESCRITURA */}
                        {cargando && (
                            <div className="chat-bubble-row bubble-assistant">
                                <div className="typing-indicator-box">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* INPUT DE ENVÍO */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            enviarMensaje();
                        }}
                        className="chat-input-bar"
                    >
                        <input
                            type="text"
                            placeholder="Escribe lo que quieras expresar..."
                            value={inputTexto}
                            onChange={e => setInputTexto(e.target.value)}
                            disabled={cargando}
                        />
                        <button type="submit" className="btn-send-chat" disabled={!inputTexto.trim() || cargando}>
                            <span>Enviar</span>
                            <Send size={15} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
