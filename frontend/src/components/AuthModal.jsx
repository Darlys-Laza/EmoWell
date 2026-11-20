import React, { useState } from 'react';
import { User, Lock, Mail, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginExitoso }) {
    const [esRegistro, setEsRegistro] = useState(false);
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            let res;
            if (esRegistro) {
                res = await api.register(nombre, correo, clave);
            } else {
                res = await api.login(correo, clave);
            }

            if (res && res.ok && res.data) {
                const user = res.data.user || res.data.usuario;
                const token = res.data.token;
                if (token) localStorage.setItem('emowell_token', token);
                if (user) localStorage.setItem('emowell_user', JSON.stringify(user));
                onLoginExitoso(user);
                onClose();
            } else {
                setError(res?.data?.error || 'No se pudo completar la operación. Verifica tus datos.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
                <button className="btn-close-modal" onClick={onClose}>
                    <X size={18} />
                </button>

                <div className="auth-header text-center">
                    <h2>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
                    <p>{esRegistro ? 'Únete a EmoWell y guarda tus metas y emociones' : 'Ingresa a tu espacio personal seguro'}</p>
                </div>

                {error && (
                    <div className="alert-box error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-fields">
                    {esRegistro && (
                        <div className="form-group">
                            <label>Nombre completo</label>
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 4 caracteres"
                            value={clave}
                            onChange={e => setClave(e.target.value)}
                            required
                            minLength={4}
                        />
                    </div>

                    <button type="submit" className="btn-primary-auth" disabled={cargando}>
                        {cargando ? 'Procesando...' : esRegistro ? 'Registrarme' : 'Entrar'}
                    </button>
                </form>

                <div className="auth-switch-footer text-center">
                    {esRegistro ? (
                        <p>¿Ya tienes cuenta? <button type="button" onClick={() => setEsRegistro(false)} className="btn-link-switch">Inicia sesión aquí</button></p>
                    ) : (
                        <p>¿No tienes cuenta? <button type="button" onClick={() => setEsRegistro(true)} className="btn-link-switch">Regístrate gratis</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}
