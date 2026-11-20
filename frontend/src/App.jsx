import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Catalogo from './components/Catalogo';
import Contacto from './components/Contacto';
import ChatIA from './components/ChatIA';
import NivelEmocional from './components/NivelEmocional';
import Autorregularme from './components/Autorregularme';
import MiEspacio from './components/MiEspacio';
import PanelAdmin from './components/PanelAdmin';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import './App.css';

export default function App() {
    const [vistaActual, setVistaActual] = useState('inicio');
    const [servicioPreseleccionado, setServicioPreseleccionado] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false);

    useEffect(() => {
        // Restaurar usuario local
        const userSaved = localStorage.getItem('emowell_user');
        if (userSaved) {
            try {
                setUsuario(JSON.parse(userSaved));
            } catch (e) {}
        }
    }, []);

    const handleCambiarVista = (nuevaVista) => {
        setVistaActual(nuevaVista);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSeleccionarServicio = (nombreServicio) => {
        setServicioPreseleccionado(nombreServicio);
    };

    const handleLogout = () => {
        localStorage.removeItem('emowell_token');
        localStorage.removeItem('emowell_user');
        setUsuario(null);
    };

    return (
        <div className="emowell-app">
            {/* BARRA SUPERIOR DE NAVEGACIÓN */}
            <Navbar
                vistaActual={vistaActual}
                setVistaActual={handleCambiarVista}
                usuario={usuario}
                onLogout={handleLogout}
                onOpenAuth={() => setModalAuthAbierto(true)}
            />

            {/* CONTENIDO PRINCIPAL SEGÚN VISTA ACTIVA */}
            <main className="main-content">
                {vistaActual === 'inicio' && (
                    <Landing
                        setVistaActual={handleCambiarVista}
                        usuario={usuario}
                    />
                )}

                {vistaActual === 'catalogo' && (
                    <Catalogo
                        setVistaActual={handleCambiarVista}
                        onSeleccionarServicio={handleSeleccionarServicio}
                    />
                )}

                {vistaActual === 'contacto' && (
                    <Contacto
                        servicioPreseleccionado={servicioPreseleccionado}
                    />
                )}

                {vistaActual === 'charlar' && (
                    <ChatIA />
                )}

                {vistaActual === 'nivel' && (
                    <NivelEmocional
                        setVistaActual={handleCambiarVista}
                    />
                )}

                {vistaActual === 'autorregularme' && (
                    <Autorregularme />
                )}

                {vistaActual === 'espacio' && (
                    <MiEspacio
                        usuario={usuario}
                    />
                )}

                {vistaActual === 'admin' && (
                    <PanelAdmin />
                )}
            </main>

            {/* PIE DE PÁGINA */}
            <Footer
                setVistaActual={handleCambiarVista}
            />

            {/* MODAL DE AUTENTICACIÓN */}
            <AuthModal
                isOpen={modalAuthAbierto}
                onClose={() => setModalAuthAbierto(false)}
                onLoginExitoso={(u) => setUsuario(u)}
            />
        </div>
    );
}
