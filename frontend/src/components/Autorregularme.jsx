import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, CheckCircle2, Eye, Hand, Ear, Sparkles } from 'lucide-react';

export default function Autorregularme() {
    // -------------------------------------------------------------
    // RESPIRACIÓN 4-7-8
    // -------------------------------------------------------------
    const [respirando, setRespirando] = useState(false);
    const [fase, setFase] = useState('Inhala (4s)'); // Inhala, Retén, Exhala
    const [contador, setContador] = useState(4);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!respirando) {
            clearInterval(timerRef.current);
            setFase('Listo para comenzar');
            setContador(4);
            return;
        }

        let faseActual = 'inhala';
        let segundos = 4;
        setFase('Inhala suavemente por la nariz...');
        setContador(4);

        timerRef.current = setInterval(() => {
            segundos--;
            if (segundos > 0) {
                setContador(segundos);
            } else {
                if (faseActual === 'inhala') {
                    faseActual = 'reten';
                    segundos = 7;
                    setFase('Sostén el aire con serenidad...');
                    setContador(7);
                } else if (faseActual === 'reten') {
                    faseActual = 'exhala';
                    segundos = 8;
                    setFase('Exhala muy despacio por la boca...');
                    setContador(8);
                } else {
                    faseActual = 'inhala';
                    segundos = 4;
                    setFase('Inhala suavemente por la nariz...');
                    setContador(4);
                }
            }
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [respirando]);

    // -------------------------------------------------------------
    // ANCLAJE SENSORIAL 5-4-3-2-1
    // -------------------------------------------------------------
    const [pasosCompletados, setPasosCompletados] = useState({});

    const togglePaso = (idx) => {
        setPasosCompletados(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const pasosAnclaje = [
        { paso: 5, texto: "5 cosas que puedas VER a tu alrededor (ej. un libro, una sombra, tu mano)", icon: <Eye size={18} /> },
        { paso: 4, texto: "4 cosas que puedas TOCAR o sentir en tu piel (la ropa, la mesa, tus pies)", icon: <Hand size={18} /> },
        { paso: 3, texto: "3 cosas que puedas ESCUCHAR (un pájaro, un carro lejano, tu respiración)", icon: <Ear size={18} /> },
        { paso: 2, texto: "2 cosas que puedas OLER (el café, el aire fresco, tu jabón)", icon: <Sparkles size={18} /> },
        { paso: 1, texto: "1 pensamiento positivo o algo que AGRADEZCAS en este momento", icon: <CheckCircle2 size={18} /> }
    ];

    return (
        <div className="autorregularme-page">
            <div className="page-header text-center">
                <span className="section-eyebrow">HERRAMIENTAS INTERACTIVAS DE CALMA</span>
                <h1 className="page-title">Pausa Activa y Autorregulación</h1>
                <p className="page-subtitle">
                    Ejercicios guiados diseñados para devolverle el ritmo a tu cuerpo y serenidad a tus pensamientos.
                </p>
            </div>

            <div className="herramientas-autorregulacion-grid">
                {/* EJERCICIO 1: RESPIRACIÓN 4-7-8 */}
                <div className="herramienta-card">
                    <div className="herramienta-header">
                        <Wind size={22} className="teal-icon" />
                        <div>
                            <h3>Respiración Diafragmática 4-7-8</h3>
                            <span className="herramienta-sub">Reduce taquicardia y sobrepensamiento</span>
                        </div>
                    </div>

                    <div className="respiracion-animada-box">
                        <div className={`circulo-respiracion ${respirando ? 'activo ' + (fase.includes('Inhala') ? 'expandir' : fase.includes('Sostén') ? 'sostener' : 'contraer') : ''}`}>
                            <div className="circulo-inner">
                                <span className="contador-segundos">{contador}</span>
                                <span className="instruccion-fase">{fase}</span>
                            </div>
                        </div>
                    </div>

                    <div className="respiracion-controles">
                        {!respirando ? (
                            <button className="btn-primary" onClick={() => setRespirando(true)}>
                                <Play size={16} />
                                <span>Iniciar respiración guiada</span>
                            </button>
                        ) : (
                            <button className="btn-secondary" onClick={() => setRespirando(false)}>
                                <Pause size={16} />
                                <span>Detener ejercicio</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* EJERCICIO 2: ANCLAJE SENSORIAL 5-4-3-2-1 */}
                <div className="herramienta-card">
                    <div className="herramienta-header">
                        <Eye size={22} className="teal-icon" />
                        <div>
                            <h3>Técnica de Anclaje 5-4-3-2-1</h3>
                            <span className="herramienta-sub">Conéctate con el presente y detén la ansiedad</span>
                        </div>
                    </div>

                    <p className="anclaje-intro">
                        Sigue cada paso sensorial marcando la casilla una vez que lo identifiques en tu entorno:
                    </p>

                    <div className="pasos-anclaje-list">
                        {pasosAnclaje.map((p, idx) => (
                            <div
                                key={idx}
                                className={`paso-anclaje-item ${pasosCompletados[idx] ? 'completado' : ''}`}
                                onClick={() => togglePaso(idx)}
                            >
                                <div className="paso-checkbox">
                                    {pasosCompletados[idx] ? <CheckCircle2 size={18} className="check-done" /> : <span className="checkbox-empty"></span>}
                                </div>
                                <div className="paso-texto">
                                    {p.texto}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn-reset-anclaje"
                        onClick={() => setPasosCompletados({})}
                    >
                        <RotateCcw size={14} />
                        <span>Reiniciar anclaje</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
