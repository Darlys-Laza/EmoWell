import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function Contacto({ servicioPreseleccionado }) {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        servicioInteres: servicioPreseleccionado || 'Acompañamiento Psicoemocional 1 a 1',
        mensaje: ''
    });

    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState(null);
    const [mensajeError, setMensajeError] = useState(null);

    const servicios = [
        'Acompañamiento Psicoemocional 1 a 1',
        'Taller de Autorregulación y Manejo del Estrés',
        'Membresía EmoWell Pro Estudiantil',
        'Kit Institucional de Emergencia Emocional',
        'Consulta General / Otro'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensajeExito(null);
        setMensajeError(null);

        if (!formData.nombre.trim() || !formData.correo.trim() || !formData.mensaje.trim()) {
            setMensajeError('Por favor completa los campos obligatorios (nombre, correo y mensaje).');
            return;
        }

        setEnviando(true);
        try {
            const res = await api.enviarContacto(formData);
            if (res && res.ok) {
                setMensajeExito(res.mensaje || '¡Tu solicitud ha sido registrada exitosamente! Te responderemos muy pronto.');
                setFormData({
                    nombre: '',
                    correo: '',
                    telefono: '',
                    servicioInteres: 'Acompañamiento Psicoemocional 1 a 1',
                    mensaje: ''
                });
            } else {
                setMensajeError(res.error || 'Ocurrió un error al enviar tu mensaje. Intenta de nuevo.');
            }
        } catch (err) {
            setMensajeError('Fallo al conectar con el servidor.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="contacto-page">
            <div className="page-header text-center">
                <span className="section-eyebrow">FORMULARIO REAL Y FUNCIONAL</span>
                <h1 className="page-title">Ponte en Contacto con EmoWell</h1>
                <p className="page-subtitle">
                    Estamos aquí para escucharte, orientarte y responder tus preguntas sobre nuestros servicios de bienestar.
                </p>
            </div>

            <div className="contacto-container">
                {/* FORMULARIO DE CONTACTO (RÚBRICA SLIDE 3 Y 4) */}
                <div className="contacto-form-card">
                    <h2>Envíanos una solicitud</h2>
                    <p className="form-helper">
                        Diligencia este formulario para solicitar acompañamiento, información sobre talleres o alianzas institucionales.
                    </p>

                    {mensajeExito && (
                        <div className="alert-box success">
                            <CheckCircle2 size={18} />
                            <span>{mensajeExito}</span>
                        </div>
                    )}

                    {mensajeError && (
                        <div className="alert-box error">
                            <AlertCircle size={18} />
                            <span>{mensajeError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-fields">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre completo *</label>
                            <input
                                id="nombre"
                                type="text"
                                placeholder="Ej. Camila Andrea Pérez"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="correo">Correo electrónico *</label>
                                <input
                                    id="correo"
                                    type="email"
                                    placeholder="ejemplo@emowell.org"
                                    value={formData.correo}
                                    onChange={e => setFormData({ ...formData, correo: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono / WhatsApp</label>
                                <input
                                    id="telefono"
                                    type="tel"
                                    placeholder="Ej. 310 123 4567"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="servicio">Servicio o programa de interés</label>
                            <select
                                id="servicio"
                                value={formData.servicioInteres}
                                onChange={e => setFormData({ ...formData, servicioInteres: e.target.value })}
                            >
                                {servicios.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="mensaje">¿Cómo podemos apoyarte? (Mensaje) *</label>
                            <textarea
                                id="mensaje"
                                rows={4}
                                placeholder="Cuéntanos brevemente qué necesitas o qué situación deseas abordar..."
                                value={formData.mensaje}
                                onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit-contacto" disabled={enviando}>
                            {enviando ? (
                                <span>Registrando solicitud...</span>
                            ) : (
                                <>
                                    <span>Enviar solicitud</span>
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* INFORMACIÓN DE APOYO Y CONTACTO INSTITUCIONAL */}
                <div className="contacto-info-sidebar">
                    <div className="info-card">
                        <h3>Información de Contacto</h3>
                        <p>EmoWell es una iniciativa digital de bienestar emocional orientada a estudiantes.</p>

                        <div className="info-list">
                            <div className="info-item">
                                <Mail size={18} className="info-icon" />
                                <div>
                                    <strong>Correo de atención:</strong>
                                    <span>contacto@emowell.org</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <Phone size={18} className="info-icon" />
                                <div>
                                    <strong>WhatsApp de orientación:</strong>
                                    <span>+57 (300) 754 8933</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <Clock size={18} className="info-icon" />
                                <div>
                                    <strong>Horario de respuesta:</strong>
                                    <span>Lunes a Sábado, 8:00 AM - 7:00 PM</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <MapPin size={18} className="info-icon" />
                                <div>
                                    <strong>Sede académica:</strong>
                                    <span>Bogotá D.C. - Colombia</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="emergency-card-sidebar">
                        <div className="emergency-header">
                            <ShieldAlert size={20} />
                            <h4>Atención Inmediata de Crisis</h4>
                        </div>
                        <p>Si te encuentras en una situación de riesgo vital o crisis severa, por favor comunícate de inmediato con:</p>
                        <ul>
                            <li><strong>Línea 106:</strong> Gratuita nacional (24/7)</li>
                            <li><strong>Línea 123:</strong> Emergencias médicas</li>
                            <li><strong>Línea Salvavidas:</strong> 311 766 8666</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
