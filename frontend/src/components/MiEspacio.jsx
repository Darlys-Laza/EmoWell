import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, CheckSquare, Square, Heart, ExternalLink, Image, Video, Music, BookOpen, Target, Save } from 'lucide-react';
import { api } from '../services/api';

export default function MiEspacio({ usuario }) {
    const [items, setItems] = useState([]);
    const [tipo, setTipo] = useState('nota');
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('Inspiración');
    const [url, setUrl] = useState('');
    const [filtro, setFiltro] = useState('Todos');
    const [generandoIA, setGenerandoIA] = useState(false);

    // Pilares
    const [pilares, setPilares] = useState({
        fortalezas: 'Resiliencia y creatividad',
        disfruto: 'Pintar, leer y escuchar música',
        valoro: 'La honestidad y la empatía',
        recordatorio: 'Un paso a la vez, no tengo que resolver todo hoy.'
    });
    const [guardandoPilares, setGuardandoPilares] = useState(false);
    const [mensajePilar, setMensajePilar] = useState('');

    useEffect(() => {
        async function cargar() {
            const dataItems = await api.getMuroItems();
            setItems(dataItems);
            const dataPilares = await api.getPilares();
            if (dataPilares && Object.keys(dataPilares).length > 0) {
                setPilares(prev => ({ ...prev, ...dataPilares }));
            }
        }
        cargar();
    }, []);

    const inspirarmeConIA = async () => {
        setGenerandoIA(true);
        try {
            const sugerencia = await api.getInspiracion(categoria, tipo);
            if (sugerencia) {
                setTitulo(sugerencia);
            }
        } catch (e) {
            console.error('Error generando inspiración:', e);
        } finally {
            setGenerandoIA(false);
        }
    };

    const handleAgregarItem = async (e) => {
        e.preventDefault();
        if (!titulo.trim() && !url.trim()) return;

        const nuevo = {
            tipo,
            titulo: titulo.trim(),
            categoria,
            url: url.trim(),
            completada: false
        };

        const res = await api.createMuroItem(nuevo);
        if (res) {
            setItems([res, ...items]);
            setTitulo('');
            setUrl('');
        }
    };

    const toggleCompletada = async (item) => {
        const nuevoEstado = !item.completada;
        await api.updateMuroItem(item.id || item._id, { completada: nuevoEstado });
        setItems(items.map(i => (i.id === item.id || i._id === item._id) ? { ...i, completada: nuevoEstado } : i));
    };

    const handleEliminarItem = async (id) => {
        await api.deleteMuroItem(id);
        setItems(items.filter(i => (i.id !== id && i._id !== id)));
    };

    const handleGuardarPilares = async () => {
        setGuardandoPilares(true);
        await api.updatePilares(pilares);
        setGuardandoPilares(false);
        setMensajePilar('¡Pilares guardados correctamente!');
        setTimeout(() => setMensajePilar(''), 3000);
    };

    const itemsFiltrados = filtro === 'Todos'
        ? items
        : items.filter(i => (filtro === 'Metas' ? i.tipo === 'meta' : filtro === 'Notas' ? i.tipo === 'nota' : true));

    return (
        <div className="espacio-page">
            <div className="page-header text-center">
                <span className="section-eyebrow">SANTUARIO PERSONAL</span>
                <h1 className="page-title">Mi Espacio de Bienestar</h1>
                <p className="page-subtitle">
                    Guarda tus metas, recuerdos, fotografías e inspiración en un solo muro interactivo.
                </p>
            </div>

            {/* CREADOR DE ELEMENTOS DEL MURO */}
            <div className="creador-muro-card">
                <div className="creador-tabs-header">
                    <span className="creador-label">Agregar al muro:</span>
                    <div className="creador-tabs-buttons">
                        {[
                            { id: 'nota', label: 'Nota o frase', icon: <BookOpen size={14} /> },
                            { id: 'meta', label: 'Meta o sueño', icon: <Target size={14} /> },
                            { id: 'foto', label: 'Foto o imagen', icon: <Image size={14} /> },
                            { id: 'video', label: 'Video', icon: <Video size={14} /> },
                            { id: 'musica', label: 'Música', icon: <Music size={14} /> }
                        ].map(t => (
                            <button
                                key={t.id}
                                type="button"
                                className={`tab-pill ${tipo === t.id ? 'active' : ''}`}
                                onClick={() => setTipo(t.id)}
                            >
                                {t.icon}
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleAgregarItem} className="creador-form-body">
                    <div className="creador-row-main">
                        <input
                            type="text"
                            placeholder={tipo === 'meta' ? '¿Qué meta o sueño deseas proponerte?' : 'Título, frase o recuerdo que quieras guardar...'}
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            className="input-titulo-muro"
                        />

                        {/* BOTÓN INSPIRARME */}
                        <button
                            type="button"
                            className="btn-inspirar-ia"
                            onClick={inspirarmeConIA}
                            disabled={generandoIA}
                            title="Sugerir idea o frase positiva"
                        >
                            <Sparkles size={14} className="sparkle-teal" />
                            <span>{generandoIA ? 'Generando...' : 'Inspirarme'}</span>
                        </button>

                        <select
                            value={categoria}
                            onChange={e => setCategoria(e.target.value)}
                            className="select-categoria-muro"
                        >
                            <option value="Inspiración">Inspiración</option>
                            <option value="Calma y paz">Calma y paz</option>
                            <option value="Motivación">Motivación</option>
                            <option value="Recuerdo especial">Recuerdo especial</option>
                            <option value="Meta personal">Meta personal</option>
                            <option value="Gratitud">Gratitud</option>
                        </select>
                    </div>

                    {(tipo === 'foto' || tipo === 'video' || tipo === 'musica') && (
                        <div className="creador-row-url">
                            <input
                                type="url"
                                placeholder="Enlace web (YouTube, Spotify o URL de imagen)..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="input-url-muro"
                            />
                        </div>
                    )}

                    <div className="creador-row-submit">
                        <button type="submit" className="btn-add-muro">
                            <Plus size={16} />
                            <span>Añadir a mi muro</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* FILTROS DEL MURO */}
            <div className="muro-toolbar-row">
                <div className="muro-filtros">
                    {['Todos', 'Notas', 'Metas'].map(f => (
                        <button
                            key={f}
                            className={`chip-filtro ${filtro === f ? 'active' : ''}`}
                            onClick={() => setFiltro(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <span className="muro-count-badge">{items.length} elementos guardados</span>
            </div>

            {/* GRID DE ELEMENTOS DEL MURO */}
            <div className="muro-cards-grid">
                {itemsFiltrados.map(item => (
                    <div key={item.id || item._id} className="muro-item-card">
                        <div className="muro-item-header">
                            <span className={`muro-cat-pill cat-${(item.categoria || 'Inspiración').toLowerCase().replace(/\s+/g, '-')}`}>
                                {item.categoria || 'Inspiración'}
                            </span>
                            <button
                                className="btn-del-item"
                                onClick={() => handleEliminarItem(item.id || item._id)}
                                title="Eliminar tarjeta"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>

                        <div className="muro-item-body">
                            {item.tipo === 'meta' ? (
                                <div className="meta-checkbox-row" onClick={() => toggleCompletada(item)}>
                                    {item.completada ? (
                                        <CheckSquare size={18} className="check-done" />
                                    ) : (
                                        <Square size={18} className="check-pending" />
                                    )}
                                    <span className={`meta-texto ${item.completada ? 'tachado' : ''}`}>
                                        {item.titulo}
                                    </span>
                                </div>
                            ) : (
                                <p className="muro-item-texto">{item.titulo}</p>
                            )}

                            {item.url && (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="muro-link-preview">
                                    <ExternalLink size={13} />
                                    <span>Ver recurso vinculado</span>
                                </a>
                            )}
                        </div>

                        <div className="muro-item-footer">
                            <span className="muro-item-fecha">{item.fecha || 'Reciente'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* PILARES DE IDENTIDAD */}
            <div className="pilares-section">
                <div className="pilares-header">
                    <div>
                        <h2>Quién soy y qué me importa</h2>
                        <p>Tus pilares de identidad y fortalezas para sostenerte en momentos difíciles.</p>
                    </div>
                    <button className="btn-save-pilares" onClick={handleGuardarPilares} disabled={guardandoPilares}>
                        <Save size={15} />
                        <span>{guardandoPilares ? 'Guardando...' : 'Guardar pilares'}</span>
                    </button>
                </div>

                {mensajePilar && <div className="alert-box success small">{mensajePilar}</div>}

                <div className="pilares-grid">
                    <div className="pilar-card">
                        <label>Mis Fortalezas</label>
                        <textarea
                            rows={3}
                            value={pilares.fortalezas}
                            onChange={e => setPilares({ ...pilares, fortalezas: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pilar-card">
                        <label>Lo que Disfruto</label>
                        <textarea
                            rows={3}
                            value={pilares.disfruto}
                            onChange={e => setPilares({ ...pilares, disfruto: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pilar-card">
                        <label>Lo que Valoro</label>
                        <textarea
                            rows={3}
                            value={pilares.valoro}
                            onChange={e => setPilares({ ...pilares, valoro: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="pilar-card">
                        <label>Mi Recordatorio Clave</label>
                        <textarea
                            rows={3}
                            value={pilares.recordatorio}
                            onChange={e => setPilares({ ...pilares, recordatorio: e.target.value })}
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}
