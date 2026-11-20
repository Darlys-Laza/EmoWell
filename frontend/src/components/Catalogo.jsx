import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Sparkles, Clock, Globe, Tag, Info } from 'lucide-react';
import { api } from '../services/api';

export default function Catalogo({ setVistaActual, onSeleccionarServicio }) {
    const [servicios, setServicios] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargar() {
            setCargando(true);
            const data = await api.getCatalogo();
            setServicios(data);
            setCargando(false);
        }
        cargar();
    }, []);

    const categorias = ['Todos', 'Orientación Personal', 'Talleres Grupales', 'Plataforma Digital', 'Servicio Institucional'];

    const serviciosFiltrados = filtro === 'Todos'
        ? servicios
        : servicios.filter(s => s.categoria === filtro);

    const handleSolicitar = (servicio) => {
        if (onSeleccionarServicio) {
            onSeleccionarServicio(servicio.nombre);
        }
        setVistaActual('contacto');
    };

    return (
        <div className="catalogo-page">
            <div className="page-header text-center">
                <span className="section-eyebrow">CATÁLOGO DE PRODUCTOS Y SERVICIOS</span>
                <h1 className="page-title">Programas y Soluciones de Bienestar</h1>
                <p className="page-subtitle">
                    Descubre nuestras iniciativas diseñadas para apoyar la salud mental de estudiantes, colegios y universidades.
                </p>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="filtros-catalogo">
                {categorias.map(cat => (
                    <button
                        key={cat}
                        className={`filtro-btn ${filtro === cat ? 'active' : ''}`}
                        onClick={() => setFiltro(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* GRID DE SERVICIOS */}
            <div className="catalogo-grid">
                {serviciosFiltrados.map(serv => (
                    <div key={serv.id} className="servicio-card">
                        <div className="servicio-card-header">
                            <span className="servicio-icon">{serv.icono}</span>
                            <span className="servicio-categoria-badge">{serv.categoria}</span>
                        </div>

                        <h3 className="servicio-nombre">{serv.nombre}</h3>
                        <p className="servicio-descripcion">{serv.descripcion}</p>

                        <div className="servicio-meta">
                            <div className="meta-item">
                                <Clock size={15} />
                                <span>{serv.duracion}</span>
                            </div>
                            <div className="meta-item">
                                <Globe size={15} />
                                <span>{serv.modalidad}</span>
                            </div>
                        </div>

                        <div className="servicio-precio-box">
                            <span className="precio-etiqueta">Modalidad / Aporte:</span>
                            <span className="precio-valor">{serv.precio}</span>
                        </div>

                        <div className="servicio-caracteristicas">
                            <span className="caracteristicas-titulo">¿Qué incluye?</span>
                            <ul>
                                {serv.caracteristicas.map((c, i) => (
                                    <li key={i}>
                                        <Check size={14} className="check-icon" />
                                        <span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="servicio-card-actions">
                            <button
                                className="btn-primary-card"
                                onClick={() => handleSolicitar(serv)}
                            >
                                <span>Solicitar este servicio</span>
                                <ArrowRight size={16} />
                            </button>
                            <button
                                className="btn-info-card"
                                onClick={() => setServicioSeleccionado(serv)}
                                title="Ver detalles completos"
                            >
                                <Info size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DETALLES DEL SERVICIO */}
            {servicioSeleccionado && (
                <div className="modal-overlay" onClick={() => setServicioSeleccionado(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-icon">{servicioSeleccionado.icono}</span>
                            <div>
                                <h3>{servicioSeleccionado.nombre}</h3>
                                <span className="modal-tag">{servicioSeleccionado.categoria}</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setServicioSeleccionado(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-desc">{servicioSeleccionado.descripcion}</p>

                            <div className="modal-details-grid">
                                <div>
                                    <strong>Duración:</strong> {servicioSeleccionado.duracion}
                                </div>
                                <div>
                                    <strong>Modalidad:</strong> {servicioSeleccionado.modalidad}
                                </div>
                                <div>
                                    <strong>Costo:</strong> {servicioSeleccionado.precio}
                                </div>
                            </div>

                            <div className="modal-features">
                                <h4>Beneficios y componentes clave:</h4>
                                <ul>
                                    {servicioSeleccionado.caracteristicas.map((c, idx) => (
                                        <li key={idx}><Check size={15} /> {c}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setServicioSeleccionado(null)}>Cerrar</button>
                            <button className="btn-primary" onClick={() => {
                                handleSolicitar(servicioSeleccionado);
                                setServicioSeleccionado(null);
                            }}>
                                Solicitar ahora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
