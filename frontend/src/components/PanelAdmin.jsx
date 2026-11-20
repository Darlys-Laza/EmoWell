import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, MailCheck, AlertCircle, BarChart2, Check, Clock, RefreshCw, LogOut, KeyRound, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function PanelAdmin() {
    const [adminToken, setAdminToken] = useState(localStorage.getItem('emowell_admin_token') || null);
    const [correo, setCorreo] = useState('admin@emowell.org');
    const [clave, setClave] = useState('admin123');
    const [errorLogin, setErrorLogin] = useState(null);
    const [cargandoLogin, setCargandoLogin] = useState(false);

    // Datos del panel
    const [solicitudes, setSolicitudes] = useState([]);
    const [metricas, setMetricas] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [solicitudDetalle, setSolicitudDetalle] = useState(null);

    const handleLoginAdmin = async (e) => {
        e.preventDefault();
        setErrorLogin(null);
        setCargandoLogin(true);

        const res = await api.adminLogin(correo, clave);
        if (res && res.ok && res.data.token) {
            setAdminToken(res.data.token);
            localStorage.setItem('emowell_admin_token', res.data.token);
        } else {
            setErrorLogin(res?.data?.error || 'Credenciales administrativas no válidas.');
        }
        setCargandoLogin(false);
    };

    const handleLogoutAdmin = () => {
        setAdminToken(null);
        localStorage.removeItem('emowell_admin_token');
    };

    const cargarDatosAdmin = async () => {
        setCargandoDatos(true);
        const [sols, mets] = await Promise.all([
            api.getAdminSolicitudes(adminToken),
            api.getAdminMetricas(adminToken)
        ]);
        setSolicitudes(sols);
        setMetricas(mets);
        setCargandoDatos(false);
    };

    useEffect(() => {
        if (adminToken) {
            cargarDatosAdmin();
        }
    }, [adminToken]);

    const cambiarEstado = async (id, nuevoEstado) => {
        await api.updateAdminSolicitud(id, nuevoEstado, adminToken);
        cargarDatosAdmin();
    };

    // VISTA DE LOGIN ADMINISTRATIVO SI NO ESTÁ AUTENTICADO
    if (!adminToken) {
        return (
            <div className="admin-login-page">
                <div className="admin-login-card">
                    <div className="admin-badge-icon">
                        <ShieldCheck size={36} />
                    </div>
                    <h2>Panel de Gestión Interna (Admin)</h2>
                    <p className="admin-login-subtitle">
                        Acceso exclusivo para administradores y coordinadores de EmoWell.
                    </p>

                    <div className="demo-credentials-banner">
                        <strong>Credenciales de Administración:</strong>
                        <div>Usuario: <code>admin@emowell.org</code></div>
                        <div>Contraseña: <code>admin123</code></div>
                    </div>

                    {errorLogin && (
                        <div className="alert-box error">
                            <AlertCircle size={16} />
                            <span>{errorLogin}</span>
                        </div>
                    )}

                    <form onSubmit={handleLoginAdmin} className="form-fields">
                        <div className="form-group">
                            <label>Correo del Administrador</label>
                            <input
                                type="text"
                                value={correo}
                                onChange={e => setCorreo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={clave}
                                onChange={e => setClave(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={cargandoLogin}>
                            {cargandoLogin ? 'Verificando...' : 'Entrar al Panel de Control'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // DASHBOARD PRINCIPAL DE ADMINISTRACIÓN (RÚBRICA SLIDES 3, 4, 5)
    return (
        <div className="admin-dashboard-page">
            <div className="admin-header">
                <div>
                    <div className="admin-status-pill">
                        <span className="dot-active"></span>
                        <span>Administrador General Conectado</span>
                    </div>
                    <h1 className="admin-title">Panel de Control y Gestión Interna</h1>
                    <p className="admin-subtitle">Monitoreo de solicitudes de servicios, métricas de comunidad y base de datos.</p>
                </div>

                <div className="admin-header-actions">
                    <button className="btn-secondary" onClick={cargarDatosAdmin} disabled={cargandoDatos}>
                        <RefreshCw size={15} className={cargandoDatos ? 'spin' : ''} />
                        <span>Actualizar</span>
                    </button>
                    <button className="btn-logout-admin" onClick={handleLogoutAdmin}>
                        <LogOut size={15} />
                        <span>Salir</span>
                    </button>
                </div>
            </div>

            {/* TARJETAS DE KPIS Y MÉTRICAS */}
            {metricas && (
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span>Total Solicitudes</span>
                            <MailCheck size={20} className="kpi-icon teal" />
                        </div>
                        <div className="kpi-value">{metricas.totalContactos || solicitudes.length}</div>
                        <span className="kpi-detail">Peticiones registradas en el sistema</span>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span>Por Atender</span>
                            <Clock size={20} className="kpi-icon amber" />
                        </div>
                        <div className="kpi-value">{metricas.pendientesContactos || 0}</div>
                        <span className="kpi-detail">Pendientes de respuesta</span>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span>Usuarios Registrados</span>
                            <Users size={20} className="kpi-icon purple" />
                        </div>
                        <div className="kpi-value">{metricas.totalUsuarios || 1}</div>
                        <span className="kpi-detail">Cuentas activas en plataforma</span>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <span>Motor de Datos</span>
                            <ShieldCheck size={20} className="kpi-icon emerald" />
                        </div>
                        <div className="kpi-value db-badge">{metricas.motorBD || 'MongoDB'}</div>
                        <span className="kpi-detail">Persistencia garantizada</span>
                    </div>
                </div>
            )}

            {/* TABLA DE SOLICITUDES DE CONTACTO */}
            <div className="admin-section-card">
                <div className="section-title-row">
                    <h3>Bandeja de Solicitudes de Contacto ({solicitudes.length})</h3>
                    <span className="table-hint">Haz clic en el estado para actualizar</span>
                </div>

                {solicitudes.length === 0 ? (
                    <div className="empty-table-state">
                        <p>No hay solicitudes pendientes en este momento.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Servicio de Interés</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map(s => (
                                    <tr key={s.id || s._id}>
                                        <td>{s.fecha || 'Hoy'}</td>
                                        <td><strong>{s.nombre}</strong></td>
                                        <td>{s.correo}</td>
                                        <td>{s.telefono || 'No indicado'}</td>
                                        <td><span className="service-tag">{s.servicioInteres || 'General'}</span></td>
                                        <td>
                                            <span className={`status-pill ${s.estado || 'pendiente'}`}>
                                                {s.estado || 'pendiente'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn-view-msg"
                                                    onClick={() => setSolicitudDetalle(s)}
                                                    title="Ver mensaje completo"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                {s.estado === 'pendiente' ? (
                                                    <button
                                                        className="btn-action-status mark-done"
                                                        onClick={() => cambiarEstado(s.id || s._id, 'atendido')}
                                                        title="Marcar como atendida"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-action-status mark-pending"
                                                        onClick={() => cambiarEstado(s.id || s._id, 'pendiente')}
                                                        title="Marcar como pendiente"
                                                    >
                                                        <Clock size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL DETALLE DE SOLICITUD */}
            {solicitudDetalle && (
                <div className="modal-overlay" onClick={() => setSolicitudDetalle(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Solicitud de {solicitudDetalle.nombre}</h3>
                                <span className="modal-tag">{solicitudDetalle.servicioInteres}</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setSolicitudDetalle(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Correo:</strong> {solicitudDetalle.correo}</p>
                            <p><strong>Teléfono:</strong> {solicitudDetalle.telefono || 'Sin teléfono'}</p>
                            <p><strong>Fecha:</strong> {solicitudDetalle.fecha}</p>
                            <div className="message-box-full">
                                <strong>Mensaje del usuario:</strong>
                                <p>{solicitudDetalle.mensaje}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setSolicitudDetalle(null)}>Cerrar</button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    cambiarEstado(solicitudDetalle.id || solicitudDetalle._id, 'atendido');
                                    setSolicitudDetalle(null);
                                }}
                            >
                                Marcar como Atendida
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
