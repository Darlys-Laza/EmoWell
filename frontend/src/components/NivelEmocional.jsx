import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Activity, Heart, Shield, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const PREGUNTAS_POR_EMOCION = [
    "¿Con qué frecuencia has sentido esta emoción en las últimas 24 horas?",
    "¿Esta emoción ha afectado tu concentración al estudiar o trabajar?",
    "¿Has notado tensión física en tu cuerpo (cuello, espalda, estómago o respiración)?",
    "¿Sientes que tus pensamientos se aceleran o se vuelven repetitivos?",
    "¿Te ha costado conciliar el sueño o descansar adecuadamente?",
    "¿Sientes dificultad para desconectarte de tus pendientes diarios?",
    "¿Has sentido ganas de aislarte o alejarte de tus amigos o familiares?",
    "¿Sientes que las exigencias del entorno superan tu energía actual?",
    "¿Has podido tomarte al menos una pausa consciente de calma hoy?",
    "¿Sientes que necesitas apoyo o un espacio de escucha en este momento?"
];

export default function NivelEmocional({ setVistaActual }) {
    const [emocion, setEmocion] = useState(null);
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState({});
    const [resultado, setResultado] = useState(null);
    const [analisisIA, setAnalisisIA] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const emocionesDisponibles = [
        { id: 'ansiedad', label: 'Ansiedad' },
        { id: 'estres', label: 'Estrés' },
        { id: 'tristeza', label: 'Tristeza' },
        { id: 'soledad', label: 'Soledad' },
        { id: 'enojo', label: 'Enojo' },
        { id: 'miedo', label: 'Miedo' },
        { id: 'tranquilidad', label: 'Tranquilidad' },
        { id: 'felicidad', label: 'Felicidad' }
    ];

    const seleccionarEmocion = (emo) => {
        setEmocion(emo);
        setPreguntaActual(0);
        setRespuestas({});
        setResultado(null);
        setAnalisisIA(null);
    };

    const responder = (valor) => {
        const nuevasResp = { ...respuestas, [preguntaActual]: valor };
        setRespuestas(nuevasResp);

        if (preguntaActual < PREGUNTAS_POR_EMOCION.length - 1) {
            setPreguntaActual(preguntaActual + 1);
        } else {
            calcularResultado(nuevasResp);
        }
    };

    const calcularResultado = async (resp) => {
        setGuardando(true);
        const valores = Object.values(resp);
        const suma = valores.reduce((a, b) => a + b, 0);
        const promedio = suma / valores.length;

        let nivel = 'Bajo';
        let porcentaje = Math.round((suma / (valores.length * 5)) * 100);

        if (promedio >= 3.6) {
            nivel = 'Alto';
        } else if (promedio >= 2.3) {
            nivel = 'Moderado';
        }

        const resObj = {
            nivel,
            porcentaje,
            emocion: emocion.label
        };
        setResultado(resObj);

        try {
            const apiRes = await api.guardarEmocion({
                emocion: emocion.label,
                nivel,
                nota: `Evaluación con puntaje ${porcentaje}% (${nivel})`,
                respuestas: resp
            });

            if (apiRes && apiRes.data && apiRes.data.analisisIA) {
                setAnalisisIA(apiRes.data.analisisIA);
            } else {
                setAnalisisIA(`Reconocer tu estado de ${emocion.label} (${nivel}) es un paso fundamental. Te recomendamos realizar la pausa de respiración guiada en nuestra sección de Autorregulación y tomar un momento para ti.`);
            }
        } catch (e) {
            setAnalisisIA("Has completado tu evaluación. Recuerda que cuidar de ti y darte pausas conscientes favorece tu estabilidad emocional.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="nivel-page">
            <div className="page-header text-center">
                <span className="section-eyebrow">AUTOEVALUACIÓN Y ORIENTACIÓN</span>
                <h1 className="page-title">Medición de Nivel Emocional</h1>
                <p className="page-subtitle">
                    Identifica cómo te sientes hoy y recibe una guía práctica de autocuidado y bienestar.
                </p>
            </div>

            {/* PASO 1: SELECCIONAR EMOCIÓN */}
            {!emocion && (
                <div className="emociones-selector-card">
                    <h2>¿Cómo describirías tu emoción predominante ahora?</h2>
                    <p className="selector-hint">Elige la opción que más se acerca a lo que estás experimentando:</p>

                    <div className="emociones-grid">
                        {emocionesDisponibles.map(e => (
                            <button
                                key={e.id}
                                className="btn-emocion-card"
                                onClick={() => seleccionarEmocion(e)}
                            >
                                <span className="emocion-label">{e.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* PASO 2: CUESTIONARIO INTERACTIVO */}
            {emocion && !resultado && (
                <div className="cuestionario-card">
                    <div className="cuestionario-header">
                        <span className="cuestionario-tag">Emoción en evaluación: {emocion.icon} {emocion.label}</span>
                        <span className="cuestionario-progreso">Pregunta {preguntaActual + 1} de {PREGUNTAS_POR_EMOCION.length}</span>
                    </div>

                    <div className="barra-progreso-bg">
                        <div
                            className="barra-progreso-fill"
                            style={{ width: `${((preguntaActual + 1) / PREGUNTAS_POR_EMOCION.length) * 100}%` }}
                        ></div>
                    </div>

                    <h3 className="pregunta-texto">{PREGUNTAS_POR_EMOCION[preguntaActual]}</h3>

                    <div className="opciones-likert">
                        {[
                            { val: 1, label: 'Casi nunca' },
                            { val: 2, label: 'Pocas veces' },
                            { val: 3, label: 'A veces' },
                            { val: 4, label: 'Frecuentemente' },
                            { val: 5, label: 'Casi siempre' }
                        ].map(opt => (
                            <button
                                key={opt.val}
                                className="btn-likert"
                                onClick={() => responder(opt.val)}
                            >
                                <span className="likert-num">{opt.val}</span>
                                <span className="likert-label">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="cuestionario-footer">
                        <button className="btn-secondary" onClick={() => setEmocion(null)}>
                            Cambiar de emoción
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: RESULTADO Y ORIENTACIÓN CON IA */}
            {resultado && (
                <div className="resultado-card">
                    <div className="resultado-badge-box">
                        <Activity size={24} className="teal-icon" />
                        <h2>Resultado de tu Nivel Emocional</h2>
                    </div>

                    <div className="score-summary">
                        <div className="score-circle">
                            <span className="score-number">{resultado.porcentaje}%</span>
                            <span className="score-text">Intensidad</span>
                        </div>
                        <div className="score-info">
                            <h3>Nivel {resultado.nivel}: {resultado.emocion}</h3>
                            <p>
                                {resultado.nivel === 'Alto'
                                    ? 'Tu nivel de activación emocional es elevado. Te sugerimos realizar una pausa activa o hablar con alguien de confianza.'
                                    : resultado.nivel === 'Moderado'
                                        ? 'Experimentas un nivel intermedio de intensidad. Aplicar técnicas de relajación puede evitar que aumente el cansancio mental.'
                                        : 'Tu nivel de activación emocional se encuentra en un rango manejable y sereno.'}
                            </p>
                        </div>
                    </div>

                    {/* TARJETA DINÁMICA DE ORIENTACIÓN */}
                    <div className="orientacion-ia-card">
                        <div className="orientacion-header">
                            <Sparkles size={18} className="sparkle-teal" />
                            <h4>Orientación personalizada de EmoWell</h4>
                        </div>
                        <p className="orientacion-texto">
                            {guardando ? "Generando recomendaciones de bienestar..." : analisisIA}
                        </p>
                    </div>

                    {/* ACCIONES POST-EVALUACIÓN */}
                    <div className="resultado-actions">
                        <button className="btn-primary" onClick={() => setVistaActual('autorregularme')}>
                            <span>Ir a ejercicios de autorregulación</span>
                            <ArrowRight size={16} />
                        </button>
                        <button className="btn-secondary" onClick={() => setVistaActual('charlar')}>
                            <span>Hablar sobre esto en el chat</span>
                        </button>
                        <button className="btn-secondary" onClick={() => setEmocion(null)}>
                            <RefreshCw size={14} />
                            <span>Realizar otra medición</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
