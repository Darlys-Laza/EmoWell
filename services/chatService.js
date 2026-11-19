/**
 * Servicio de Inteligencia Emocional y Dinamismo para EmoWell
 * Integra modelos Google Gemini (v1beta API) y un motor heurístico de respaldo
 * con psicología cognitivo-conductual (TCC) y protocolo prioritario de crisis para Colombia.
 */

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const MODELOS_GEMINI = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.5-flash'
];

const CRISIS_PATTERNS = [
    /suicid/i,
    /matar(me|se)?\b/i,
    /morir(me)?\b/i,
    /no quiero vivir/i,
    /quitar(me)? la vida/i,
    /acabar con todo/i,
    /hacer(me)? daño/i,
    /cortar(me)?\b/i,
    /ahorcar(me)?\b/i,
    /despedir(me)? de todos/i,
    /nadie me extrañar[ií]a/i,
    /ya no aguanto m[aá]s vivir/i,
    /no vale la pena vivir/i,
    /autolesi[oó]n/i
];

const LINEAS_AYUDA = [
    { nombre: "Línea 106", desc: "Apoyo emocional y crisis de salud mental (gratis 24/7)" },
    { nombre: "WhatsApp Línea 106", desc: "300 754 8933 (atención por chat)" },
    { nombre: "Línea de Emergencias 123", desc: "Para riesgo inmediato o emergencias" },
    { nombre: "Línea Salvavidas", desc: "311 766 8666 (orientación para jóvenes)" }
];

/**
 * Llama a la API de Google Gemini intentando los modelos en orden de disponibilidad
 */
async function llamarGemini(mensajesPrevios, mensajeUsuario, apiKey) {
    const contents = [];

    // Instrucción de rol y empatía para el asistente
    contents.push({
        role: "user",
        parts: [{
            text: `[INSTRUCCIÓN DEL SISTEMA - EmoWell]
Eres EmoWell, un espacio de acompañamiento emocional inteligente, compasivo, cálido y profundamente humano, diseñado para jóvenes y estudiantes universitarios.
Tu propósito:
1. Conecta directamente con lo que la persona te acaba de contar. Valida su emoción específica (miedo, frustración, soledad, agotamiento, desánimo o alegría) sin recurrir a respuestas genéricas o de manual.
2. NUNCA suenes como un bot repetitivo ni comiences diciendo "Hola, soy EmoWell". Habla como un mentor cercano, empático y reflexivo que escucha con atención plena.
3. Haz preguntas reflexivas y respetuosas que ayuden a la persona a ordenar sus pensamientos y rebajar la sobrecarga mental.
4. Si detectas agobio o ansiedad académica/personal, sugiere micro-pasos realistas (una respiración consciente, pausar pantallas 5 minutos, dividir tareas abrumadoras o enfocarse solo en el día de hoy).
5. Habla en español natural, cercano, cálido y sereno (2 o 3 párrafos fluidos y enriquecedores, o más breve si la situación lo amerita).
6. Jamás emitas diagnósticos clínicos. Si detectas peligro grave, prioriza la vida y seguridad con afecto y responsabilidad.
7. Si la persona menciona sueño, cansancio, siesta o ganas de dormir/descansar, valida con afecto su necesidad de reposar y recargar energías. Deséale un descanso reparador sin atosigarla con preguntas complejas.`
        }]
    });
    contents.push({
        role: "model",
        parts: [{
            text: "Entendido plenamente. Responderé con calidez humana, empatía profunda y escucha activa, abordando con precisión la situación y emoción que la persona comparta."
        }]
    });

    // Agregar últimos 8 mensajes del historial conversacional
    const recientes = (mensajesPrevios || []).slice(-8);
    recientes.forEach(m => {
        contents.push({
            role: m.emisor === 'usuario' ? 'user' : 'model',
            parts: [{ text: m.texto }]
        });
    });

    contents.push({
        role: "user",
        parts: [{ text: mensajeUsuario }]
    });

    let ultimoError = null;

    for (const modelo of MODELOS_GEMINI) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 22000);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        maxOutputTokens: 700
                    }
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Modelo ${modelo} retornó ${response.status}: ${errorText.substring(0, 100)}`);
            }

            const data = await response.json();
            const textoRespuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textoRespuesta && textoRespuesta.trim().length > 0) {
                return textoRespuesta.trim();
            }
        } catch (err) {
            ultimoError = err;
            console.warn(`[Gemini] ${modelo} falló (${err.message}), intentando con siguiente modelo...`);
        }
    }

    throw ultimoError || new Error("No se pudo obtener respuesta de ningún modelo de Gemini");
}

/**
 * Genera una reflexión o frase inspiradora diaria personalizada
 * Garantiza frases 100% completas, con sentido pleno y puntuación final correcta.
 */
async function generarReflexionDiaria(nombreUsuario, apiKey) {
    const clave = apiKey || process.env.GEMINI_API_KEY;
    const nombre = nombreUsuario ? nombreUsuario.split(' ')[0] : 'estudiante';

    // Banco de frases de respaldo completas, cálidas y con sentido pleno
    const opcionesLocales = [
        "No tienes que resolver toda tu vida hoy; solo concéntrate en dar el siguiente paso con calma y confianza.",
        "Tu valor como persona no se define por tu productividad ni por una calificación. Respira hondo y date una pausa.",
        "Está bien no sentirse al 100% todos los días. Sé tan amable y comprensivo/a contigo como lo serías con tu mejor amigo/a.",
        "Permítete hacer una pausa. A veces descansar es la decisión más productiva, valiente y necesaria que puedes tomar.",
        "Cada esfuerzo cuenta, incluso en los días donde solo tuviste fuerzas para levantarte y continuar. Estás avanzando.",
        "La paz mental no llega cuando todo es perfecto, sino cuando decides soltar lo que escapa a tu control.",
        "Tus emociones no son un obstáculo ni un defecto; son señales vivas que merecen ser escuchadas con compasión.",
        "Un día difícil es solo eso: un capítulo breve, no la historia completa de lo que eres capaz de lograr."
    ];

    if (clave) {
        const prompt = `Actúa como EmoWell, una aplicación de bienestar emocional para jóvenes.
Genera una única frase reflexiva o inspiradora completa (de 1 o 2 oraciones) para la nota adhesiva de bienvenida de ${nombre}.
REGLAS OBLIGATORIAS:
- Debe ser una oración completa con sentido pleno, gramática correcta y terminar en punto final.
- NO agregues saludos ni presentaciones (nada de "Hola", "Soy EmoWell", etc.).
- NO uses comillas.
- Tono cálido, humano, realista, sin clichés ni positivismo forzado.`;

        for (const modelo of MODELOS_GEMINI) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${clave}`;
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);

                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 350, temperature: 0.75 }
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const data = await res.json();
                    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (texto) {
                        let limpia = texto.trim()
                            .replace(/^["'«“]|["'»”]$/g, '')
                            .replace(/^(¡?Hola!?,?\s*(soy EmoWell[.,]?\s*)?)/i, '')
                            .trim();

                        // VALIDACIÓN ESTRICTA: la frase debe ser completa, sin quedar truncada ni terminar en conectores
                        const esCompleta = limpia.length >= 25 &&
                            /[.!?]$/.test(limpia) &&
                            !/\b(que|la|el|los|las|de|y|o|en|a|con|por|un|una|pero|aunque)\s*[.!?]?$/i.test(limpia);

                        if (esCompleta) {
                            return {
                                cita: limpia,
                                autor: "EmoWell IA"
                            };
                        }
                    }
                }
            } catch (e) {
                // Siguiente modelo si falla o hay timeout
            }
        }
    }

    // Opciones locales dinámicas garantizadas si no hay API o si la respuesta no pasó el filtro de completitud
    const elegida = opcionesLocales[Math.floor(Math.random() * opcionesLocales.length)];
    return { cita: elegida, autor: "EmoWell" };
}

/**
 * Genera un análisis y orientación emocional personalizado tras un test o registro
 */
async function generarAnalisisEmocional(datosEmocion, apiKey) {
    const { emocion, nivel, nota } = datosEmocion;
    const clave = apiKey || process.env.GEMINI_API_KEY;

    if (clave) {
        const prompt = `Actúa como el equipo de psicología y bienestar de EmoWell.
Un joven usuario acaba de registrar cómo se siente:
- Emoción: ${emocion || 'Incertidumbre'}
- Nivel: ${nivel || 'Medio'}
- Comentario personal: "${nota || 'Sin comentarios'}"

Redacta una orientación breve y humana (máximo 85 palabras) que incluya:
1. Una frase reconociendo y validando lo que siente sin juzgarlo.
2. Dos sugerencias de autocuidado prácticas y aterrizadas para el resto de su día (ej. ejercicios de respiración, tomar agua, desconectar pantallas 10 minutos o dividir pendientes).
En español, tono empático y cálido.`;

        for (const modelo of MODELOS_GEMINI) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${clave}`;
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);

                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const data = await res.json();
                    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (texto && texto.trim()) {
                        return { analisisIA: texto.trim() };
                    }
                }
            } catch (e) {
                // Siguiente modelo
            }
        }
    }

    return {
        analisisIA: `Reconocer que sientes ${emocion || 'esta emoción'} es un gran paso de autoconocimiento. Para acompañar este momento, te sugerimos realizar una respiración diafragmática de 4 tiempos y regalarte un momento de descanso antes de continuar tus actividades.`
    };
}

/**
 * Genera una sugerencia de inspiración para el Espacio Personal (notas, metas, pensamientos)
 * Garantiza oraciones completas y con sentido pleno.
 */
async function generarInspiracionMuro(categoria, tipo, apiKey) {
    const clave = apiKey || process.env.GEMINI_API_KEY;

    const fallbacks = {
        'Inspiración': 'Celebro cada pequeño logro de hoy, porque cada paso cuenta en mi crecimiento personal.',
        'Meta personal': 'Dedicar 15 minutos al final del día para desconectar y agradecer algo bonito.',
        'Calma': 'Suelto lo que escapa a mi control y me enfoco en lo que puedo construir aquí y ahora.',
        'Recuerdo': 'Guardo este momento en el corazón como un recordatorio de que siempre hay luz.',
        'Gratitud': 'Agradezco mi esfuerzo, mi resiliencia y a las personas que me apoyan en el camino.'
    };

    if (clave) {
        const prompt = `Actúa como EmoWell. Genera una frase inspiradora, pensamiento o meta corta (entre 10 y 20 palabras) para una tarjeta personal en la categoría "${categoria || 'Inspiración'}".
Debe ser una oración completa con sentido pleno, en español, que termine en punto final. No uses comillas.`;

        for (const modelo of MODELOS_GEMINI) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${clave}`;
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000);

                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 250, temperature: 0.8 }
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const data = await res.json();
                    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (texto) {
                        const limpia = texto.trim().replace(/^["'«“]|["'»”]$/g, '').trim();
                        if (limpia.length >= 20 && /[.!?]$/.test(limpia) && !/\b(que|la|el|los|las|de|y|o|en|a|con|por|un|una|pero)\s*[.!?]?$/i.test(limpia)) {
                            return limpia;
                        }
                    }
                }
            } catch (e) {}
        }
    }

    return fallbacks[categoria] || 'Soy suficiente tal como soy y avanzo a mi propio ritmo con paciencia.';
}

/**
 * Motor heurístico de inteligencia emocional de respaldo local
 */
function motorEmocionalLocal(texto, mensajesPrevios = []) {
    const t = texto.toLowerCase();

    function palabraCompleta(palabra, str) {
        const regex = new RegExp(`(?<![a-záéíóúüñ])${palabra}(?![a-záéíóúüñ])`, 'iu');
        return regex.test(str);
    }

    if (/^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey|qu[eé] tal|holi)[\s!.,?]*$/i.test(t)) {
        return "¡Hola! Me alegra mucho saludarte. Este es tu rincón seguro para respirar, desahogarte y ordenar lo que sientes sin prisas ni juicios. ¿Cómo te encuentras en este momento?";
    }

    if (/dormir|sue[ñn]o|descans|cansad|agotad|siesta|reponerme|desconectar/.test(t)) {
        return "Descansar y dormir un poco es una excelente decisión. Tu cuerpo y tu mente te están pidiendo esa pausa para recargar energías, y cuidarte también significa saber detenerse a tiempo. Desconéctate con tranquilidad; aquí estaré cuando despiertes si quieres seguir charlando.";
    }

    if (/universidad|colegio|clases|parcial|examen|ex[aá]menes|tarea|profesor|carrera|trabajo|entregar|estudiar|semestre|abrumad|no me alcanza el tiempo|demasiadas cosas/.test(t)) {
        return "La presión de los estudios, las entregas y las exigencias del día a día a menudo nos hacen sentir que cargamos una tonelada en los hombros. Es totalmente comprensible que te sientas con saturación o agobio. Recuerda: tu valor como persona no se mide por una nota ni por resolver todo hoy. ¿Qué es lo que más te preocupa en este momento? ¿Podemos enfocarnos solo en el siguiente paso pequeño?";
    }

    if (/ansied|p[aá]nico|sobrepens|pensando mucho|mente a mil|no puedo parar de pensar|nervios|miedo|angustia|asustad|taquicardia|desesperad/.test(t)) {
        return "Cuando la mente se acelera y sobrepiensa, todo parece urgente y peligroso. Hagamos una pequeña pausa juntos: suelta los hombros, siente tus pies en el suelo, toma aire profundo por la nariz contando mentalmente hasta 4... y suéltalo muy despacio por la boca. De todo lo que da vueltas en tu cabeza ahora mismo, ¿cuál es el pensamiento que más ruido te hace?";
    }

    if (/triste|llor|baj[oó]n|desganad|sin fuerzas|vac[ií]o|desesperanz|abatid|deprim|me duele mucho/.test(t)) {
        return "Siento mucho que estés atravesando por este momento tan pesado. A veces la tristeza no necesita que la apuremos o la 'arreglemos' de inmediato, sino un lugar seguro donde poder ser escuchada sin fingir que todo está bien. Estoy aquí contigo. Si quieres ponerlo en palabras, ¿hace cuánto vienes sintiendo esto?";
    }

    if (/sol[oa]|nadie me entiende|incomprendid|aislad|rechazad|nadie me quiere|no encajo/.test(t)) {
        return "Sentirse solo o pensar que nadie comprende lo que pasa por dentro es una de las experiencias más difíciles de transitar. Aunque a veces parezca que los demás van a otro ritmo, lo que tú sientes es completamente válido y no estás defectuoso/a por sentirte así. ¿Hay algo en particular que haya detonado esta soledad hoy?";
    }

    if (palabraCompleta("ex", t) || /novi[oa]|pareja|ruptura|terminamos|me dej[oó]|desamor|coraz[oó]n roto|rechazo/.test(t)) {
        return "El dolor de una ruptura o el desamor remueve muchas cosas: la rutina, las expectativas y el valor propio. Es natural sentir un remolino de tristeza, nostalgia o incluso enojo. Permítete sentir el duelo sin juzgarte; sanar no es una línea recta. ¿Quieres desahogarte sobre lo que más extrañas o lo que más te dolió?";
    }

    return "Te entiendo perfectamente. A veces el día se siente cargado o simplemente necesitamos respirar y tomarnos un respiro. Si quieres contarme algo más, aquí estoy con calma; y si prefieres solo descansar, date ese permiso con tranquilidad.";
}

/**
 * Función principal para procesar mensajes del chat
 */
async function procesarMensajeChat(mensaje, mensajesPrevios = [], apiKey = null) {
    const textoLimpio = (mensaje || "").trim();
    if (!textoLimpio) {
        return {
            respuesta: "Hola, cuéntame qué estás sintiendo o en qué puedo acompañarte hoy.",
            esAlerta: false
        };
    }

    // 1. Verificación prioritaria de seguridad / crisis
    const coincideCrisis = CRISIS_PATTERNS.some(patron => patron.test(textoLimpio));
    if (coincideCrisis) {
        return {
            respuesta: "Veo que estás pasando por un momento de mucho sufrimiento y quiero decirte con el corazón que no tienes que enfrentar esto solo/a. Tu vida y tu bienestar son profundamente valiosos. Por favor, permítele a alguien especializado acompañarte ahora mismo.",
            esAlerta: true,
            lineasAyuda: LINEAS_AYUDA
        };
    }

    // 2. Si se suministró API Key de Gemini o está en .env, usar los modelos Gemini 3.x
    const claveGemini = apiKey || process.env.GEMINI_API_KEY;
    if (claveGemini) {
        try {
            const respuestaIA = await llamarGemini(mensajesPrevios, textoLimpio, claveGemini);
            return {
                respuesta: respuestaIA,
                esAlerta: false,
                proveedor: "gemini"
            };
        } catch (err) {
            console.warn("[Chat] Fallo temporal con Gemini API, recurriendo a motor psicológico local:", err.message);
        }
    }

    // 3. Fallback al motor emocional psicológico local
    const respuestaLocal = motorEmocionalLocal(textoLimpio, mensajesPrevios);
    return {
        respuesta: respuestaLocal,
        esAlerta: false,
        proveedor: "local"
    };
}

module.exports = {
    procesarMensajeChat,
    generarReflexionDiaria,
    generarAnalisisEmocional,
    generarInspiracionMuro,
    LINEAS_AYUDA
};
