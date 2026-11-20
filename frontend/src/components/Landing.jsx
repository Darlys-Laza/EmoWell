import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, HeartHandshake, Shield, MessageCircle, BarChart3, Wind, FolderHeart, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Landing({ setVistaActual, usuario }) {
    const [frase, setFrase] = useState("No tienes que resolver toda tu vida hoy; solo concéntrate en dar el siguiente paso con calma.");
    const [autor, setAutor] = useState("EmoWell");
    const [cargandoFrase, setCargandoFrase] = useState(false);

    const cargarFrase = async () => {
        setCargandoFrase(true);
        const res = await api.getFraseDelDia();
        if (res && res.cita) {
            setFrase(res.cita);
            setAutor(res.autor || "EmoWell");
        }
        setCargandoFrase(false);
    };

    useEffect(() => {
        cargarFrase();
    }, []);

    return (
        <div className="landing-page">
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="badge-pill">
                        <Sparkles size={14} className="sparkle-teal" />
                        <span>Plataforma de Salud Emocional Universitaria</span>
                    </div>

                    <h1 className="hero-title">
                        Un espacio seguro para <span className="highlight-text">sentir, respirar</span> y avanzar a tu ritmo
                    </h1>

                    <p className="hero-subtitle">
                        Acompañamiento reflexivo, herramientas prácticas de autorregulación y servicios especializados de bienestar para estudiantes.
                    </p>

                    <div className="hero-cta-group">
                        <button className="btn-primary" onClick={() => setVistaActual('charlar')}>
                            <span>Comenzar a charlar</span>
                            <ArrowRight size={18} />
                        </button>
                        <button className="btn-secondary" onClick={() => setVistaActual('catalogo')}>
                            <span>Ver catálogo de servicios</span>
                        </button>
                    </div>
                </div>

                {/* PEGATINA / REFLEXIÓN DINÁMICA */}
                <div className="hero-sticker-container">
                    <div className="sticker-card" onClick={cargarFrase} title="Haz clic para actualizar la reflexión del día">
                        <div className="sticker-tape"></div>
                        <div className="sticker-header">
                            <span className="sticker-tag">Reflexión del Día</span>
                            <button className="btn-refresh-sticker" disabled={cargandoFrase}>
                                <RefreshCw size={13} className={cargandoFrase ? 'spin' : ''} />
                            </button>
                        </div>
                        <p className="sticker-quote">"{frase}"</p>
                        <span className="sticker-author">— {autor}</span>
                    </div>
                </div>
            </section>

            {/* PROPÓSITO DEL EMPRENDIMIENTO */}
            <section className="features-section">
                <div className="section-header text-center">
                    <span className="section-eyebrow">NUESTRO EMPRENDIMIENTO DIGITAL</span>
                    <h2 className="section-title">¿Qué encontrarás en EmoWell?</h2>
                    <p className="section-description">
                        Una experiencia integral diseñada con tecnología, psicología cognitivo-conductual y calidez humana.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card" onClick={() => setVistaActual('charlar')}>
                        <div className="feature-icon-wrapper teal">
                            <MessageCircle size={24} />
                        </div>
                        <h3>Charlar</h3>
                        <p>Diálogo reflexivo y confidencial las 24 horas con nuestro módulo de apoyo y escucha activa.</p>
                        <span className="feature-link">Explorar chat &rarr;</span>
                    </div>

                    <div className="feature-card" onClick={() => setVistaActual('catalogo')}>
                        <div className="feature-icon-wrapper amber">
                            <HeartHandshake size={24} />
                        </div>
                        <h3>Catálogo de Servicios</h3>
                        <p>Acompañamiento 1 a 1, talleres grupales de estrés para parciales y kits institucionales para universidades.</p>
                        <span className="feature-link">Ver servicios &rarr;</span>
                    </div>

                    <div className="feature-card" onClick={() => setVistaActual('nivel')}>
                        <div className="feature-icon-wrapper blue">
                            <BarChart3 size={24} />
                        </div>
                        <h3>Nivel Emocional</h3>
                        <p>Evalúa cómo te sientes y recibe una orientación personalizada de autocuidado generada en tiempo real.</p>
                        <span className="feature-link">Medir nivel &rarr;</span>
                    </div>

                    <div className="feature-card" onClick={() => setVistaActual('autorregularme')}>
                        <div className="feature-icon-wrapper emerald">
                            <Wind size={24} />
                        </div>
                        <h3>Autorregulación</h3>
                        <p>Técnicas interactivas de respiración 4-7-8, anclaje sensorial y pausas activas para reducir la ansiedad.</p>
                        <span className="feature-link">Iniciar pausa &rarr;</span>
                    </div>

                    <div className="feature-card" onClick={() => setVistaActual('espacio')}>
                        <div className="feature-icon-wrapper purple">
                            <FolderHeart size={24} />
                        </div>
                        <h3>Mi Espacio Personal</h3>
                        <p>Tu santuario privado para registrar metas, recuerdos, pensamientos y tus pilares de resiliencia personal.</p>
                        <span className="feature-link">Abrir mi espacio &rarr;</span>
                    </div>

                    <div className="feature-card" onClick={() => setVistaActual('contacto')}>
                        <div className="feature-icon-wrapper rose">
                            <Shield size={24} />
                        </div>
                        <h3>Contacto Directo</h3>
                        <p>Comunícate con nuestro equipo para agendar orientaciones personalizadas, becas o soporte estudiantil.</p>
                        <span className="feature-link">Enviar solicitud &rarr;</span>
                    </div>
                </div>
            </section>

            {/* BANNER DE EMERGENCIA */}
            <section className="emergency-banner">
                <div className="emergency-content">
                    <div className="emergency-icon">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h4>¿Necesitas apoyo urgente o estás en crisis?</h4>
                        <p>No estás solo/a. Línea 106 gratuita (24/7) | WhatsApp Secretaría de Salud: 300 754 8933 | Emergencias: 123.</p>
                    </div>
                    <button className="btn-emergency" onClick={() => setVistaActual('contacto')}>
                        Solicitar Ayuda
                    </button>
                </div>
            </section>
        </div>
    );
}
