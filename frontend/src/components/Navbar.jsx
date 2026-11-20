import React from 'react';
import { Sparkles, User, LogOut, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Navbar({ vistaActual, setVistaActual, usuario, onLogout, onOpenAuth }) {
    return (
        <header className="navbar-container">
            <div className="navbar-content">
                {/* Logo & Marca */}
                <div className="navbar-brand" onClick={() => setVistaActual('inicio')}>
                    <img src="./logoJC.png" alt="EmoWell Logo" className="navbar-logo" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="brand-text">
                        <span className="brand-title">EmoWell</span>
                        <span className="brand-tagline">Un espacio para sentir</span>
                    </div>
                </div>

                {/* Navegación Principal */}
                <nav className="navbar-nav">
                    <button
                        className={`nav-link ${vistaActual === 'inicio' ? 'active' : ''}`}
                        onClick={() => setVistaActual('inicio')}
                    >
                        Inicio
                    </button>
                    <button
                        className={`nav-link ${vistaActual === 'catalogo' ? 'active' : ''}`}
                        onClick={() => setVistaActual('catalogo')}
                    >
                        Catálogo
                    </button>
                    <button
                        className={`nav-link ${vistaActual === 'contacto' ? 'active' : ''}`}
                        onClick={() => setVistaActual('contacto')}
                    >
                        Contacto
                    </button>
                    <button
                        className={`nav-link ${vistaActual === 'charlar' ? 'active' : ''}`}
                        onClick={() => setVistaActual('charlar')}
                    >
                        Charlar <Sparkles size={14} className="sparkle-icon" />
                    </button>
                    <button
                        className={`nav-link ${vistaActual === 'nivel' ? 'active' : ''}`}
                        onClick={() => setVistaActual('nivel')}
                    >
                        Nivel Emocional
                    </button>
                    <button
                        className={`nav-link ${vistaActual === 'autorregularme' ? 'active' : ''}`}
                        onClick={() => setVistaActual('autorregularme')}
                    >
                        Autorregularme
                    </button>
                    <button
                        className={`nav-link ${vistaActual === 'espacio' ? 'active' : ''}`}
                        onClick={() => setVistaActual('espacio')}
                    >
                        Mi Espacio
                    </button>
                </nav>

                {/* Acciones de Usuario y Admin */}
                <div className="navbar-actions">
                    {usuario ? (
                        <div className="user-session-pill">
                            <User size={15} />
                            <span className="user-name">{usuario.nombre}</span>
                            <button className="btn-logout" onClick={onLogout} title="Cerrar sesión">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <button className="btn-login-nav" onClick={onOpenAuth}>
                            Iniciar sesión
                        </button>
                    )}

                    <button
                        className={`btn-admin-nav ${vistaActual === 'admin' ? 'active' : ''}`}
                        onClick={() => setVistaActual('admin')}
                        title="Portal de Gestión Interna / Admin"
                    >
                        <ShieldCheck size={16} />
                        <span>Admin</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
