import React from 'react';
import { ShieldCheck, Heart, Phone, Sparkles } from 'lucide-react';

export default function Footer({ setVistaActual }) {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-brand-col">
                    <div className="footer-brand-title">
                        <span>EmoWell</span>
                    </div>
                    <p className="footer-tagline">
                        Un espacio para sentir, comprender y avanzar a tu ritmo. Proyecto final de emprendimiento digital enfocado en bienestar estudiantil y salud mental juvenil.
                    </p>
                    <div className="footer-badge">
                        <Sparkles size={13} className="sparkle-teal" />
                        <span>Desarrollado con Node.js, Express & MongoDB</span>
                    </div>
                </div>

                <div className="footer-links-col">
                    <h4>Navegación</h4>
                    <ul>
                        <li><button onClick={() => setVistaActual('inicio')}>Inicio</button></li>
                        <li><button onClick={() => setVistaActual('catalogo')}>Catálogo de Servicios</button></li>
                        <li><button onClick={() => setVistaActual('contacto')}>Formulario de Contacto</button></li>
                        <li><button onClick={() => setVistaActual('charlar')}>Charlar</button></li>
                        <li><button onClick={() => setVistaActual('nivel')}>Nivel Emocional</button></li>
                        <li><button onClick={() => setVistaActual('autorregularme')}>Autorregulación</button></li>
                        <li><button onClick={() => setVistaActual('espacio')}>Mi Espacio Personal</button></li>
                    </ul>
                </div>

                <div className="footer-links-col">
                    <h4>Líneas de Ayuda (Colombia)</h4>
                    <ul>
                        <li><a href="tel:106"><strong>Línea 106:</strong> Apoyo emocional 24/7</a></li>
                        <li><a href="https://wa.me/573007548933" target="_blank" rel="noopener noreferrer"><strong>WhatsApp 106:</strong> 300 754 8933</a></li>
                        <li><a href="tel:123"><strong>Línea 123:</strong> Emergencias médicas</a></li>
                        <li><a href="tel:3117668666"><strong>Línea Salvavidas:</strong> 311 766 8666</a></li>
                    </ul>
                </div>

                <div className="footer-admin-col">
                    <h4>Gestión Interna</h4>
                    <p>Acceso administrativo para revisión de solicitudes y métricas de la plataforma.</p>
                    <button className="btn-footer-admin" onClick={() => setVistaActual('admin')}>
                        <ShieldCheck size={16} />
                        <span>Acceder al Portal Admin</span>
                    </button>
                </div>
            </div>

            <div className="footer-bottom text-center">
                <p>© {new Date().getFullYear()} EmoWell — Proyecto desarrollado por Darlys Laza. Plataforma de Bienestar Estudiantil.</p>
            </div>
        </footer>
    );
}
