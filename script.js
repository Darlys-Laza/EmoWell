
console.log("EmoWell está funcionando");

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // 1. NAVEGACIÓN Y ACCESO AL PROTOTIPO
    // =====================================================

    const vistas = document.querySelectorAll(".vista");
    const navegacionPrivada = document.getElementById("navegacion-privada");
    const accionesPublicas = document.getElementById("acciones-publicas");
    const accionesPrivadas = document.getElementById("acciones-privadas");
    const formularioLogin = document.getElementById("form-login");
    const formularioRegistro = document.getElementById("form-registro");
    const bienvenida = document.getElementById("bienvenida");
    const botonCerrarSesion = document.getElementById("cerrar-sesion");
    const piePagina = document.getElementById("pie-pagina");

    let sesionIniciada = false;
    let vistaAnterior = "vista-inicio";

    const vistasPublicas = [
        "vista-publica",
        "vista-login",
        "vista-registro",
        "vista-emergencia"
    ];

    function mostrarVista(idVista) {

        const seleccionada = document.getElementById(idVista);

        if (!seleccionada) {
            console.error("No existe la vista:", idVista);
            return;
        }

        if (!sesionIniciada && !vistasPublicas.includes(idVista)) {
            mostrarVista("vista-login");
            return;
        }

        const actual = document.querySelector(
            ".vista[style*='display: block'], .vista[style*='display: grid']"
        );

        if (
            actual &&
            actual.id !== idVista &&
            idVista !== "vista-login" &&
            idVista !== "vista-registro"
        ) {
            vistaAnterior = actual.id;
        }

        vistas.forEach(vista => {
            vista.style.display = "none";
        });

        seleccionada.style.display =
            seleccionada.classList.contains("pantalla-acceso")
                ? "grid"
                : "block";

        if (piePagina) {
            piePagina.style.display =
                idVista === "vista-publica" ? "flex" : "none";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function actualizarEncabezado() {

        document.body.classList.toggle(
            "sesion-no-iniciada",
            !sesionIniciada
        );

        if (navegacionPrivada) {
            navegacionPrivada.classList.toggle(
                "oculto",
                !sesionIniciada
            );
        }

        if (accionesPublicas) {
            accionesPublicas.classList.toggle(
                "oculto",
                sesionIniciada
            );
        }

        if (accionesPrivadas) {
            accionesPrivadas.classList.toggle(
                "oculto",
                !sesionIniciada
            );
        }
    }

    function entrarAlPrototipo(nombre) {

        sesionIniciada = true;

        actualizarEncabezado();

        if (bienvenida) {
            bienvenida.textContent = nombre
                ? "¡Hola, " + nombre + "!"
                : "¡Hola!";
        }

        mostrarVista("vista-inicio");
    }

    document.querySelectorAll("[data-vista]").forEach(boton => {

        boton.addEventListener("click", () => {
            mostrarVista(boton.dataset.vista);
        });

    });

    document.querySelectorAll(".opcion[data-vista]").forEach(tarjeta => {

        tarjeta.addEventListener("keydown", evento => {

            if (evento.key === "Enter" || evento.key === " ") {

                evento.preventDefault();

                mostrarVista(tarjeta.dataset.vista);
            }

        });

    });

    document.querySelectorAll(".volver").forEach(boton => {

        boton.addEventListener("click", () => {

            if (
                vistaAnterior === "vista-emergencia" ||
                vistaAnterior === "vista-publica"
            ) {
                mostrarVista(vistaAnterior);
            } else {
                mostrarVista("vista-inicio");
            }

        });

    });

    document.querySelectorAll("[data-desplazamiento]").forEach(boton => {

        boton.addEventListener("click", () => {

            if (!sesionIniciada) {
                mostrarVista("vista-publica");
            }

            const seccion = document.getElementById(
                boton.dataset.desplazamiento
            );

            if (seccion) {
                seccion.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });

    });

    // Inicio de sesión demostrativo

    if (formularioLogin) {

        formularioLogin.addEventListener("submit", evento => {

            evento.preventDefault();

            entrarAlPrototipo("");

            formularioLogin.reset();

        });

    }

    // Registro demostrativo

    if (formularioRegistro) {

        formularioRegistro.addEventListener("submit", evento => {

            evento.preventDefault();

            const campoNombre =
                document.getElementById("nombre-registro");

            entrarAlPrototipo(
                campoNombre ? campoNombre.value.trim() : ""
            );

            formularioRegistro.reset();

        });

    }

    // Cerrar sesión

    if (botonCerrarSesion) {

        botonCerrarSesion.addEventListener("click", () => {

            sesionIniciada = false;

            actualizarEncabezado();

            mostrarVista("vista-publica");

        });

    }


    // =====================================================
    // 2. CHARLAR: MENSAJES Y MODOS DE CONVERSACIÓN (TEXTO / VOZ)
    // =====================================================

    const entradaChat = document.getElementById("entrada-chat");
    const mensajesChat = document.getElementById("mensajes-chat");
    const estadoVoz = document.getElementById("estado-voz");
    const modoTextoBtn = document.getElementById("modo-texto-btn");
    const modoVozBtn = document.getElementById("modo-voz-btn");
    const panelConversacionVoz = document.getElementById("panel-conversacion-voz");
    const textoEstadoVoz = document.getElementById("texto-estado-voz");
    const btnToggleVoz = document.getElementById("btn-toggle-voz");
    const ondaVoz = document.getElementById("onda-voz");
    const botonAudio = document.querySelector(".boton-audio");
    const botonEnviar = document.querySelector(".boton-enviar");

    // Estado del modo: 'texto' (por defecto) o 'voz'
    let modoConversacionActual = "texto";
    let reconocimientoContinuo = null;
    let escuchaActiva = false;
    let reproduciendoVozIA = false;

    // Leer respuestas en voz alta (solo cuando se solicita o en modo voz)
    function leerTexto(texto, alFinalizar) {

        if (!("speechSynthesis" in window)) {
            if (estadoVoz) {
                estadoVoz.textContent = "Tu navegador no permite reproducir voz.";
            }
            if (alFinalizar) alFinalizar();
            return;
        }

        window.speechSynthesis.cancel();

        const voz = new SpeechSynthesisUtterance(texto);
        voz.lang = "es-CO";

        reproduciendoVozIA = true;
        if (ondaVoz) {
            ondaVoz.classList.add("activa");
        }

        voz.onend = () => {
            reproduciendoVozIA = false;
            if (ondaVoz && !escuchaActiva) {
                ondaVoz.classList.remove("activa");
            }
            if (alFinalizar) {
                alFinalizar();
            }
        };

        voz.onerror = () => {
            reproduciendoVozIA = false;
            if (ondaVoz && !escuchaActiva) {
                ondaVoz.classList.remove("activa");
            }
            if (alFinalizar) {
                alFinalizar();
            }
        };

        window.speechSynthesis.speak(voz);
    }

    // Agregar mensajes a la conversación
    function agregarMensaje(texto, tipo) {

        if (!mensajesChat) return;

        const contenedor = document.createElement("div");

        contenedor.className =
            "mensaje " +
            (tipo === "usuario"
                ? "mensaje-usuario"
                : "mensaje-emowell");

        const parrafo = document.createElement("p");
        parrafo.textContent = texto;
        contenedor.appendChild(parrafo);

        // Si el usuario está en modo voz y es mensaje de EmoWell, mostramos el botón opcional de re-escuchar.
        // En modo texto NO se incluye el botón de escuchar respuesta para que la experiencia sea 100% silenciosa y privada en lugares públicos.
        if (tipo !== "usuario" && modoConversacionActual === "voz") {
            const escuchar = document.createElement("button");
            escuchar.type = "button";
            escuchar.className = "reproducir-respuesta";
            escuchar.textContent = "Escuchar de nuevo";
            escuchar.addEventListener("click", () => {
                leerTexto(texto);
            });
            contenedor.appendChild(escuchar);
        }

        mensajesChat.appendChild(contenedor);
        mensajesChat.scrollTop = mensajesChat.scrollHeight;
    }

    // Respuestas demostrativas del chat
    function responderMensaje(texto) {

        const t = texto.toLowerCase();

        if (/triste|llor|solo|sola|vac[ií]o/.test(t)) {
            return "Gracias por confiarme lo que estás sintiendo. No tienes que apresurarte ni encontrar una solución ahora. ¿Quieres contarme qué ocurrió?";
        }

        if (/ansied|miedo|preocup|nervios/.test(t)) {
            return "Parece que esto te está generando preocupación. Podemos ir paso a paso. ¿Qué es lo que más te inquieta en este momento?";
        }

        if (/enojo|rabia|ira|molest/.test(t)) {
            return "Está bien reconocer el enojo; también puede estar señalando que algo te importa o te ha afectado. ¿Qué pasó?";
        }

        if (/feliz|bien|alegr|tranquil/.test(t)) {
            return "Me alegra que compartas también lo que te hace sentir bien. ¿Qué crees que ha contribuido a que te sientas así?";
        }

        return "Te escucho con atención. Gracias por poner en palabras lo que estás viviendo. ¿Quieres contarme un poco más sobre eso?";
    }

    // Enviar mensaje en modo texto
    function enviarMensaje() {

        if (!entradaChat) return;

        const texto = entradaChat.value.trim();

        if (!texto) {
            entradaChat.focus();
            return;
        }

        agregarMensaje(texto, "usuario");
        entradaChat.value = "";

        if (estadoVoz) {
            estadoVoz.textContent = "EmoWell está pensando...";
        }

        window.setTimeout(() => {
            const respuesta = responderMensaje(texto);
            agregarMensaje(respuesta, "emowell");
            if (estadoVoz) {
                estadoVoz.textContent = "Listo. Puedes continuar la conversación escribiendo.";
            }
            // En modo texto la IA NO habla automáticamente para no incomodar en lugares públicos
        }, 400);
    }

    if (botonEnviar) {
        botonEnviar.addEventListener("click", enviarMensaje);
    }

    if (entradaChat) {
        entradaChat.addEventListener("keydown", evento => {
            if (evento.key === "Enter") {
                enviarMensaje();
            }
        });
    }

    // Configuración y gestión del Modo Voz Continua (Hablar sin dar Enviar y responder por voz)
    const ReconocimientoAPI =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    function iniciarReconocimientoContinuo() {

        if (!ReconocimientoAPI) {
            if (textoEstadoVoz) {
                textoEstadoVoz.textContent = "Tu navegador no soporta reconocimiento por voz. Puedes usar el modo escribir.";
            }
            if (estadoVoz) {
                estadoVoz.textContent = "Navegador sin soporte de voz.";
            }
            return;
        }

        if (reproduciendoVozIA) {
            return;
        }

        if (!reconocimientoContinuo) {
            reconocimientoContinuo = new ReconocimientoAPI();
            reconocimientoContinuo.lang = "es-CO";
            reconocimientoContinuo.continuous = false; // Manejado por ciclo conversacional natural
            reconocimientoContinuo.interimResults = false;

            reconocimientoContinuo.onstart = () => {
                escuchaActiva = true;
                if (ondaVoz) ondaVoz.classList.add("activa");
                if (textoEstadoVoz) {
                    textoEstadoVoz.textContent = "Te estoy escuchando... Habla libremente.";
                }
                if (estadoVoz) {
                    estadoVoz.textContent = "Modo voz: escuchando...";
                }
                if (btnToggleVoz) {
                    btnToggleVoz.textContent = "Pausar escucha";
                }
            };

            reconocimientoContinuo.onresult = evento => {
                const transcript = evento.results[0][0].transcript.trim();

                if (transcript) {
                    escuchaActiva = false;
                    if (ondaVoz) ondaVoz.classList.remove("activa");
                    if (textoEstadoVoz) {
                        textoEstadoVoz.textContent = "Mensaje recibido, respondiendo...";
                    }

                    // Agregar mensaje del usuario directamente
                    agregarMensaje(transcript, "usuario");

                    // La IA responde en texto y en voz continua automáticamente
                    window.setTimeout(() => {
                        const respuesta = responderMensaje(transcript);
                        agregarMensaje(respuesta, "emowell");

                        if (textoEstadoVoz) {
                            textoEstadoVoz.textContent = "EmoWell está hablando...";
                        }

                        // Reproducir respuesta en voz
                        leerTexto(respuesta, () => {
                            // Cuando la IA termina de hablar, si seguimos en modo voz, vuelve a escuchar automáticamente
                            if (modoConversacionActual === "voz") {
                                if (textoEstadoVoz) {
                                    textoEstadoVoz.textContent = "Tu turno. Te escucho...";
                                }
                                window.setTimeout(() => {
                                    if (modoConversacionActual === "voz" && !reproduciendoVozIA) {
                                        try {
                                            reconocimientoContinuo.start();
                                        } catch (e) {
                                            // Ya iniciado o reiniciando
                                        }
                                    }
                                }, 300);
                            }
                        });
                    }, 400);
                }
            };

            reconocimientoContinuo.onerror = evento => {
                escuchaActiva = false;
                if (ondaVoz) ondaVoz.classList.remove("activa");

                if (evento.error === "no-speech") {
                    if (textoEstadoVoz) {
                        textoEstadoVoz.textContent = "Te sigo escuchando... Puedes hablar cuando desees.";
                    }
                    // Auto reiniciar escucha continua si el usuario se quedó en silencio un momento
                    if (modoConversacionActual === "voz" && !reproduciendoVozIA) {
                        window.setTimeout(() => {
                            if (modoConversacionActual === "voz" && !reproduciendoVozIA && !escuchaActiva) {
                                try {
                                    reconocimientoContinuo.start();
                                } catch (e) {}
                            }
                        }, 500);
                    }
                } else {
                    if (textoEstadoVoz) {
                        textoEstadoVoz.textContent = "Aviso de audio (" + evento.error + "). Puedes reactivar o escribir.";
                    }
                }
            };

            reconocimientoContinuo.onend = () => {
                escuchaActiva = false;
                if (!reproduciendoVozIA && ondaVoz) {
                    ondaVoz.classList.remove("activa");
                }
                // Si la sesión de reconocimiento terminó por silencio pero seguimos en modo voz y la IA no habla, auto reiniciar para flujo natural continuo
                if (modoConversacionActual === "voz" && !reproduciendoVozIA) {
                    window.setTimeout(() => {
                        if (modoConversacionActual === "voz" && !reproduciendoVozIA && !escuchaActiva) {
                            try {
                                reconocimientoContinuo.start();
                            } catch (e) {
                                if (btnToggleVoz) {
                                    btnToggleVoz.textContent = "Reactivar escucha";
                                }
                            }
                        }
                    }, 400);
                }
            };
        }

        try {
            reconocimientoContinuo.start();
        } catch (e) {
            // Ya estaba en ejecución
        }
    }

    function detenerReconocimientoContinuo() {
        escuchaActiva = false;
        if (reconocimientoContinuo) {
            try {
                reconocimientoContinuo.stop();
            } catch (e) {}
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        reproduciendoVozIA = false;
        if (ondaVoz) {
            ondaVoz.classList.remove("activa");
        }
    }

    // Alternar entre modo Texto y modo Voz
    function cambiarModoConversacion(nuevoModo) {
        modoConversacionActual = nuevoModo;

        if (nuevoModo === "voz") {
            modoVozBtn && modoVozBtn.classList.add("activo");
            modoVozBtn && modoVozBtn.setAttribute("aria-pressed", "true");
            modoTextoBtn && modoTextoBtn.classList.remove("activo");
            modoTextoBtn && modoTextoBtn.setAttribute("aria-pressed", "false");

            panelConversacionVoz && panelConversacionVoz.classList.remove("oculto");

            if (estadoVoz) {
                estadoVoz.textContent = "Modo conversación por voz activado. Habla cuando quieras.";
            }

            iniciarReconocimientoContinuo();
        } else {
            // Modo Texto
            modoTextoBtn && modoTextoBtn.classList.add("activo");
            modoTextoBtn && modoTextoBtn.setAttribute("aria-pressed", "true");
            modoVozBtn && modoVozBtn.classList.remove("activo");
            modoVozBtn && modoVozBtn.setAttribute("aria-pressed", "false");

            panelConversacionVoz && panelConversacionVoz.classList.add("oculto");

            detenerReconocimientoContinuo();

            if (estadoVoz) {
                estadoVoz.textContent = "Modo texto activado: escribe tranquilamente, la IA te responderá en silencio.";
            }

            if (entradaChat) {
                entradaChat.focus();
            }
        }
    }

    if (modoTextoBtn) {
        modoTextoBtn.addEventListener("click", () => cambiarModoConversacion("texto"));
    }

    if (modoVozBtn) {
        modoVozBtn.addEventListener("click", () => cambiarModoConversacion("voz"));
    }

    if (btnToggleVoz) {
        btnToggleVoz.addEventListener("click", () => {
            if (escuchaActiva) {
                detenerReconocimientoContinuo();
                if (textoEstadoVoz) {
                    textoEstadoVoz.textContent = "Escucha pausada. Haz clic en Reactivar para hablar.";
                }
                btnToggleVoz.textContent = "Reactivar escucha";
            } else {
                iniciarReconocimientoContinuo();
            }
        });
    }

    // Botón puntual de micrófono en la barra de texto (Dictado tradicional si el usuario desea dictar mientras escribe)
    if (botonAudio) {
        botonAudio.addEventListener("click", () => {
            if (!ReconocimientoAPI) {
                if (estadoVoz) {
                    estadoVoz.textContent = "Tu navegador no admite dictado por voz. Puedes escribir tu mensaje.";
                }
                return;
            }

            const dictadoPuntual = new ReconocimientoAPI();
            dictadoPuntual.lang = "es-CO";
            dictadoPuntual.interimResults = false;

            botonAudio.classList.add("escuchando");
            if (estadoVoz) estadoVoz.textContent = "Te estoy escuchando para dictar...";

            dictadoPuntual.onresult = evento => {
                if (entradaChat) {
                    entradaChat.value = evento.results[0][0].transcript;
                    entradaChat.focus();
                }
                if (estadoVoz) estadoVoz.textContent = "Mensaje dictado. Puedes editarlo o presionar Enviar.";
            };

            dictadoPuntual.onerror = () => {
                botonAudio.classList.remove("escuchando");
                if (estadoVoz) estadoVoz.textContent = "No pude reconocer la voz. Inténtalo de nuevo o escribe tu mensaje.";
            };

            dictadoPuntual.onend = () => {
                botonAudio.classList.remove("escuchando");
            };

            dictadoPuntual.start();
        });
    }

    // Sugerencias para iniciar una conversación
    document.querySelectorAll("[data-sugerencia]").forEach(boton => {

        boton.addEventListener("click", () => {

            const sugerencias = {
                "desahogarme": "Quiero desahogarme. Hay algo que necesito sacar de mi pecho.",
                "no-se-como-me-siento": "No sé exactamente cómo me siento. ¿Me ayudas a entenderlo?",
                "ordenar-mis-pensamientos": "Necesito ordenar mis pensamientos porque tengo muchas cosas en la cabeza.",
                "algo-me-preocupa": "Hay algo que me preocupa y quisiera hablarlo."
            };

            const textoSugerido = sugerencias[boton.dataset.sugerencia] || "";

            if (modoConversacionActual === "voz") {
                // En modo voz, procesa directamente la sugerencia como diálogo
                agregarMensaje(textoSugerido, "usuario");
                window.setTimeout(() => {
                    const resp = responderMensaje(textoSugerido);
                    agregarMensaje(resp, "emowell");
                    leerTexto(resp, () => {
                        iniciarReconocimientoContinuo();
                    });
                }, 300);
            } else {
                // En modo texto, la coloca en el input para que el usuario pueda editarla o enviarla
                if (entradaChat) {
                    entradaChat.value = textoSugerido;
                    entradaChat.focus();
                }
            }
        });
    });


    // =====================================================
    // 3. NIVEL EMOCIONAL: ENCUESTA PROGRESIVA, CÁLCULO Y GRÁFICA SEMANAL
    // =====================================================

    let emocionSeleccionada = "";

    const preguntasContenedor =
        document.querySelector(".preguntas");

    const botonContinuar =
        document.getElementById("continuar-preguntas");

    const resultadoContenedor =
        document.querySelector(".resultado");

    const historialContenedor =
        document.querySelector(".historial");

    // Banco de 10 preguntas reflexivas y personales según cada emoción (sin emojis)
    const bancoPreguntasEmociones = {
        tristeza: [
            "¿Sientes una sensación de pesadez o desgano para iniciar tus actividades cotidianas hoy?",
            "¿Has sentido ganas de llorar o de aislarte de las personas con las que sueles hablar?",
            "¿Sientes que te cuesta encontrarle ilusión o interés a cosas que normalmente disfrutas?",
            "¿Te has sorprendido con pensamientos de que las cosas no saldrán bien o que nada tiene sentido ahora?",
            "¿Sientes cansancio físico constante, como si la energía se te hubiera agotado?",
            "¿Has sentido que nadie a tu alrededor comprende realmente por lo que estás pasando?",
            "¿Te cuesta concentrarte en el trabajo, clases o deberes debido a este nudo en el pecho?",
            "¿Has dejado de hacer cosas importantes para ti por falta de ánimo o motivación?",
            "¿Sientes que estás cargando con un dolor o vacío que llevas tiempo guardándote?",
            "¿Sientes la necesidad urgente de hacer una pausa, un abrazo o un espacio de consuelo?"
        ],
        ansiedad: [
            "¿Sientes tu corazón latiendo más rápido o una respiración agitada y superficial?",
            "¿Tienes pensamientos constantes sobre situaciones futuras que te generan preocupación extrema?",
            "¿Sientes tensión física acumulada en la mandíbula, los hombros, la espalda o el cuello?",
            "¿Te ha costado quedarte quieto/a, sintiendo una inquietud o agitación interna en el cuerpo?",
            "¿Sientes la necesidad de revisar cosas repetidamente o anticipar el peor escenario posible?",
            "¿Te cuesta conciliar el sueño o te despiertas en medio de la noche con la mente acelerada?",
            "¿Sientes como si algo malo fuera a pasar en cualquier momento sin una razón concreta?",
            "¿Te notas más irritable o con poca paciencia ante pequeños imprevistos del día?",
            "¿Has sentido nudo en la garganta, presión en el pecho o malestar estomacal?",
            "¿Sientes que tienes demasiadas cosas por controlar y que todo se te está saliendo de las manos?"
        ],
        estres: [
            "¿Sientes que el tiempo nunca te alcanza y que las exigencias te sobrepasan por completo?",
            "¿Has tenido dolores de cabeza, rigidez corporal o agotamiento mental al final del día?",
            "¿Sientes que por más que avanzas tus tareas pendientes nunca disminuyen?",
            "¿Te cuesta desconectar la mente del trabajo o responsabilidades incluso en tu tiempo libre?",
            "¿Has reaccionado con frustración o enojo desmedido ante situaciones cotidianas?",
            "¿Sientes que estás cumpliendo con todo mecánicamente pero sin paz mental?",
            "¿Has descuidado tus horas de descanso, alimentación o pausas por seguir cumpliendo deberes?",
            "¿Sientes que tienes tantas cosas en la cabeza que olvidas detalles sencillos?",
            "¿Te sientes al límite de tu resistencia física o emocional?",
            "¿Sientes que necesitas con urgencia un respiro sin interrupciones para recuperar tu centro?"
        ],
        enojo: [
            "¿Sientes un calor intenso en el cuerpo, el ceño fruncido o los puños/mandíbula apretados?",
            "¿Sientes que se ha cometido una injusticia contra ti o que no se te ha respetado?",
            "¿Te cuesta calmar los pensamientos de reproche hacia una persona o situación particular?",
            "¿Sientes impulsos de alzar la voz, golpear algo o responder de manera cortante?",
            "¿Sientes que la molestia no disminuye aun después de haber pasado tiempo del hecho?",
            "¿Te sientes frustrado/a porque las cosas no salieron como esperabas o según lo acordado?",
            "¿Has sentido que la ira te nubla la cabeza para pensar con tranquilidad?",
            "¿Sientes que los demás minimizan tu molestia o no entienden tu punto de vista?",
            "¿Te resulta difícil escuchar razones cuando estás en medio de este malestar?",
            "¿Sientes que necesitas una forma sana de descargar toda esta energía contenida?"
        ],
        miedo: [
            "¿Sientes una sensación de alarma o peligro constante que te pone a la defensiva?",
            "¿Tienes dudas severas sobre tu capacidad para afrontar una situación que se avecina?",
            "¿Has sentido escalofríos, manos frías o temblores ligeros en las extremidades?",
            "¿Evitas activamente tomar decisiones, hablar con alguien o enfrentar un reto por temor?",
            "¿Imaginas desenlaces desfavorables que te paralizan o te impiden actuar?",
            "¿Sientes inseguridad sobre tu bienestar, estabilidad o el futuro próximo?",
            "¿Te sientes vulnerable o expuesto/a ante personas o entornos específicos?",
            "¿Buscas confirmación o seguridad constante en otras personas para sentirte a salvo?",
            "¿Sientes que tu mente magnifica los peligros más allá de la realidad objetiva?",
            "¿Sientes que necesitas encontrar un refugio seguro para recuperar tu confianza?"
        ],
        soledad: [
            "¿Sientes que, incluso estando rodeado/a de gente, nadie te conoce ni te comprende de verdad?",
            "¿Has deseado tener una conversación sincera y profunda pero sientes que no hay con quién?",
            "¿Pasas largos períodos en silencio sintiendo un vacío o lejanía emocional?",
            "¿Te da la impresión de que si necesitas ayuda no tendrías a quién acudir inmediatamente?",
            "¿Sientes nostalgia o extrañas con fuerza momentos o vínculos de tu pasado?",
            "¿Te cuesta pedir compañía o expresar tu vulnerabilidad por temor al rechazo?",
            "¿Sientes que las redes sociales o mensajes superficiales aumentan tu sensación de desconexión?",
            "¿Has pasado días enteros sin compartir cómo te sientes realmente por dentro?",
            "¿Sientes que los demás tienen su vida resuelta y que tú estás al margen?",
            "¿Sientes que mereces un espacio donde seas escuchado/a con calidez y sin juicios?"
        ],
        felicidad: [
            "¿Sientes ligereza en el pecho, ganas de sonreír o de compartir tu energía con otros?",
            "¿Has experimentado hoy momentos de agradecimiento sincero por cosas simples de la vida?",
            "¿Sientes satisfacción personal con lo que has venido logrando o aprendiendo recientemente?",
            "¿Te sientes conectado/a, en sintonía y con apertura hacia quienes te rodean?",
            "¿Sientes que tu cuerpo está relajado, con energía vital y libre de tensiones pesadas?",
            "¿Has disfrutado plenamente de conversaciones, música, una comida o tu entorno hoy?",
            "¿Miras tus metas y tu futuro con optimismo, confianza y entusiasmo?",
            "¿Sientes ganas de hacer sentir bien o alegrar el día a alguien más?",
            "¿Has logrado superar un obstáculo o resolver algo que te tenía inquieto/a?",
            "¿Sientes que estás viviendo en congruencia con lo que te importa y te hace bien?"
        ],
        tranquilidad: [
            "¿Sientes tu respiración serena, profunda y un ritmo cardíaco sosegado?",
            "¿Sientes que tus pensamientos fluyen sin apuro, sin necesidad de correr ni apresurarte?",
            "¿Te sientes en paz con tu presente, sin exigirte resolver todo en este instante?",
            "¿Disfrutas de los momentos de silencio y de la quietud a tu alrededor?",
            "¿Sientes que tus límites están claros y que tu espacio personal está protegido?",
            "¿Has logrado mantener la calma ante comentarios o situaciones que antes te alteraban?",
            "¿Sientes armonía física en tu cuerpo, sin contracturas ni nudos de preocupación?",
            "¿Te sientes en disposición de descansar, reflexionar o contemplar con calma?",
            "¿Confías en que las cosas irán tomando su rumbo a su debido tiempo?",
            "¿Sientes claridad para tomar decisiones desde la serenidad y no desde el impulso?"
        ],
        otra: [
            "¿Sientes una mezcla confusa de emociones que te cuesta clasificar en una sola palabra?",
            "¿Notas sensaciones corporales cambiantes a lo largo del día que llaman tu atención?",
            "¿Sientes que hay un asunto pendiente en tu interior que pide ser escuchado?",
            "¿Te cuesta identificar exactamente qué detonó lo que estás experimentando ahora?",
            "¿Has sentido cambios repentinos de humor o energía en las últimas horas?",
            "¿Sientes curiosidad por explorar y ponerle nombre a lo que te pasa internamente?",
            "¿Sientes que tu mente está procesando muchas cosas a la vez en silencio?",
            "¿Te gustaría tener mayor claridad sobre cómo actuar frente a esta vivencia?",
            "¿Sientes la necesidad de pausar tu día para prestarte un momento de atención?",
            "¿Reconoces que cualquier cosa que sientas en este instante es válida y merece comprensión?"
        ]
    };

    // Historial con persistencia local
    let registrosEmocionales = [];
    try {
        const guardados = localStorage.getItem("emowell_registros_emocionales");
        if (guardados) {
            registrosEmocionales = JSON.parse(guardados);
        }
    } catch (e) {
        registrosEmocionales = [];
    }

    // Nombres legibles para cada emoción (sin emojis)
    const metaEmociones = {
        felicidad: { nombre: "Felicidad", color: "#ec4899" },
        amor: { nombre: "Amor", color: "#f43f5e" },
        sorpresa: { nombre: "Sorpresa", color: "#f59e0b" },
        enojo: { nombre: "Ira", color: "#dc2626" },
        tristeza: { nombre: "Tristeza", color: "#6366f1" },
        miedo: { nombre: "Miedo", color: "#8b5cf6" },
        asco: { nombre: "Repugnancia (Asco)", color: "#10b981" },
        estres: { nombre: "Estrés", color: "#f97316" },
        ansiedad: { nombre: "Ansiedad", color: "#3b82f6" },
        soledad: { nombre: "Soledad", color: "#64748b" },
        tranquilidad: { nombre: "Tranquilidad", color: "#2f8f8a" },
        otra: { nombre: "Exploración", color: "#2f8f8a" }
    };

    // Variables de estado del flujo de encuesta paso a paso
    let indicePreguntaActual = 0;
    let respuestasEncuestaActual = [];
    let preguntasActivas = [];

    // Función para renderizar la pregunta actual de la encuesta paso a paso
    function renderizarPasoEncuesta() {
        if (!preguntasContenedor) return;
        preguntasContenedor.replaceChildren();

        const meta = metaEmociones[emocionSeleccionada] || { nombre: "Emoción", color: "#2f8f8a" };
        const total = preguntasActivas.length;

        // Ocultar botón global de continuar durante la encuesta interactiva
        if (botonContinuar) botonContinuar.style.display = "none";

        // Contenedor principal de la encuesta
        const wrapperEncuesta = document.createElement("div");
        wrapperEncuesta.className = "encuesta-wizard-container animar-aparecer";

        // Barra de progreso y encabezado
        const porcentaje = Math.round(((indicePreguntaActual) / total) * 100);
        wrapperEncuesta.innerHTML = `
            <div class="encuesta-header-info">
                <div class="encuesta-badge-emocion" style="border-color: ${meta.color}; color: #235854;">
                    <span>Evaluando: <strong>${meta.nombre}</strong></span>
                </div>
                <span class="encuesta-contador-pasos">Pregunta ${indicePreguntaActual + 1} de ${total}</span>
            </div>
            <div class="encuesta-progress-bar-bg">
                <div class="encuesta-progress-bar-fill" style="width: ${porcentaje}%;"></div>
            </div>
            <div class="encuesta-card-cuestionario">
                <p class="encuesta-texto-pregunta">${preguntasActivas[indicePreguntaActual]}</p>
                <p class="encuesta-subtexto-guia">Selecciona la opción que mejor describe tu vivencia:</p>
                <div class="encuesta-opciones-grid" id="encuesta-opciones-grupo">
                    <button type="button" class="encuesta-opcion-btn" data-valor="1">
                        <span class="opc-num">1</span>
                        <span class="opc-txt">Para nada / Casi nunca</span>
                    </button>
                    <button type="button" class="encuesta-opcion-btn" data-valor="2">
                        <span class="opc-num">2</span>
                        <span class="opc-txt">Poco presente</span>
                    </button>
                    <button type="button" class="encuesta-opcion-btn" data-valor="3">
                        <span class="opc-num">3</span>
                        <span class="opc-txt">Moderado / A veces</span>
                    </button>
                    <button type="button" class="encuesta-opcion-btn" data-valor="4">
                        <span class="opc-num">4</span>
                        <span class="opc-txt">Bastante presente</span>
                    </button>
                    <button type="button" class="encuesta-opcion-btn" data-valor="5">
                        <span class="opc-num">5</span>
                        <span class="opc-txt">Totalmente presente</span>
                    </button>
                </div>
            </div>
            <div class="encuesta-controles-nav">
                ${indicePreguntaActual > 0 ? '<button type="button" class="btn-secundario-lindo" id="btn-encuesta-anterior">← Pregunta anterior</button>' : '<span></span>'}
            </div>
        `;

        preguntasContenedor.appendChild(wrapperEncuesta);

        // Al hacer clic en una opción, se guarda y pasa automáticamente a la siguiente pregunta
        wrapperEncuesta.querySelectorAll(".encuesta-opcion-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const valor = Number(btn.getAttribute("data-valor"));
                respuestasEncuestaActual[indicePreguntaActual] = valor;

                btn.classList.add("seleccionado");

                // Transición fluida a la siguiente pregunta
                setTimeout(() => {
                    if (indicePreguntaActual + 1 < total) {
                        indicePreguntaActual++;
                        renderizarPasoEncuesta();
                    } else {
                        finalizarEncuestaYCalcular();
                    }
                }, 220);
            });
        });

        const btnAnterior = document.getElementById("btn-encuesta-anterior");
        if (btnAnterior) {
            btnAnterior.addEventListener("click", () => {
                if (indicePreguntaActual > 0) {
                    indicePreguntaActual--;
                    renderizarPasoEncuesta();
                }
            });
        }
    }

    // Finalizar encuesta y procesar cálculo de 0 a 5
    function finalizarEncuestaYCalcular() {
        if (!preguntasContenedor) return;

        const suma = respuestasEncuestaActual.reduce((a, b) => a + b, 0);
        const promedio = suma / respuestasEncuestaActual.length;
        const nivel = promedio.toFixed(1);

        let etiqueta = "Bajo";
        let mensajeOrientador = "";
        let colorNivel = "#10b981";

        if (promedio < 2.2) {
            etiqueta = "Bajo";
            mensajeOrientador = "La emoción se encuentra presente de manera leve o manejable. Es una buena oportunidad para sostener tus hábitos saludables y tu serenidad.";
            colorNivel = "#10b981";
        } else if (promedio < 3.8) {
            etiqueta = "Moderado";
            mensajeOrientador = "La emoción tiene una presencia notable en tu día. Te sugerimos realizar uno de nuestros ejercicios de autorregulación guiados para recuperar tu balance.";
            colorNivel = "#f59e0b";
        } else {
            etiqueta = "Alto";
            mensajeOrientador = "La intensidad de esta emoción es alta y puede resultarte demandante. Recuerda que no tienes que enfrentar todo a solas: tómate una pausa guiada o comunícate con nuestras líneas de apoyo.";
            colorNivel = "#ef4444";
        }

        const meta = metaEmociones[emocionSeleccionada] || { nombre: emocionSeleccionada, color: "#2f8f8a" };

        // Mostrar pantalla de finalización de encuesta dentro del contenedor
        preguntasContenedor.innerHTML = `
            <div class="encuesta-finalizada-card animar-aparecer">
                <span class="badge-completado">Cuestionario completado</span>
                <h4>Has respondido las ${preguntasActivas.length} preguntas</h4>
                <p>Tu nivel emocional ha sido calculado con éxito a partir de tus respuestas.</p>
                <button type="button" class="btn-primary-action" id="btn-ver-resultado-calculado">Ver mi resultado detallado</button>
            </div>
        `;

        const btnVerRes = document.getElementById("btn-ver-resultado-calculado");
        if (btnVerRes) {
            btnVerRes.addEventListener("click", () => {
                const seccionResultado = document.querySelector(".resultado-emocional");
                if (seccionResultado) seccionResultado.scrollIntoView({ behavior: "smooth" });
            });
        }

        // Renderizar resultado detallado
        if (resultadoContenedor) {
            resultadoContenedor.replaceChildren();

            const tarjetaResultado = document.createElement("div");
            tarjetaResultado.className = "tarjeta-resultado-completo";

            tarjetaResultado.innerHTML = `
                <div class="resultado-nivel-circulo" style="border-color: ${colorNivel};">
                    <span class="resultado-numero-grande" style="color: ${colorNivel};">${nivel}</span>
                    <span class="resultado-escala-max">de 5</span>
                </div>

                <div class="resultado-texto-bloque">
                    <span class="badge-nivel-alerta" style="background-color: ${colorNivel}20; color: ${colorNivel}; border: 1px solid ${colorNivel};">
                        Nivel ${etiqueta} (${meta.nombre})
                    </span>
                    <h4>Cálculo de presencia emocional completado</h4>
                    <p class="resultado-explicacion">${mensajeOrientador}</p>
                    <p class="resultado-disclaimer">
                        <em>* Este resultado promedio de 0 a 5 es orientativo y busca acompañar tu proceso de autoconocimiento.</em>
                    </p>
                </div>
            `;

            resultadoContenedor.appendChild(tarjetaResultado);
        }

        // Guardar registro en historial y persistir en localStorage
        const ahora = new Date();
        const fechaTxt = ahora.toLocaleDateString("es-CO");
        const horaTxt = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

        // Determinar semana del mes para la gráfica
        const diaMes = ahora.getDate();
        const numSemana = Math.ceil(diaMes / 7);
        const mesesCortos = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const anioCorto = String(ahora.getFullYear()).slice(-2);
        const etiquetaEjeX = `${mesesCortos[ahora.getMonth()]} S${numSemana} ${anioCorto}`;

        registrosEmocionales.push({
            emocion: emocionSeleccionada,
            nivel: nivel,
            etiqueta: etiqueta,
            mensajeOrientador: mensajeOrientador,
            fecha: fechaTxt,
            hora: horaTxt,
            semanaMes: etiquetaEjeX
        });

        try {
            localStorage.setItem("emowell_registros_emocionales", JSON.stringify(registrosEmocionales));
        } catch (e) {}

        pintarHistorial();

        // Desplazar suavemente a la tarjeta de resultado
        const seccionResultado = document.querySelector(".resultado-emocional");
        if (seccionResultado) {
            seccionResultado.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Al seleccionar una emoción:
    // 1. Resalta el botón
    // 2. Prepara las 10 preguntas e inicia la encuesta interactiva pregunta por pregunta
    // 3. Desplaza la página directamente al cuestionario
    document.querySelectorAll("[data-emocion]").forEach(boton => {
        boton.addEventListener("click", () => {
            emocionSeleccionada = boton.dataset.emocion;

            document.querySelectorAll("[data-emocion]").forEach(opcion => {
                opcion.classList.remove("emocion-seleccionada");
                opcion.setAttribute("aria-pressed", "false");
            });

            boton.classList.add("emocion-seleccionada");
            boton.setAttribute("aria-pressed", "true");

            preguntasActivas = bancoPreguntasEmociones[emocionSeleccionada] || bancoPreguntasEmociones.otra;
            indicePreguntaActual = 0;
            respuestasEncuestaActual = [];

            renderizarPasoEncuesta();

            const seccionPreguntas = document.querySelector(".preguntas-emocionales");
            if (seccionPreguntas) {
                seccionPreguntas.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Diagrama visual según imagen del usuario:
    // Eje Y con las 9 emociones (Felicidad, Amor, Sorpresa, Ira, Tristeza, Miedo, Repugnancia/Asco, Estrés, Ansiedad)
    // Eje X: Semana del mes (ej. Mar S4 26, Abr S5 26, May S3 26...)
    // Puntos con el total de registros en ese punto y línea conectora
    function pintarHistorial() {
        if (!historialContenedor) return;
        historialContenedor.replaceChildren();

        const listaEmocionesY = [
            { id: "felicidad", label: "Felicidad", color: "#ec4899" },
            { id: "amor", label: "Amor", color: "#f43f5e" },
            { id: "sorpresa", label: "Sorpresa", color: "#f59e0b" },
            { id: "enojo", label: "Ira", color: "#dc2626" },
            { id: "tristeza", label: "Tristeza", color: "#6366f1" },
            { id: "miedo", label: "Miedo", color: "#8b5cf6" },
            { id: "asco", label: "Repugnancia (Asco)", color: "#10b981" },
            { id: "estres", label: "Estrés", color: "#f97316" },
            { id: "ansiedad", label: "Ansiedad", color: "#3b82f6" }
        ];

        // Mapeador de emoción registrada a fila en el eje Y (0 = Felicidad arriba, 8 = Ansiedad abajo)
        function obtenerIndiceY(emocionId) {
            const idx = listaEmocionesY.findIndex(e => e.id === emocionId);
            if (idx !== -1) return idx;
            if (emocionId === "soledad") return 4; // mapear cerca a tristeza
            if (emocionId === "tranquilidad") return 0; // arriba
            return 4;
        }

        // Construir datos de puntos a partir de registros reales o datos demostrativos si está recién abierto
        let datosGrafica = [];
        if (registrosEmocionales.length >= 2) {
            // Agrupar por semana o tomar los últimos registros
            const ultimos = registrosEmocionales.slice(-7);
            datosGrafica = ultimos.map((reg, idx) => ({
                emocion: reg.emocion,
                etiquetaX: reg.semanaMes || reg.fecha,
                valorY: obtenerIndiceY(reg.emocion),
                conteo: Math.max(1, Math.round(parseFloat(reg.nivel)))
            }));
        } else {
            // Datos iniciales de referencia idénticos a la gráfica de la guía del usuario
            datosGrafica = [
                { emocion: "tristeza", etiquetaX: "Mar S4 26", valorY: 4, conteo: 2 },
                { emocion: "tristeza", etiquetaX: "Mar S5 26", valorY: 4, conteo: 1 },
                { emocion: "amor", etiquetaX: "Abr S2 26", valorY: 1, conteo: 3 },
                { emocion: "amor", etiquetaX: "Abr S3 26", valorY: 1, conteo: 2 },
                { emocion: "enojo", etiquetaX: "Abr S5 26", valorY: 3, conteo: 4 },
                { emocion: "tristeza", etiquetaX: "May S1 26", valorY: 4, conteo: 1 },
                { emocion: "amor", etiquetaX: "May S3 26", valorY: 1, conteo: 3 },
                { emocion: "miedo", etiquetaX: "May S4 26", valorY: 5, conteo: 1 },
                { emocion: "tristeza", etiquetaX: "Jun S1 26", valorY: 4, conteo: 2 }
            ];

            // Si hay 1 registro del usuario, lo colocamos al final
            if (registrosEmocionales.length === 1) {
                const unico = registrosEmocionales[0];
                datosGrafica.push({
                    emocion: unico.emocion,
                    etiquetaX: unico.semanaMes || unico.fecha,
                    valorY: obtenerIndiceY(unico.emocion),
                    conteo: Math.max(1, Math.round(parseFloat(unico.nivel)))
                });
            }
        }

        const contenedorGraficaCompleta = document.createElement("div");
        contenedorGraficaCompleta.className = "contenedor-grafica-tendencia-emocional";

        // Título superior del gráfico idéntico a la imagen
        const encabezadoGrafica = document.createElement("div");
        encabezadoGrafica.className = "grafica-subtitulo-leyenda";
        encabezadoGrafica.textContent = "Tendencia emocional: línea = emoción predominante | Eje X: Semana del mes | Punto: total de registros";
        contenedorGraficaCompleta.appendChild(encabezadoGrafica);

        // Estructura visual SVG interactiva
        const anchoSvg = 760;
        const altoSvg = 400;
        const paddingLeft = 170;
        const paddingRight = 40;
        const paddingTop = 30;
        const paddingBottom = 60;

        const anchoUtil = anchoSvg - paddingLeft - paddingRight;
        const altoUtil = altoSvg - paddingTop - paddingBottom;
        const numFilas = listaEmocionesY.length;
        const pasoY = altoUtil / (numFilas - 1);
        const pasoX = anchoUtil / Math.max(1, datosGrafica.length - 1);

        // Generar líneas de cuadrícula y etiquetas del Eje Y
        let lineasGrid = "";
        let etiquetasYHtml = "";

        listaEmocionesY.forEach((em, idx) => {
            const y = paddingTop + idx * pasoY;
            lineasGrid += `<line x1="${paddingLeft}" y1="${y}" x2="${anchoSvg - paddingRight}" y2="${y}" stroke="#edf2f7" stroke-width="1.5" />`;
            etiquetasYHtml += `
                <text x="${paddingLeft - 18}" y="${y + 4}" text-anchor="end" class="svg-label-y" fill="#4a5568" font-size="12.5" font-weight="500">
                    ${em.label}
                </text>
            `;
        });

        // Líneas verticales de cuadrícula y coordenadas de puntos
        let lineasVerticales = "";
        let puntosCoordenadas = [];

        datosGrafica.forEach((pt, idx) => {
            const x = paddingLeft + idx * pasoX;
            const y = paddingTop + pt.valorY * pasoY;
            puntosCoordenadas.push({ x, y, ...pt });

            lineasVerticales += `<line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${altoSvg - paddingBottom}" stroke="#f1f5f9" stroke-width="1.5" />`;
        });

        // Generar línea poligonal conectora
        const rutaPuntos = puntosCoordenadas.map(p => `${p.x},${p.y}`).join(" ");

        // Generar círculos con halo y números centrales
        let elementosPuntos = "";
        let etiquetasXHtml = "";

        puntosCoordenadas.forEach((pt, idx) => {
            const colorPunto = pt.valorY <= 2 ? "#ec4899" : pt.valorY === 3 ? "#dc2626" : "#6366f1";

            // Halo semitransparente
            elementosPuntos += `
                <circle cx="${pt.x}" cy="${pt.y}" r="13" fill="${colorPunto}" fill-opacity="0.22" />
                <circle cx="${pt.x}" cy="${pt.y}" r="8.5" fill="${colorPunto}" stroke="#ffffff" stroke-width="1.5" />
                <text x="${pt.x}" y="${pt.y + 3.5}" text-anchor="middle" fill="#ffffff" font-size="9.5" font-weight="700">${pt.conteo}</text>
            `;

            // Etiquetas del eje X rotadas
            etiquetasXHtml += `
                <text x="${pt.x}" y="${altoSvg - paddingBottom + 22}" text-anchor="end" transform="rotate(-30, ${pt.x}, ${altoSvg - paddingBottom + 22})" fill="#718096" font-size="11" font-weight="500">
                    ${pt.etiquetaX}
                </text>
            `;
        });

        const svgGrafica = `
            <div class="grafica-svg-scroll-wrapper">
                <svg viewBox="0 0 ${anchoSvg} ${altoSvg}" class="svg-tendencia-emocional" xmlns="http://www.w3.org/2000/svg">
                    ${lineasGrid}
                    ${lineasVerticales}
                    ${etiquetasYHtml}
                    ${etiquetasXHtml}
                    <polyline points="${rutaPuntos}" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                    ${elementosPuntos}
                </svg>
            </div>
        `;

        contenedorGraficaCompleta.innerHTML += svgGrafica;

        // Debajo del gráfico: lista detallada pero sin emojis
        if (registrosEmocionales.length > 0) {
            const listaDetallada = document.createElement("div");
            listaDetallada.className = "lista-timeline-emocional";
            listaDetallada.style.marginTop = "20px";

            registrosEmocionales.slice().reverse().forEach(registro => {
                const meta = metaEmociones[registro.emocion] || { nombre: registro.emocion, color: "#2f8f8a" };
                const item = document.createElement("div");
                item.className = "timeline-item-card";

                item.innerHTML = `
                    <div class="timeline-badge-texto" style="border-left: 4px solid ${meta.color}; padding-left: 8px;">
                        <span class="timeline-emocion-nombre">${meta.nombre}</span>
                    </div>
                    <div class="timeline-info">
                        <div class="timeline-header-line">
                            <span class="timeline-fecha">${registro.fecha} - ${registro.hora || "Reciente"}</span>
                            <span class="chip-nivel-tag nivel-${registro.etiqueta.toLowerCase()}">${registro.nivel} / 5 (${registro.etiqueta})</span>
                        </div>
                        <p class="timeline-descripcion">${registro.mensajeOrientador || "Registro completado con éxito."}</p>
                    </div>
                `;
                listaDetallada.appendChild(item);
            });

            contenedorGraficaCompleta.appendChild(listaDetallada);
        }

        historialContenedor.appendChild(contenedorGraficaCompleta);
    }

    pintarHistorial();

    // Navegación desde botones del resultado
    document.querySelectorAll(".acciones-resultado button").forEach(btn => {
        btn.addEventListener("click", () => {
            const destino = btn.dataset.vista;
            if (destino) {
                mostrarVista(destino);
            }
        });
    });


    // =====================================================
    // 4. AUTORREGULARME: HERRAMIENTAS GUIADAS, AUDIO, ESPAÑOL Y CONTENIDO CRISTIANO
    // =====================================================

    const contenidoHerramienta =
        document.getElementById("contenido-herramienta");

    // Sub-herramienta 1: Respiración Guiada con técnica seleccionable
    let intervaloRespiracion = null;
    let respiracionActiva = false;

    function detenerRespiracion() {
        respiracionActiva = false;
        if (intervaloRespiracion) {
            clearInterval(intervaloRespiracion);
            intervaloRespiracion = null;
        }
    }

    function cargarHerramientaRespiracion() {
        if (!contenidoHerramienta) return;
        detenerRespiracion();
        detenerSonidoAmbiental();

        contenidoHerramienta.innerHTML = `
            <div class="herramienta-modulo animar-aparecer">
                <div class="herramienta-header-desc">
                    <h3>Respiración Guiada para la Calma</h3>
                    <p>La respiración pausada y consciente activa tu sistema nervioso parasimpático, reduce el ritmo cardíaco y calma los pensamientos apresurados.</p>
                </div>

                <div class="respiracion-selector-tecnica">
                    <label for="tecnica-respiracion">Selecciona un ritmo guiado:</label>
                    <div class="select-wrapper-custom">
                        <select id="tecnica-respiracion" class="chat-input-field select-estilizado">
                            <option value="cuadrada">Respiración Cuadrada (4-4-4-4) - Antiestrés & Enfoque</option>
                            <option value="4-7-8">Técnica 4-7-8 - Relajación profunda & Sueño</option>
                            <option value="calma">Calma Rápida (3-3-3) - Primeros auxilios</option>
                        </select>
                    </div>
                </div>

                <div class="contenedor-circulo-respiracion">
                    <div class="circulo-respiracion-halo"></div>
                    <div class="circulo-respiracion" id="circulo-respiracion">
                        <span id="texto-respiracion" class="texto-respiracion">Listo</span>
                        <span id="contador-respiracion" class="contador-respiracion">4</span>
                    </div>
                </div>

                <div class="respiracion-estadisticas">
                    <span id="ciclos-respiracion" class="ciclos-badge">Ciclos completados: 0</span>
                </div>

                <div class="controles-respiracion">
                    <button type="button" class="btn-primary-action" id="btn-iniciar-respiracion">Iniciar ejercicio guiado</button>
                    <button type="button" class="btn-secundario-lindo" id="btn-pausar-respiracion" style="display:none;">Pausar</button>
                </div>
            </div>
        `;

        const btnIniciar = document.getElementById("btn-iniciar-respiracion");
        const btnPausar = document.getElementById("btn-pausar-respiracion");
        const selectorTecnica = document.getElementById("tecnica-respiracion");

        let ciclosCompletados = 0;

        function iniciarCiclo() {
            respiracionActiva = true;
            const circulo = document.getElementById("circulo-respiracion");
            const texto = document.getElementById("texto-respiracion");
            const contador = document.getElementById("contador-respiracion");
            const badgeCiclos = document.getElementById("ciclos-respiracion");

            const tecnica = selectorTecnica ? selectorTecnica.value : "cuadrada";

            let fases = [];
            if (tecnica === "4-7-8") {
                fases = [
                    { nombre: "Inhala", tiempo: 4, escala: 1.3 },
                    { nombre: "Sostén", tiempo: 7, escala: 1.3 },
                    { nombre: "Exhala suave", tiempo: 8, escala: 1.0 }
                ];
            } else if (tecnica === "calma") {
                fases = [
                    { nombre: "Inhala", tiempo: 3, escala: 1.25 },
                    { nombre: "Sostén", tiempo: 3, escala: 1.25 },
                    { nombre: "Exhala", tiempo: 3, escala: 1.0 }
                ];
            } else {
                fases = [
                    { nombre: "Inhala", tiempo: 4, escala: 1.3 },
                    { nombre: "Sostén", tiempo: 4, escala: 1.3 },
                    { nombre: "Exhala", tiempo: 4, escala: 1.0 },
                    { nombre: "Pausa en vacío", tiempo: 4, escala: 1.0 }
                ];
            }

            let indiceFase = 0;
            let segundosRestantes = fases[0].tiempo;

            if (texto) texto.textContent = fases[0].nombre;
            if (contador) contador.textContent = segundosRestantes;
            if (circulo) circulo.style.transform = `scale(${fases[0].escala})`;

            intervaloRespiracion = setInterval(() => {
                if (!respiracionActiva) return;

                segundosRestantes--;

                if (segundosRestantes > 0) {
                    if (contador) contador.textContent = segundosRestantes;
                } else {
                    indiceFase++;
                    if (indiceFase >= fases.length) {
                        indiceFase = 0;
                        ciclosCompletados++;
                        if (badgeCiclos) badgeCiclos.textContent = `Ciclos completados: ${ciclosCompletados}`;
                    }

                    const faseActual = fases[indiceFase];
                    segundosRestantes = faseActual.tiempo;

                    if (texto) texto.textContent = faseActual.nombre;
                    if (contador) contador.textContent = segundosRestantes;
                    if (circulo) circulo.style.transform = `scale(${faseActual.escala})`;
                }
            }, 1000);
        }

        if (btnIniciar) {
            btnIniciar.addEventListener("click", () => {
                iniciarCiclo();
                btnIniciar.style.display = "none";
                btnPausar.style.display = "inline-block";
            });
        }

        if (btnPausar) {
            btnPausar.addEventListener("click", () => {
                detenerRespiracion();
                btnIniciar.style.display = "inline-block";
                btnIniciar.textContent = "Continuar";
                btnPausar.style.display = "none";
                const texto = document.getElementById("texto-respiracion");
                if (texto) texto.textContent = "Pausa";
            });
        }
    }

    // Sub-herramienta 2: Grounding Sensorial 5-4-3-2-1 detallado y optimizado (sin emojis)
    function cargarHerramienta54321() {
        if (!contenidoHerramienta) return;
        detenerRespiracion();
        detenerSonidoAmbiental();

        contenidoHerramienta.innerHTML = `
            <div class="herramienta-modulo animar-aparecer">
                <div class="herramienta-header-desc">
                    <h3>Ejercicio Sensorial de Conexión al Presente (Técnica 5-4-3-2-1)</h3>
                    <p>Cuando la mente se siente abrumada por la ansiedad o el dolor, tus sentidos son el ancla más segura para volver al aquí y al ahora. Ve cumpliendo cada paso a tu propio ritmo.</p>
                </div>

                <div class="pasos-grounding-wizard">
                    <div class="paso-grounding activo" id="paso-g-5">
                        <span class="paso-numero">5</span>
                        <h4>Paso 1: Cinco cosas que puedes VER a tu alrededor</h4>
                        <p class="instruccion-paso">Mira despacio el lugar en el que estás. Elige 5 objetos reales y describe mentalmente un detalle de cada uno (su color, forma o reflejo de luz):</p>
                        <div class="lista-inputs-grounding">
                            <input type="text" class="chat-input-field" placeholder="1. Objeto y detalle (ej. reloj de pared blanco con manecillas negras)">
                            <input type="text" class="chat-input-field" placeholder="2. Objeto y detalle (ej. una planta con bordes amarillos en sus hojas)">
                            <input type="text" class="chat-input-field" placeholder="3. Objeto y detalle (ej. mi libreta con pasta desgastada)">
                            <input type="text" class="chat-input-field" placeholder="4. Objeto y detalle (ej. la sombra que proyecta la ventana)">
                            <input type="text" class="chat-input-field" placeholder="5. Objeto y detalle (ej. el borde metálico de la mesa)">
                        </div>
                        <button type="button" class="btn-primary-action paso-siguiente-btn" data-siguiente="4">Siguiente paso: Tocar</button>
                    </div>

                    <div class="paso-grounding" id="paso-g-4" style="display:none;">
                        <span class="paso-numero">4</span>
                        <h4>Paso 2: Cuatro cosas que puedes TOCAR o SENTIR</h4>
                        <p class="instruccion-paso">Lleva tu atención al contacto físico. Toca y siente 4 texturas o sensaciones concretas:</p>
                        <div class="lista-inputs-grounding">
                            <input type="text" class="chat-input-field" placeholder="1. La tela de mi ropa (¿es suave, áspera o fresca?)">
                            <input type="text" class="chat-input-field" placeholder="2. El apoyo firme de la silla o cama en mi espalda">
                            <input type="text" class="chat-input-field" placeholder="3. La temperatura de mis manos al juntarlas">
                            <input type="text" class="chat-input-field" placeholder="4. La superficie del suelo firme bajo mis pies">
                        </div>
                        <button type="button" class="btn-primary-action paso-siguiente-btn" data-siguiente="3">Siguiente paso: Escuchar</button>
                    </div>

                    <div class="paso-grounding" id="paso-g-3" style="display:none;">
                        <span class="paso-numero">3</span>
                        <h4>Paso 3: Tres cosas que puedes ESCUCHAR</h4>
                        <p class="instruccion-paso">Cierra tus ojos dos segundos. Escucha con atención más allá de tus pensamientos y registra 3 sonidos:</p>
                        <div class="lista-inputs-grounding">
                            <input type="text" class="chat-input-field" placeholder="1. Un sonido lejano (ej. tránsito de autos o aves afuera)">
                            <input type="text" class="chat-input-field" placeholder="2. Un sonido en esta habitación (ej. un ventilador o reloj)">
                            <input type="text" class="chat-input-field" placeholder="3. El sonido más cercano (el aire entrando en tu nariz)">
                        </div>
                        <button type="button" class="btn-primary-action paso-siguiente-btn" data-siguiente="2">Siguiente paso: Oler</button>
                    </div>

                    <div class="paso-grounding" id="paso-g-2" style="display:none;">
                        <span class="paso-numero">2</span>
                        <h4>Paso 4: Dos cosas que puedes OLER</h4>
                        <p class="instruccion-paso">Inhala profundo por la nariz. Busca 2 aromas en tu entorno o en ti:</p>
                        <div class="lista-inputs-grounding">
                            <input type="text" class="chat-input-field" placeholder="1. Aroma ambiental (café, madera, aire fresco)">
                            <input type="text" class="chat-input-field" placeholder="2. El aroma de mi propia ropa limpia o jabón de manos">
                        </div>
                        <button type="button" class="btn-primary-action paso-siguiente-btn" data-siguiente="1">Último paso: Saborear</button>
                    </div>

                    <div class="paso-grounding" id="paso-g-1" style="display:none;">
                        <span class="paso-numero">1</span>
                        <h4>Paso 5: Una cosa que puedes SABOREAR</h4>
                        <p class="instruccion-paso">Nota el sabor actual en tu boca o toma un sorbo lento de agua sintiendo cómo pasa por tu garganta.</p>
                        <input type="text" class="chat-input-field" placeholder="1. Sabor a agua fresca, té o la sensación neutra en mi boca">
                        <div class="grounding-finalizado" style="margin-top:20px;">
                            <span class="badge-completado">Ejercicio sensorial completado</span>
                            <p style="margin-top:10px; color:#235854;">Has regresado al momento presente. Tu cuerpo está seguro y en calma.</p>
                            <button type="button" class="btn-secundario-lindo" id="btn-reiniciar-grounding" style="margin-top:8px;">Reiniciar ejercicio</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        contenidoHerramienta.querySelectorAll(".paso-siguiente-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const siguienteId = btn.getAttribute("data-siguiente");
                contenidoHerramienta.querySelectorAll(".paso-grounding").forEach(p => p.style.display = "none");
                const proximo = document.getElementById("paso-g-" + siguienteId);
                if (proximo) proximo.style.display = "block";
            });
        });

        const btnReiniciar = document.getElementById("btn-reiniciar-grounding");
        if (btnReiniciar) {
            btnReiniciar.addEventListener("click", cargarHerramienta54321);
        }
    }

    // Sub-herramienta 3: Música y Sonidos (Videos en español, música de cantantes, y opción "Soy cristiano")
    let audioContextActivo = null;
    let osciladoresActivos = [];
    let sonidoActivoTipo = null;
    let modoCristianoActivo = false;

    function detenerSonidoAmbiental() {
        if (osciladoresActivos.length > 0) {
            osciladoresActivos.forEach(osc => {
                try { osc.stop(); } catch (e) {}
            });
            osciladoresActivos = [];
        }
        sonidoActivoTipo = null;
        if (contenidoHerramienta) {
            contenidoHerramienta.querySelectorAll(".tarjeta-sonido").forEach(t => {
                t.classList.remove("reproduciendo");
                const b = t.querySelector(".btn-reproducir-sonido");
                if (b) b.textContent = "Escuchar";
            });
        }
    }

    function reproducirSonidoSintetizado(tipo) {
        detenerSonidoAmbiental();
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!audioContextActivo) {
                audioContextActivo = new AudioCtx();
            }
            if (audioContextActivo.state === "suspended") {
                audioContextActivo.resume();
            }

            const ctx = audioContextActivo;
            const ganancia = ctx.createGain();
            ganancia.gain.setValueAtTime(0.15, ctx.currentTime);
            ganancia.connect(ctx.destination);

            if (tipo === "cuenco") {
                const osc = ctx.createOscillator();
                osc.type = "sine";
                osc.frequency.setValueAtTime(432, ctx.currentTime);
                osc.connect(ganancia);
                osc.start();
                osciladoresActivos.push(osc);
            } else if (tipo === "olas") {
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const whiteNoise = ctx.createBufferSource();
                whiteNoise.buffer = buffer;
                whiteNoise.loop = true;

                const filtro = ctx.createBiquadFilter();
                filtro.type = "lowpass";
                filtro.frequency.setValueAtTime(300, ctx.currentTime);

                whiteNoise.connect(filtro);
                filtro.connect(ganancia);
                whiteNoise.start();
                osciladoresActivos.push(whiteNoise);
            } else {
                const osc = ctx.createOscillator();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(216, ctx.currentTime);
                osc.connect(ganancia);
                osc.start();
                osciladoresActivos.push(osc);
            }

            sonidoActivoTipo = tipo;
        } catch (e) {
            console.log("Audio sintetizado no disponible:", e);
        }
    }

    function cargarHerramientaMusicaYSonidos() {
        if (!contenidoHerramienta) return;
        detenerRespiracion();

        contenidoHerramienta.innerHTML = `
            <div class="herramienta-modulo animar-aparecer">
                <div class="herramienta-header-desc">
                    <h3>Música, Charlas y Videos para Comprender tus Emociones</h3>
                    <p>Encuentra música real de cantantes y artistas, paisajes sonoros y charlas en español orientadas a tu bienestar emocional y mental.</p>
                </div>

                <!-- CONTENEDOR DE FILTRO Y BOTÓN MODO CRISTIANO -->
                <div class="barra-filtros-multimedia">
                    <div class="filtro-repertorio-emocion">
                        <label for="selector-emocion-repertorio">Filtrar por estado:</label>
                        <div class="select-wrapper-custom">
                            <select id="selector-emocion-repertorio" class="chat-input-field select-estilizado">
                                <option value="calma">Calma, Ansiedad y Estrés</option>
                                <option value="tristeza">Tristeza, Duelo y Desahogo</option>
                                <option value="animo">Subir el Ánimo y Motivación</option>
                                <option value="enfoque">Concentración y Enfoque</option>
                            </select>
                        </div>
                    </div>

                    <!-- Botón opcional: Soy cristiano -->
                    <button type="button" class="btn-toggle-cristiano ${modoCristianoActivo ? 'cristiano-activo' : ''}" id="btn-toggle-cristiano">
                        ${modoCristianoActivo ? 'Modo cristiano activado' : 'Soy cristiano'}
                    </button>
                </div>

                <!-- SECCIÓN DE MÚSICA REAL -->
                <div class="bloque-multimedia-seccion">
                    <h4 class="subtitulo-multimedia" id="titulo-bloque-musica">Canciones y Álbumes Recomendados (Spotify & YouTube)</h4>
                    <div class="grid-repertorio-musical" id="contenedor-repertorio-musical"></div>
                </div>

                <!-- SECCIÓN DE VIDEOS PEDAGÓGICOS EN ESPAÑOL -->
                <div class="bloque-multimedia-seccion">
                    <h4 class="subtitulo-multimedia" id="titulo-bloque-videos">Videos y Charlas en Español para Comprender lo que Sientes</h4>
                    <div class="grid-videos-emocionales" id="contenedor-videos-emocionales"></div>
                </div>

                <!-- SECCIÓN DE PAISAJES SONOROS -->
                <div class="bloque-multimedia-seccion">
                    <h4 class="subtitulo-multimedia">Frecuencias y Paisajes Sonoros Inmediatos</h4>
                    <div class="grid-sonidos-ambiente">
                        <div class="tarjeta-sonido" data-sonido="cuenco">
                            <h4>Frecuencia 432 Hz</h4>
                            <p>Tono puro alfa para calmar la rumiación y la mente.</p>
                            <button type="button" class="btn-reproducir-sonido btn-primary-action">Escuchar</button>
                        </div>

                        <div class="tarjeta-sonido" data-sonido="olas">
                            <h4>Olas Suaves de Mar</h4>
                            <p>Ondas rítmicas para acompasar el ritmo de tu respiración.</p>
                            <button type="button" class="btn-reproducir-sonido btn-primary-action">Escuchar</button>
                        </div>
                    </div>
                    <div style="margin-top:14px; text-align:center;">
                        <button type="button" class="btn-secundario-lindo" id="btn-silenciar-todo">Silenciar sonidos</button>
                    </div>
                </div>
            </div>
        `;

        // Catálogos: Estándar y Cristiano (100% videos y charlas en español de alta calidad)
        const catalogoEstandar = {
            calma: {
                musica: [
                    { titulo: "Experience - Ludovico Einaudi", artista: "Piano instrumental de serenidad", url: "https://open.spotify.com/track/1BncfTToGARiIQ7Zv6iYJg", plataforma: "Spotify" },
                    { titulo: "Weightless - Marconi Union", artista: "Música ambiental terapéutica", url: "https://www.youtube.com/watch?v=UfcAVejslrU", plataforma: "YouTube" },
                    { titulo: "Spiegel im Spiegel - Arvo Pärt", artista: "Minimalismo clásico relajante", url: "https://www.youtube.com/watch?v=TJ6Mzvh3XCc", plataforma: "YouTube" },
                    { titulo: "Clair de Lune - Claude Debussy", artista: "Piano clásico que brinda serenidad", url: "https://open.spotify.com/track/6N7gsq9tsvOG6EALqss104", plataforma: "Spotify" }
                ],
                videos: [
                    { titulo: "Por qué tus emociones afectan a tu cuerpo | Dra. Marian Rojas Estapé", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "TjqrualxgkI", desc: "La destacada psiquiatra explica en español el efecto del cortisol, la ansiedad y cómo recuperar el equilibrio." },
                    { titulo: "El poder del silencio y la calma interior | Dr. Mario Alonso Puig", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "ZBKbJs5MBFE", desc: "Conferencia magistral en español sobre cómo calmar el ruido mental y la sobreestimulación cotidiana." }
                ]
            },
            tristeza: {
                musica: [
                    { titulo: "Fix You - Coldplay", artista: "Balada sobre acompañar el dolor y reencontrar luz", url: "https://www.youtube.com/watch?v=k4V3Mo61fJM", plataforma: "YouTube" },
                    { titulo: "The Night We Met - Lord Huron", artista: "Canción para abrazar la melancolía y el desahogo", url: "https://www.youtube.com/watch?v=wGF7PswOENQ", plataforma: "YouTube" },
                    { titulo: "Saturn - Sleeping At Last", artista: "Composición de consuelo sobre la belleza de existir", url: "https://open.spotify.com/track/3nFG47gYkF58sKxX22k68Y", plataforma: "Spotify" },
                    { titulo: "Daydreaming - Radiohead", artista: "Balada atmosférica reflexiva", url: "https://open.spotify.com/track/1LIXj1zZ8bX1vFkQG1eY7i", plataforma: "Spotify" }
                ],
                videos: [
                    { titulo: "Mejorar el diálogo interno y dejar de hablarte mal | Pilar Sordo", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "84sn_sMO0cY", desc: "La psicóloga enseña cómo tratarnos con compasión, cuidar la voz interior y superar la tristeza." },
                    { titulo: "Vivir con la pérdida sin dejar de vivir | Gaby Pérez Islas", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "S3MIFuStofQ", desc: "La reconocida tanatóloga explica cómo elaborar el duelo, asimilar el dolor y volver a levantarse." }
                ]
            },
            animo: {
                musica: [
                    { titulo: "Color Esperanza - Diego Torres", artista: "Canción en español para renovar el ánimo y la fuerza", url: "https://www.youtube.com/watch?v=Nb1VOQRs-Vs", plataforma: "YouTube" },
                    { titulo: "Here Comes The Sun - The Beatles", artista: "Un clásico eterno sobre nuevos comienzos luminosos", url: "https://www.youtube.com/watch?v=KQetemT1sWc", plataforma: "YouTube" },
                    { titulo: "Viva la Vida - Coldplay", artista: "Energía orquestal y optimismo vibrante", url: "https://www.youtube.com/watch?v=dvgZkm1xWPE", plataforma: "YouTube" },
                    { titulo: "Good Life - OneRepublic", artista: "Canción enérgica para celebrar la vida", url: "https://open.spotify.com/track/0cIA818y232p2W54h6LpP4", plataforma: "Spotify" }
                ],
                videos: [
                    { titulo: "El valor de tu actitud ante las dificultades | Victor Küppers", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "Z3_f6a-YrY8", desc: "Conferencia motivadora en español sobre la actitud como multiplicador del bienestar y las ganas de vivir." },
                    { titulo: "La clave de todo es tener un sentido de vida | Emilio Duró", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "oeGWtyMAbKk", desc: "Inspiradora charla en español sobre la ilusión, el optimismo y la superación de momentos duros." }
                ]
            },
            enfoque: {
                musica: [
                    { titulo: "Time - Hans Zimmer", artista: "Banda sonora de alta concentración y motivación", url: "https://www.youtube.com/watch?v=RxabLA7UQ9k", plataforma: "YouTube" },
                    { titulo: "Lofi Beats para Estudiar y Relajarse", artista: "Lofi Girl Instrumental", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", plataforma: "YouTube" },
                    { titulo: "Ambient 1 - Brian Eno", artista: "Sonido envolvente diseñado para trabajar en calma", url: "https://open.spotify.com/album/0Hz4g0i4y2bW", plataforma: "Spotify" },
                    { titulo: "Gymnopédie No. 1 - Erik Satie", artista: "Clásica minimalista para despejar la mente", url: "https://open.spotify.com/track/5NGtFXV2I43NIZ", plataforma: "Spotify" }
                ],
                videos: [
                    { titulo: "Cómo entrenar tu atención como si fuera un músculo | Tomás Navarro", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "9AJU3dPuv5o", desc: "El psicólogo explica en español claves para vencer la dispersión, la procrastinación y enfocar la mente." },
                    { titulo: "Neurociencia para entender tu mente y concentración | Ana Ibáñez", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "ae4HtFudbGU", desc: "Conferencia en español en Bogotá sobre entrenamiento cerebral para un enfoque óptimo y productivo." }
                ]
            }
        };

        const catalogoCristiano = {
            calma: {
                musica: [
                    { titulo: "Dame Tus Ojos - Marcela Gándara & Jesús Adrián Romero", artista: "Canción para mirar con el corazón de Dios y hallar paz", url: "https://www.youtube.com/watch?v=T5gGDtW9l2Y", plataforma: "YouTube" },
                    { titulo: "Tu Fidelidad - Marcos Witt", artista: "Adoración clásica de serenidad y confianza plena", url: "https://www.youtube.com/watch?v=9c7OHqDZ4uA", plataforma: "YouTube" },
                    { titulo: "Música Cristiana Instrumental Para Orar (Piano) - Su Presencia", artista: "El Cielo En La Tierra / Adoración Íntima", url: "https://www.youtube.com/watch?v=jFr7jNMBWtI", plataforma: "YouTube" },
                    { titulo: "Renuévame - Marcos Witt", artista: "Oración de calma, rendición y quietud", url: "https://open.spotify.com/track/4M3nK2r7V8x9", plataforma: "Spotify" }
                ],
                videos: [
                    { titulo: "Dante Gebel #528 | Anxiety (Venciendo la ansiedad)", canal: "Dante Gebel (Español)", idYoutube: "PpoVxkn1aAM", desc: "Prédica edificante en español sobre cómo la ansiedad roba la paz y cómo descansar confiadamente en Dios." },
                    { titulo: "Desmontando la ansiedad y el miedo | Itiel Arroyo", canal: "Itiel Arroyo (Español)", idYoutube: "Fny6hmzIX_Y", desc: "Enseñanza práctica y bíblica en español para comprender la mente y derribar la angustia." }
                ]
            },
            tristeza: {
                musica: [
                    { titulo: "Supe Que Me Amabas - Marcela Gándara", artista: "Canción para sanar el corazón herido y recordar Su amor", url: "https://www.youtube.com/watch?v=AB2x_DII3W0", plataforma: "YouTube" },
                    { titulo: "Sumérgeme - Jesús Adrián Romero", artista: "Oración cantada para quien se siente agotado o en sequía", url: "https://www.youtube.com/watch?v=RNzAGNJfDec", plataforma: "YouTube" },
                    { titulo: "No Hay Lugar Más Alto - Miel San Marcos & Christine D'Clario", artista: "Adoración de entrega y rendición personal", url: "https://www.youtube.com/watch?v=uMYj8K_z0zQ", plataforma: "YouTube" },
                    { titulo: "Como Dijiste - Christine D'Clario", artista: "Voz y esperanza para levantar el espíritu quebrantado", url: "https://www.youtube.com/watch?v=3uUJCvdbH3k", plataforma: "YouTube" }
                ],
                videos: [
                    { titulo: "Dante Gebel #470 | Santo desierto", canal: "Dante Gebel (Español)", idYoutube: "rtupGHr1Txs", desc: "Mensaje lleno de esperanza sobre cómo Dios procesa nuestro carácter en los momentos difíciles y de soledad." },
                    { titulo: "Dante Gebel #710 | El desvío (La nueva normalidad)", canal: "Dante Gebel (Español)", idYoutube: "HL358ogDmg8", desc: "Prédica en español sobre la fidelidad de Dios cuando las cosas no salen como planeamos." }
                ]
            },
            animo: {
                musica: [
                    { titulo: "Abres Camino (Way Maker) - Generación 12", artista: "Canción de fe y fortaleza en tiempos de desafío (Colombia)", url: "https://www.youtube.com/watch?v=3ChSymYfUbc", plataforma: "YouTube" },
                    { titulo: "Grande Y Fuerte - Miel San Marcos", artista: "Alabanza enérgica para celebrar la victoria y el gozo", url: "https://www.youtube.com/watch?v=THBXnLgbvkU", plataforma: "YouTube" },
                    { titulo: "Tu Amor No Tiene Fin - Generación 12 & Redimi2", artista: "Alabanza contemporánea llena de vida y entusiasmo", url: "https://www.youtube.com/watch?v=1hPCABGSHk4", plataforma: "YouTube" },
                    { titulo: "Viviré - Marcos Witt", artista: "Himno de perseverancia, gratitud y fe inquebrantable", url: "https://www.youtube.com/watch?v=BC1vmfh-L4Q", plataforma: "YouTube" }
                ],
                videos: [
                    { titulo: "Lo que dices recibes - Andrés Corson", canal: "El Lugar de Su Presencia (Bogotá, Colombia)", idYoutube: "D-UpAUqQ-40", desc: "Prédica del pastor Andrés Corson en Bogotá sobre el poder de las palabras para transformar la vida." },
                    { titulo: "Crecer haciendo brillar a los demás - Mario Alonso Puig", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "kCJkyuhbO10", desc: "Valores éticos y espirituales en español para cultivar un propósito lleno de luz y bendición." }
                ]
            },
            enfoque: {
                musica: [
                    { titulo: "Música Instrumental Para Orar (Piano) - Su Presencia", artista: "Piano devocional para estudiar, reflexionar y orar", url: "https://www.youtube.com/watch?v=jFr7jNMBWtI", plataforma: "YouTube" },
                    { titulo: "Cuan Grande Es Dios - En Espíritu Y En Verdad", artista: "Melodía de contemplación y enfoque espiritual", url: "https://www.youtube.com/watch?v=drFvhcWYS3U", plataforma: "YouTube" },
                    { titulo: "Instrumentales de Adoración Íntima", artista: "Paz y concentración para tu tiempo diario", url: "https://open.spotify.com/album/3K9m2R4v8T1", plataforma: "Spotify" },
                    { titulo: "Guitarra y Piano Devocional", artista: "Colección instrumental para lectura y paz", url: "https://open.spotify.com/playlist/7M2k9R4v1T8", plataforma: "Spotify" }
                ],
                videos: [
                    { titulo: "Cómo entrenar tu atención como un músculo | Tomás Navarro", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "9AJU3dPuv5o", desc: "Enseñanza práctica en español sobre cómo mantener la concentración y dejar de lado las distracciones." },
                    { titulo: "Neurociencia para entender tu mente | Ana Ibáñez", canal: "Aprendemos Juntos BBVA (Español)", idYoutube: "ae4HtFudbGU", desc: "Claves de neurociencia en español para tener una mente renovada, enfocada y en paz." }
                ]
            }
        };

        function actualizarContenidoMultimedia(categoria) {
            const catalogoActivo = modoCristianoActivo ? catalogoCristiano : catalogoEstandar;
            const data = catalogoActivo[categoria] || catalogoActivo.calma;

            const contenedorMusica = document.getElementById("contenedor-repertorio-musical");
            const contenedorVideos = document.getElementById("contenedor-videos-emocionales");
            const tituloVideos = document.getElementById("titulo-bloque-videos");
            const tituloMusica = document.getElementById("titulo-bloque-musica");

            if (tituloMusica) {
                tituloMusica.textContent = modoCristianoActivo ? "Alabanzas y Canciones Cristianas (Spotify & YouTube)" : "Canciones y Álbumes de Artistas (Spotify & YouTube)";
            }

            if (tituloVideos) {
                tituloVideos.textContent = modoCristianoActivo ? "Prédicas y Reflexiones Edificantes en Español" : "Videos y Charlas en Español para Comprender lo que Sientes";
            }

            if (contenedorMusica) {
                contenedorMusica.innerHTML = data.musica.map(item => `
                    <div class="tarjeta-cancion-real">
                        <div class="icono-plataforma-tag tag-${item.plataforma.toLowerCase()}">${item.plataforma}</div>
                        <div class="info-cancion-real">
                            <h5>${item.titulo}</h5>
                            <p>${item.artista}</p>
                        </div>
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn-abrir-musica">
                            Reproducir en ${item.plataforma}
                        </a>
                    </div>
                `).join("");
            }

            if (contenedorVideos) {
                contenedorVideos.innerHTML = data.videos.map(item => `
                    <div class="tarjeta-video-pedagogico">
                        <div class="video-responsive-wrapper">
                            <iframe src="https://www.youtube-nocookie.com/embed/${item.idYoutube}" title="${item.titulo}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <div class="info-video-pedagogico">
                            <h5>${item.titulo}</h5>
                            <span class="canal-video-tag">Canal: ${item.canal}</span>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                `).join("");
            }
        }

        const selectorEmocion = document.getElementById("selector-emocion-repertorio");
        if (selectorEmocion) {
            selectorEmocion.addEventListener("change", (e) => {
                actualizarContenidoMultimedia(e.target.value);
            });
            actualizarContenidoMultimedia(selectorEmocion.value);
        }

        const btnCristiano = document.getElementById("btn-toggle-cristiano");
        if (btnCristiano) {
            btnCristiano.addEventListener("click", () => {
                modoCristianoActivo = !modoCristianoActivo;
                btnCristiano.classList.toggle("cristiano-activo", modoCristianoActivo);
                btnCristiano.textContent = modoCristianoActivo ? "Modo cristiano activado" : "Soy cristiano";
                const catActual = selectorEmocion ? selectorEmocion.value : "calma";
                actualizarContenidoMultimedia(catActual);
            });
        }

        // Conectar botones de paisajes sonoros sintetizados
        contenidoHerramienta.querySelectorAll(".tarjeta-sonido").forEach(tarjeta => {
            const btn = tarjeta.querySelector(".btn-reproducir-sonido");
            const tipo = tarjeta.getAttribute("data-sonido");

            btn.addEventListener("click", () => {
                if (sonidoActivoTipo === tipo) {
                    detenerSonidoAmbiental();
                } else {
                    reproducirSonidoSintetizado(tipo);
                    tarjeta.classList.add("reproduciendo");
                    btn.textContent = "Pausar";
                }
            });
        });

        const btnSilenciar = document.getElementById("btn-silenciar-todo");
        if (btnSilenciar) {
            btnSilenciar.addEventListener("click", detenerSonidoAmbiental);
        }
    }

    // Sub-herramienta 4: Escribir para Soltar (Conservando emoji de la manito con lápiz en el título y quitando llama de fuego)
    function cargarHerramientaEscritura() {
        if (!contenidoHerramienta) return;
        detenerRespiracion();
        detenerSonidoAmbiental();

        contenidoHerramienta.innerHTML = `
            <div class="herramienta-modulo animar-aparecer">
                <div class="herramienta-header-desc">
                    <h3>✍️ Buzón de Desahogo: Escribir para Soltar</h3>
                    <p>Escribe aquí con total libertad todo lo que te enoja, frustra, asusta o pesa. Nada de lo que pongas se guardará en bases de datos ni será juzgado. Al terminar, podrás desvanecerlo simbólicamente para liberar tu mente.</p>
                </div>

                <div class="contenedor-desahogo-escritura">
                    <textarea id="texto-desahogo-personal" class="chat-input-field textarea-desahogo" rows="7" placeholder="Escribe sin filtros ni correcciones... suelta aquí todo lo que llevas en el pecho."></textarea>
                    <div class="acciones-desahogo">
                        <button type="button" class="btn-liberar-fuego" id="btn-liberar-desahogo">
                            Liberar y desvanecer este pensamiento
                        </button>
                    </div>
                </div>

                <div class="mensaje-liberado-exito" id="mensaje-liberado-escritura" style="display:none;">
                    <h4>Has soltado este peso</h4>
                    <p>Las palabras se han disuelto en el aire. Respira hondo: eres mucho más grande y fuerte que aquello que te pesaba en este instante.</p>
                    <button type="button" class="btn-secundario-lindo" id="btn-nuevo-pensamiento" style="margin-top:12px;">Escribir otro pensamiento</button>
                </div>
            </div>
        `;

        const btnLiberar = document.getElementById("btn-liberar-desahogo");
        const textarea = document.getElementById("texto-desahogo-personal");
        const mensajeExito = document.getElementById("mensaje-liberado-escritura");

        if (btnLiberar && textarea) {
            btnLiberar.addEventListener("click", () => {
                if (!textarea.value.trim()) {
                    alert("Escribe algunas líneas antes de liberar tu pensamiento.");
                    return;
                }
                textarea.classList.add("desintegrar-texto");
                setTimeout(() => {
                    textarea.value = "";
                    textarea.classList.remove("desintegrar-texto");
                    textarea.parentElement.style.display = "none";
                    if (mensajeExito) mensajeExito.style.display = "block";
                }, 900);
            });
        }

        const btnNuevo = document.getElementById("btn-nuevo-pensamiento");
        if (btnNuevo && textarea) {
            btnNuevo.addEventListener("click", () => {
                if (mensajeExito) mensajeExito.style.display = "none";
                textarea.parentElement.style.display = "block";
                textarea.focus();
            });
        }
    }

    // Sub-herramienta 5: Relajación Corporal Guiada Paso a Paso interactiva (sin emojis)
    function cargarHerramientaRelajacion() {
        if (!contenidoHerramienta) return;
        detenerRespiracion();
        detenerSonidoAmbiental();

        const pasosRelajacion = [
            {
                titulo: "Paso 1: Rostro y Mandíbula",
                zona: "Cabeza y expresión",
                instruccion: "Separa los dientes suavemente para que tu mandíbula caiga sin presión. Deja que la lengua descanse en el piso de la boca. Suelta el entrecejo y permite que los párpados caigan pesados y suaves. Siente cómo se borra cualquier tensión en tu rostro.",
                duracionSeg: 15
            },
            {
                titulo: "Paso 2: Cuello y Hombros",
                zona: "Zona cervical",
                instruccion: "Toma aire profundo subiendo suavemente tus hombros hacia las orejas... sostén 3 segundos... y al exhalar, suéltalos de golpe dejando caer todo el peso hacia el suelo. Siente la sensación de alivio al no tener que cargar nada en este momento.",
                duracionSeg: 15
            },
            {
                titulo: "Paso 3: Brazos y Manos",
                zona: "Extremidades superiores",
                instruccion: "Descruza las manos y colócalas abiertas sobre tus piernas. Abre bien los dedos... luego relájalos en su curva natural. Nota el calor agradable o el ligero hormigueo en las palmas de tus manos al dejar ir la resistencia.",
                duracionSeg: 15
            },
            {
                titulo: "Paso 4: Espalda, Pecho y Respiración",
                zona: "Tronco y respiración",
                instruccion: "Deja que el respaldo de la silla o el colchón sostengan todo el peso de tu columna vertebral. Inhala sintiendo cómo se expande tu caja torácica, y al expulsar el aire nota cómo tu cuerpo se hunde placenteramente en el asiento.",
                duracionSeg: 15
            },
            {
                titulo: "Paso 5: Piernas y Pies",
                zona: "Extremidades inferiores",
                instruccion: "Descruza las piernas y apoya las plantas de los pies firmemente en el suelo. Afloja los muslos y las pantorrillas. Siente cómo la gravedad te sostiene de manera estable y segura.",
                duracionSeg: 15
            },
            {
                titulo: "Paso 6: Integración y Calma Total",
                zona: "Cuerpo entero",
                instruccion: "Recorre todo tu cuerpo de pies a cabeza con tu atención. Si queda algún rincón tenso, envíale una exhalación suave. No tienes que solucionar nada en este instante. Tu cuerpo está a salvo y en reposo.",
                duracionSeg: 20
            }
        ];

        let pasoActual = 0;

        function mostrarPasoGuiado() {
            const paso = pasosRelajacion[pasoActual];
            const esUltimo = pasoActual === pasosRelajacion.length - 1;

            contenidoHerramienta.innerHTML = `
                <div class="herramienta-modulo animar-aparecer">
                    <div class="herramienta-header-desc">
                        <h3>Relajación Corporal Progresiva y Guiada</h3>
                        <p>Te guiaremos zona por zona para aflojar cada músculo de tu cuerpo. Sigue las instrucciones despacio y pulsa "Siguiente paso" a medida que vayas sintiendo el alivio.</p>
                    </div>

                    <div class="pasos-grounding-wizard" style="max-width: 620px;">
                        <div class="encuesta-header-info">
                            <span class="encuesta-contador-pasos">Paso ${pasoActual + 1} de ${pasosRelajacion.length} • ${paso.zona}</span>
                        </div>
                        <div class="encuesta-progress-bar-bg" style="margin-bottom: 20px;">
                            <div class="encuesta-progress-bar-fill" style="width: ${Math.round(((pasoActual + 1) / pasosRelajacion.length) * 100)}%;"></div>
                        </div>

                        <div class="tarjeta-paso-relajacion-activa">
                            <h4>${paso.titulo}</h4>
                            <p class="instruccion-paso" style="font-size: 15px; line-height: 1.6; color: #235854;">${paso.instruccion}</p>
                        </div>

                        <div class="controles-relajacion-nav" style="display:flex; justify-content:space-between; align-items:center; margin-top: 24px;">
                            ${pasoActual > 0 ? '<button type="button" class="btn-secundario-lindo" id="btn-relajacion-anterior">Paso anterior</button>' : '<span></span>'}
                            ${!esUltimo ? '<button type="button" class="btn-primary-action" id="btn-relajacion-siguiente">Hecho, siguiente paso</button>' : '<button type="button" class="btn-primary-action" id="btn-relajacion-finalizar">Finalizar relajación</button>'}
                        </div>
                    </div>
                </div>
            `;

            const btnSiguiente = document.getElementById("btn-relajacion-siguiente");
            if (btnSiguiente) {
                btnSiguiente.addEventListener("click", () => {
                    pasoActual++;
                    mostrarPasoGuiado();
                });
            }

            const btnAnterior = document.getElementById("btn-relajacion-anterior");
            if (btnAnterior) {
                btnAnterior.addEventListener("click", () => {
                    pasoActual--;
                    mostrarPasoGuiado();
                });
            }

            const btnFinalizar = document.getElementById("btn-relajacion-finalizar");
            if (btnFinalizar) {
                btnFinalizar.addEventListener("click", () => {
                    contenidoHerramienta.innerHTML = `
                        <div class="herramienta-modulo animar-aparecer">
                            <div class="encuesta-finalizada-card" style="max-width: 580px; margin: 0 auto;">
                                <span class="badge-completado">Relajación completada</span>
                                <h4>Has liberado la tensión de tu cuerpo</h4>
                                <p>Tómate un momento para notar la diferencia de cómo entraste y cómo te sientes ahora. Cuando estés listo/a, puedes continuar a otra herramienta o a tu espacio.</p>
                                <button type="button" class="btn-secundario-lindo" id="btn-reiniciar-relajacion" style="margin-top:14px;">Repetir ejercicio de relajación</button>
                            </div>
                        </div>
                    `;

                    const btnReinicio = document.getElementById("btn-reiniciar-relajacion");
                    if (btnReinicio) {
                        btnReinicio.addEventListener("click", cargarHerramientaRelajacion);
                    }
                });
            }
        }

        mostrarPasoGuiado();
    }

    // Mapeo y conexión de las 5 herramientas de regulación
    const mapaHerramientasRegulacion = {
        respiracion: cargarHerramientaRespiracion,
        "sentidos-54321": cargarHerramienta54321,
        "musica-sonidos": cargarHerramientaMusicaYSonidos,
        escritura: cargarHerramientaEscritura,
        relajacion: cargarHerramientaRelajacion
    };

    document.querySelectorAll("[data-herramienta]").forEach(boton => {
        boton.addEventListener("click", () => {
            const tipo = boton.dataset.herramienta;
            document.querySelectorAll("[data-herramienta]").forEach(b => {
                b.classList.remove("herramienta-activa");
            });
            boton.classList.add("herramienta-activa");

            const fnCarga = mapaHerramientasRegulacion[tipo];
            if (fnCarga) {
                fnCarga();
            }
        });
    });

    // Cargar por defecto respiración guiada
    cargarHerramientaRespiracion();


    // =====================================================
    // 5. MI ESPACIO: METAS, MURO DE MOTIVACIÓN Y RECURSOS CON PERSISTENCIA
    // =====================================================

    // Cargar listas con persistencia en localStorage para que nunca se pierdan las fotos ni recursos
    let metas = [];
    let motivaciones = [];
    let gratitudes = [];
    let recursos = [];

    try {
        const metasG = localStorage.getItem("emowell_metas");
        if (metasG) metas = JSON.parse(metasG);

        const motG = localStorage.getItem("emowell_motivaciones");
        if (motG) motivaciones = JSON.parse(motG);

        const gratG = localStorage.getItem("emowell_gratitudes");
        if (gratG) gratitudes = JSON.parse(gratG);

        const recG = localStorage.getItem("emowell_recursos");
        if (recG) recursos = JSON.parse(recG);
    } catch (e) {
        console.log("Error al leer datos locales de Mi Espacio:", e);
    }

    function guardarDatosMiEspacio() {
        try {
            localStorage.setItem("emowell_metas", JSON.stringify(metas));
            localStorage.setItem("emowell_motivaciones", JSON.stringify(motivaciones));
            localStorage.setItem("emowell_gratitudes", JSON.stringify(gratitudes));
            localStorage.setItem("emowell_recursos", JSON.stringify(recursos));
        } catch (e) {
            console.log("Error guardando datos en Mi Espacio:", e);
        }
    }

    // Botón eliminar reutilizable
    function crearBotonEliminar(alEliminar) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn-eliminar-item";
        boton.textContent = "Eliminar";
        boton.addEventListener("click", alEliminar);
        return boton;
    }

    // -----------------------------------------------------
    // METAS
    // -----------------------------------------------------
    const listaMetas = document.getElementById("lista-metas");
    const inputMeta = document.getElementById("nueva-meta");
    const categoriaMeta = document.getElementById("categoria-meta");
    const contadorMetas = document.querySelector(".metas-contador");
    const barraMetas = document.querySelector(".quiz-progress-bar");

    function pintarMetas() {
        if (!listaMetas) return;
        listaMetas.replaceChildren();

        if (!metas.length) {
            const p = document.createElement("p");
            p.textContent = "Todavía no has agregado una meta.";
            listaMetas.appendChild(p);
        }

        metas.forEach((meta, indice) => {
            const item = document.createElement("div");
            item.className = "goal-item";

            const texto = document.createElement("span");
            texto.className = "goal-title";
            texto.textContent = meta.texto;

            const categoria = document.createElement("span");
            categoria.className = "goal-category-tag";
            categoria.textContent = meta.categoria;

            item.append(
                texto,
                categoria,
                crearBotonEliminar(() => {
                    metas.splice(indice, 1);
                    guardarDatosMiEspacio();
                    pintarMetas();
                })
            );
            listaMetas.appendChild(item);
        });

        if (contadorMetas) {
            contadorMetas.textContent = metas.length + (metas.length === 1 ? " meta" : " metas");
        }
        if (barraMetas) {
            barraMetas.style.width = Math.min(metas.length * 10, 100) + "%";
        }
    }

    const botonAgregarMeta = document.getElementById("agregar-meta-btn");
    if (botonAgregarMeta) {
        botonAgregarMeta.addEventListener("click", () => {
            const texto = inputMeta ? inputMeta.value.trim() : "";
            if (!texto) {
                alert("Escribe una meta antes de agregarla.");
                return;
            }

            metas.push({
                texto: texto,
                categoria: categoriaMeta ? categoriaMeta.value : "Personal"
            });
            inputMeta.value = "";
            guardarDatosMiEspacio();
            pintarMetas();
        });
    }

    pintarMetas();

    // -----------------------------------------------------
    // MURO DE MOTIVACIÓN (FOTOS DESDE ARCHIVOS Y ENLACES)
    // -----------------------------------------------------
    const muro = document.getElementById("muro-motivacion");
    const fraseMotivacion = document.getElementById("frase-motivacion");
    const urlImagen = document.getElementById("imagen-motivacion-url");
    const inputArchivo = document.getElementById("imagen-motivacion");
    const txtFotoSeleccionada = document.getElementById("nombre-archivo-foto-seleccionado");
    let fotoTemporalCargada = null;

    function pintarMotivacion() {
        if (!muro) return;
        muro.replaceChildren();

        if (!motivaciones.length) {
            const p = document.createElement("div");
            p.className = "muro-vacio-aviso";
            p.innerHTML = `
                <p>Aquí se guardarán tus fotos, recuerdos y frases motivadoras.</p>
                <small>Sube una foto desde tu dispositivo o ingresa un enlace para armar tu muro personal.</small>
            `;
            muro.appendChild(p);
            return;
        }

        motivaciones.forEach((item, indice) => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "motivation-item-card";

            if (item.imagen) {
                const contenedorImg = document.createElement("div");
                contenedorImg.className = "motivation-img-wrapper";

                const img = document.createElement("img");
                img.className = "motivation-img";
                img.src = item.imagen;
                img.alt = "Recuerdo de motivación";
                img.onerror = () => contenedorImg.remove();

                contenedorImg.appendChild(img);
                tarjeta.appendChild(contenedorImg);
            }

            const texto = document.createElement("div");
            texto.className = "motivation-caption";
            texto.textContent = item.frase || "Recuerdo inspirador para mi vida.";

            tarjeta.append(
                texto,
                crearBotonEliminar(() => {
                    motivaciones.splice(indice, 1);
                    guardarDatosMiEspacio();
                    pintarMotivacion();
                })
            );

            muro.appendChild(tarjeta);
        });
    }

    // Manejo de archivo de imagen subido desde el dispositivo
    if (inputArchivo) {
        inputArchivo.addEventListener("change", () => {
            const archivo = inputArchivo.files && inputArchivo.files[0];
            if (!archivo) return;

            if (!archivo.type.startsWith("image/")) {
                alert("Por favor selecciona un archivo de imagen (PNG, JPG, WEBP, etc.).");
                inputArchivo.value = "";
                return;
            }

            // Límite de 3MB para DataURL en localStorage
            if (archivo.size > 3500000) {
                alert("La imagen es un poco pesada (máx 3.5 MB). Por favor selecciona una más ligera.");
                inputArchivo.value = "";
                return;
            }

            if (txtFotoSeleccionada) {
                txtFotoSeleccionada.textContent = "Foto lista: " + archivo.name;
            }

            const lector = new FileReader();
            lector.onload = () => {
                fotoTemporalCargada = lector.result;
            };
            lector.readAsDataURL(archivo);
        });
    }

    const botonMotivacion = document.getElementById("agregar-motivacion-btn");
    if (botonMotivacion) {
        botonMotivacion.addEventListener("click", () => {
            const frase = fraseMotivacion ? fraseMotivacion.value.trim() : "";
            const imagenUrl = urlImagen ? urlImagen.value.trim() : "";
            const imagenFinal = fotoTemporalCargada || imagenUrl;

            if (!frase && !imagenFinal) {
                alert("Escribe una frase o sube una foto de tu dispositivo o un enlace de imagen.");
                return;
            }

            motivaciones.push({
                frase: frase || "Un recuerdo inspirador que guardo aquí.",
                imagen: imagenFinal
            });

            fotoTemporalCargada = null;
            if (inputArchivo) inputArchivo.value = "";
            if (txtFotoSeleccionada) txtFotoSeleccionada.textContent = "";
            if (fraseMotivacion) fraseMotivacion.value = "";
            if (urlImagen) urlImagen.value = "";

            guardarDatosMiEspacio();
            pintarMotivacion();
        });
    }

    pintarMotivacion();

    // -----------------------------------------------------
    // GRATITUD
    // -----------------------------------------------------
    const listaGratitud = document.getElementById("lista-gratitud");
    const inputGratitud = document.getElementById("nueva-gratitud");

    function pintarGratitud() {
        if (!listaGratitud) return;
        listaGratitud.replaceChildren();

        if (!gratitudes.length) {
            const p = document.createElement("p");
            p.textContent = "Todavía no has agregado algo a tu lista de gratitud.";
            listaGratitud.appendChild(p);
        }

        gratitudes.forEach((frase, indice) => {
            const item = document.createElement("div");
            item.className = "gratitud-item";

            const p = document.createElement("p");
            p.textContent = frase;

            item.append(
                p,
                crearBotonEliminar(() => {
                    gratitudes.splice(indice, 1);
                    guardarDatosMiEspacio();
                    pintarGratitud();
                })
            );
            listaGratitud.appendChild(item);
        });
    }

    const botonGratitud = document.getElementById("agregar-gratitud-btn");
    if (botonGratitud) {
        botonGratitud.addEventListener("click", () => {
            const texto = inputGratitud ? inputGratitud.value.trim() : "";
            if (!texto) {
                alert("Escribe algo por lo que quieras agradecer.");
                return;
            }

            gratitudes.push(texto);
            inputGratitud.value = "";
            guardarDatosMiEspacio();
            pintarGratitud();
        });
    }

    pintarGratitud();

    // -----------------------------------------------------
    // RECURSOS MULTIMEDIA (YOUTUBE, SPOTIFY, ARCHIVOS LOCALES)
    // -----------------------------------------------------
    const listaRecursos = document.getElementById("lista-recursos");
    const nombreRecurso = document.getElementById("nombre-recurso");
    const categoriaRecurso = document.getElementById("categoria-recurso");
    const urlRecurso = document.getElementById("url-recurso");
    const inputArchivoAudio = document.getElementById("archivo-audio-recurso");
    const txtArchivoAudioSeleccionado = document.getElementById("nombre-archivo-recurso-seleccionado");
    let audioLocalCargado = null;
    let nombreAudioLocal = "";

    if (inputArchivoAudio) {
        inputArchivoAudio.addEventListener("change", () => {
            const archivo = inputArchivoAudio.files && inputArchivoAudio.files[0];
            if (!archivo) return;

            if (archivo.size > 10000000) {
                alert("El archivo de audio debe pesar menos de 10 MB.");
                inputArchivoAudio.value = "";
                return;
            }

            nombreAudioLocal = archivo.name;
            if (txtArchivoAudioSeleccionado) {
                txtArchivoAudioSeleccionado.textContent = "Audio seleccionado: " + archivo.name;
            }

            if (nombreRecurso && !nombreRecurso.value.trim()) {
                nombreRecurso.value = archivo.name.replace(/\.[^/.]+$/, "");
            }

            const lector = new FileReader();
            lector.onload = () => {
                audioLocalCargado = lector.result;
            };
            lector.readAsDataURL(archivo);
        });
    }

    function pintarRecursos() {
        if (!listaRecursos) return;
        listaRecursos.replaceChildren();

        if (!recursos.length) {
            const p = document.createElement("div");
            p.className = "recursos-vacio-card";
            p.innerHTML = `
                <p>Todavía no has agregado recursos personales.</p>
                <small>Puedes guardar tus canciones de YouTube, enlaces de Spotify o subir tus archivos de audio desde tu computadora.</small>
            `;
            listaRecursos.appendChild(p);
            return;
        }

        recursos.forEach((recurso, indice) => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "resource-item-completo";

            const info = document.createElement("div");
            info.className = "resource-item-info";

            const titulo = document.createElement("h5");
            titulo.textContent = recurso.nombre;

            const categoriaTag = document.createElement("span");
            categoriaTag.className = "resource-tag-cat";
            categoriaTag.textContent = recurso.categoria;

            info.append(titulo, categoriaTag);
            tarjeta.appendChild(info);

            if (recurso.audioLocal) {
                const player = document.createElement("audio");
                player.controls = true;
                player.src = recurso.audioLocal;
                player.className = "player-audio-local";
                tarjeta.appendChild(player);
            } else if (recurso.url) {
                const enlace = document.createElement("a");
                enlace.href = recurso.url;
                enlace.target = "_blank";
                enlace.rel = "noopener noreferrer";

                if (recurso.url.includes("youtube.com") || recurso.url.includes("youtu.be")) {
                    enlace.className = "btn-recurso-enlace tag-youtube";
                    enlace.textContent = "Ver en YouTube";
                } else if (recurso.url.includes("spotify.com")) {
                    enlace.className = "btn-recurso-enlace tag-spotify";
                    enlace.textContent = "Escuchar en Spotify";
                } else {
                    enlace.className = "btn-recurso-enlace";
                    enlace.textContent = "Abrir recurso";
                }
                tarjeta.appendChild(enlace);
            }

            tarjeta.appendChild(
                crearBotonEliminar(() => {
                    recursos.splice(indice, 1);
                    guardarDatosMiEspacio();
                    pintarRecursos();
                })
            );

            listaRecursos.appendChild(tarjeta);
        });
    }

    const botonRecurso = document.getElementById("agregar-recurso-btn");
    if (botonRecurso) {
        botonRecurso.addEventListener("click", () => {
            const nombre = nombreRecurso ? nombreRecurso.value.trim() : "";
            const url = urlRecurso ? urlRecurso.value.trim() : "";
            const audioData = audioLocalCargado;

            if (!nombre && !audioData && !url) {
                alert("Escribe el nombre de la canción o selecciona un archivo de audio o enlace.");
                return;
            }

            recursos.push({
                nombre: nombre || nombreAudioLocal || "Música personal",
                categoria: categoriaRecurso ? categoriaRecurso.value : "Calma y paz",
                url: url,
                audioLocal: audioData
            });

            audioLocalCargado = null;
            nombreAudioLocal = "";
            if (inputArchivoAudio) inputArchivoAudio.value = "";
            if (txtArchivoAudioSeleccionado) txtArchivoAudioSeleccionado.textContent = "";
            if (nombreRecurso) nombreRecurso.value = "";
            if (urlRecurso) urlRecurso.value = "";

            guardarDatosMiEspacio();
            pintarRecursos();
        });
    }

    pintarRecursos();

    // -----------------------------------------------------
    // RECORDATORIOS PERSONALES
    // -----------------------------------------------------
    document.querySelectorAll(".identity-pillar-card p").forEach(parrafo => {
        parrafo.contentEditable = "true";
        parrafo.setAttribute("aria-label", "Editar este recordatorio personal");
    });



    // =====================================================
    // PEGATINA INSPIRADORA DINÁMICA DE INICIO
    // =====================================================
    const frasesPegatina = [
        "No tienes que resolverlo todo hoy. Está bien avanzar poco a poco.",
        "Respira hondo: estás haciendo lo mejor que puedes y eso es más que suficiente.",
        "Tus emociones no son un defecto, son señales de que estás vivo y mereces cuidarte.",
        "Un mal día no significa una mala vida. Date permiso de descansar y comenzar de nuevo.",
        "Esto que estás sintiendo también pasará. No estás solo/a en este camino.",
        "La paz mental comienza cuando decides soltar lo que no puedes controlar.",
        "Sé tan comprensivo/a y amable contigo mismo/a como lo serías con tu mejor amigo/a.",
        "Cada pequeño paso cuenta, incluso aquellos días en los que solo lograste levantarte."
    ];

    const estilosPegatina = [
        { bg: "#fef08a", color: "#854d0e", cinta: "#fde047", rot: "2deg" },
        { bg: "#bfdbfe", color: "#1e40af", cinta: "#93c5fd", rot: "-2deg" },
        { bg: "#bbf7d0", color: "#166534", cinta: "#86efac", rot: "1.5deg" },
        { bg: "#fed7aa", color: "#9a3412", cinta: "#fdba74", rot: "-1.5deg" },
        { bg: "#e9d5ff", color: "#6b21a8", cinta: "#d8b4fe", rot: "2.5deg" },
        { bg: "#fbcfe8", color: "#9d174d", cinta: "#f9a8d4", rot: "-2deg" },
        { bg: "#99f6e4", color: "#115e59", cinta: "#5eead4", rot: "1.8deg" }
    ];

    let indiceFrasePegatina = 0;
    const elementoFraseP = document.getElementById("frase");
    const contenedorFraseApoyo = document.querySelector(".frase-apoyo");

    function cambiarPegatinaInspiradora() {
        if (!elementoFraseP || !contenedorFraseApoyo) return;

        indiceFrasePegatina = (indiceFrasePegatina + 1) % frasesPegatina.length;
        const estilo = estilosPegatina[indiceFrasePegatina % estilosPegatina.length];
        const texto = frasesPegatina[indiceFrasePegatina];

        contenedorFraseApoyo.classList.add("pegatina-cambiando");

        setTimeout(() => {
            elementoFraseP.textContent = texto;
            contenedorFraseApoyo.style.backgroundColor = estilo.bg;
            contenedorFraseApoyo.style.color = estilo.color;
            contenedorFraseApoyo.style.setProperty("--cinta-color", estilo.cinta);
            contenedorFraseApoyo.style.transform = `rotate(${estilo.rot})`;
            contenedorFraseApoyo.classList.remove("pegatina-cambiando");
        }, 300);
    }

    if (contenedorFraseApoyo) {
        contenedorFraseApoyo.title = "Haz clic para cambiar el mensaje de tu pegatina";
        contenedorFraseApoyo.addEventListener("click", cambiarPegatinaInspiradora);
        // Cambio automático cada 9 segundos
        setInterval(cambiarPegatinaInspiradora, 9000);
    }


    // =====================================================
    // 6. VISTA INICIAL
    // =====================================================

    sesionIniciada = false;

    actualizarEncabezado();

    mostrarVista("vista-publica");

});


