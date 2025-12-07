/* ===================================================================
   HEXODUS - PANTALLA DE ESCANEO FACIAL (CLIENTE/PÚBLICO)
   Ventana dedicada para que los socios escaneen su rostro
   =================================================================== */

// =====================================================================
// VARIABLES GLOBALES
// =====================================================================

let stream = null;
let faceApiLoaded = false;
let currentFaceDescriptor = null;
let isScanning = false;
let scanInterval = null;
let resetTimeout = null;
let countdownInterval = null;

// Configuración (sincronizada desde ventana principal)
let config = {
    sonidoHabilitado: true,
    deteccionAutomatica: true,
    mostrarDeteccion: true,
    umbralConfianza: 0.5,
    tiempoReset: 10
};

// =====================================================================
// INICIALIZACIÓN
// =====================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🖥️ Iniciando pantalla de escaneo facial...');
    
    lucide.createIcons();
    
    // Cargar configuración desde localStorage
    cargarConfiguracion();
    
    // Solicitar configuración a la ventana principal
    solicitarConfiguracion();
    
    // Escuchar mensajes de la ventana principal
    window.addEventListener('message', recibirMensajeControl);
    
    // Mostrar mensaje de cargando
    mostrarMensajeCargando(true);
    
    // Esperar a que face-api.js esté disponible
    await esperarFaceAPI();
    
    // Cargar modelos si no están cargados
    const cargaExitosa = await cargarModelosFaceAPI();
    
    if (cargaExitosa) {
        console.log('✅ Modelos cargados - Iniciando cámara...');
        mostrarMensajeCargando(false);
        
        // Activar cámara automáticamente
        await activarCamara();
        
        // Enviar estado a ventana principal
        enviarEstadoSistema('activo');
    } else {
        console.error('❌ Error al cargar modelos');
        mostrarError('Error al inicializar el sistema');
    }
});

// =====================================================================
// CARGA DE FACE-API.JS
// =====================================================================

async function esperarFaceAPI() {
    // Esperar hasta que faceapi esté disponible
    let intentos = 0;
    while (typeof faceapi === 'undefined' && intentos < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        intentos++;
    }
    
    if (typeof faceapi === 'undefined') {
        throw new Error('face-api.js no se cargó correctamente');
    }
}

async function cargarModelosFaceAPI() {
    if (faceApiLoaded) return true;
    
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        faceApiLoaded = true;
        return true;
    } catch (error) {
        console.error('Error cargando modelos:', error);
        return false;
    }
}

// =====================================================================
// GESTIÓN DE CÁMARA
// =====================================================================

async function activarCamara() {
    if (stream) return;
    
    try {
        const constraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: 'user'
            },
            audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const video = document.getElementById('video-feed');
        video.srcObject = stream;
        
        // Esperar a que el video esté completamente listo
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                console.log('📹 Video metadata cargada');
                resolve();
            };
        });
        
        await video.play();
        
        // Esperar a que el primer frame esté disponible
        await new Promise((resolve) => {
            video.oncanplay = () => {
                console.log('▶️ Video listo para reproducir');
                resolve();
            };
        });
        
        // Pequeña espera adicional para asegurar que todo está estable
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ocultar estado inicial
        document.getElementById('estado-inicial').style.display = 'none';
        
        // Mostrar overlay de escaneo
        document.getElementById('scan-overlay').style.display = 'block';
        
        console.log('✅ Cámara activada completamente');
        
        // Iniciar detección automática después de que todo esté listo
        if (config.deteccionAutomatica) {
            iniciarEscaneoAutomatico();
        }
        
    } catch (error) {
        console.error('Error al activar cámara:', error);
        mostrarError('No se pudo acceder a la cámara');
    }
}

function detenerCamara() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

// =====================================================================
// ESCANEO Y DETECCIÓN FACIAL
// =====================================================================

function iniciarEscaneoAutomatico() {
    if (scanInterval) return;
    
    console.log('🔍 Iniciando escaneo automático...');
    scanInterval = setInterval(async () => {
        if (stream && !isScanning && !resetTimeout) {
            await detectarYReconocerRostro();
        }
    }, 1500);
}

function detenerEscaneoAutomatico() {
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
}

async function detectarYReconocerRostro() {
    if (!faceApiLoaded || isScanning) return;
    
    isScanning = true;
    
    try {
        const video = document.getElementById('video-feed');
        const canvas = document.getElementById('canvas-overlay');
        
        // Verificar que el video esté listo
        if (video.readyState < 2) {
            console.log('⏳ Video aún no está listo, esperando...');
            isScanning = false;
            return;
        }
        
        // Verificar que el video tenga dimensiones válidas
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.log('⏳ Video sin dimensiones válidas, esperando...');
            isScanning = false;
            return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (detection) {
            console.log('👤 Rostro detectado - Iniciando búsqueda...');
            
            if (config.mostrarDeteccion) {
                faceapi.draw.drawDetections(canvas, detection);
                faceapi.draw.drawFaceLandmarks(canvas, detection);
            }
            
            currentFaceDescriptor = detection.descriptor;
            await buscarYMostrarSocio(currentFaceDescriptor);
        } else {
            // Sin detección, no hacer nada (esto es normal y no requiere log)
        }
        
    } catch (error) {
        console.error('❌ Error en detección:', error);
    } finally {
        isScanning = false;
    }
}

// =====================================================================
// BÚSQUEDA Y VALIDACIÓN DE SOCIO
// =====================================================================

async function buscarYMostrarSocio(descriptor) {
    const socios = obtenerSocios();
    
    console.log(`🔍 Buscando socio... Total registrados con rostro: ${socios.length}`);
    
    if (socios.length === 0) {
        console.warn('⚠️ No hay socios registrados con reconocimiento facial');
        mostrarMensajeNoRegistrado();
        return;
    }
    
    let mejorCoincidencia = null;
    let mejorDistancia = 1;
    
    for (const socio of socios) {
        if (socio.faceDescriptor) {
            const descriptorGuardado = new Float32Array(socio.faceDescriptor);
            const distancia = faceapi.euclideanDistance(descriptor, descriptorGuardado);
            
            console.log(`  → Comparando con ${socio.nombre}: distancia = ${distancia.toFixed(3)}`);
            
            if (distancia < mejorDistancia) {
                mejorDistancia = distancia;
                mejorCoincidencia = socio;
            }
        }
    }
    
    console.log(`📊 Mejor coincidencia: ${mejorCoincidencia?.nombre || 'ninguno'} con distancia ${mejorDistancia.toFixed(3)}`);
    console.log(`🎯 Umbral configurado: ${config.umbralConfianza}`);
    
    if (mejorCoincidencia && mejorDistancia < config.umbralConfianza) {
        const confianza = ((1 - mejorDistancia) * 100).toFixed(1);
        console.log(`✅ Socio reconocido: ${mejorCoincidencia.nombre} (${confianza}%)`);
        
        await procesarAccesoSocio(mejorCoincidencia, confianza);
    } else {
        console.warn('❌ No se encontró coincidencia suficiente');
        mostrarMensajeNoRegistrado();
    }
}

async function procesarAccesoSocio(socio, confianza) {
    // Detener escaneo temporalmente
    detenerEscaneoAutomatico();
    
    console.log(`👤 Procesando acceso para: ${socio.nombre}`);
    console.log(`📅 Fecha vencimiento: ${socio.fechaVencimiento}`);
    console.log(`🎫 Estado: ${socio.estado}`);
    
    const membresia = obtenerMembresiaActivaSocio(socio.id);
    
    if (!membresia) {
        console.warn('⚠️ Socio sin membresía activa');
        mostrarResultadoAcceso(socio, 'sin_membresia', null, confianza);
        registrarAcceso(socio.id, 'denegado', 'Sin membresía activa', confianza);
        return;
    }
    
    // VALIDAR ESTADO DE PAGO PRIMERO
    const estadoPago = verificarEstadoPago(socio.id, membresia);
    console.log(`💳 Estado de pago: ${estadoPago}`);
    
    if (estadoPago === 'sin_pago' || estadoPago === 'parcial') {
        console.log('❌ Acceso denegado - Membresía sin pagar');
        mostrarResultadoAcceso(socio, 'sin_pago', membresia, confianza);
        registrarAcceso(socio.id, 'denegado', 'Membresía sin pagar o pago incompleto', confianza);
        return;
    }
    
    const fechaVencimiento = new Date(membresia.fechaVencimiento);
    const ahora = new Date();
    const diasRestantes = Math.ceil((fechaVencimiento - ahora) / (1000 * 60 * 60 * 24));
    
    console.log(`⏰ Fecha vencimiento: ${fechaVencimiento.toLocaleDateString()}`);
    console.log(`📆 Hoy: ${ahora.toLocaleDateString()}`);
    console.log(`⏳ Días restantes: ${diasRestantes}`);
    
    if (fechaVencimiento < ahora) {
        console.log('❌ Membresía vencida - Acceso denegado');
        mostrarResultadoAcceso(socio, 'vencida', membresia, confianza);
        registrarAcceso(socio.id, 'denegado', 'Membresía vencida', confianza);
    } else if (diasRestantes <= 3) {
        console.log(`⚠️ Membresía próxima a vencer (${diasRestantes} días) - Acceso con advertencia`);
        mostrarResultadoAcceso(socio, 'proximo_vencer', membresia, confianza, diasRestantes);
        registrarAcceso(socio.id, 'permitido', 'Acceso permitido - Próxima a vencer', confianza);
    } else {
        console.log('✅ Membresía activa - Acceso permitido');
        mostrarResultadoAcceso(socio, 'permitido', membresia, confianza);
        registrarAcceso(socio.id, 'permitido', 'Acceso permitido', confianza);
    }
}

// =====================================================================
// MOSTRAR RESULTADOS
// =====================================================================

function mostrarResultadoAcceso(socio, estado, membresia, confianza, diasRestantes = 0) {
    const overlay = document.getElementById('info-socio-overlay');
    const foto = document.getElementById('socio-foto-grande');
    const nombre = document.getElementById('socio-nombre-grande');
    const id = document.getElementById('socio-id-grande');
    const mensaje = document.getElementById('mensaje-principal-grande');
    const membresiaText = document.getElementById('socio-membresia-grande');
    const vencimiento = document.getElementById('socio-vencimiento-grande');
    const submensaje = document.getElementById('submensaje-grande');
    
    // Datos del socio
    if (socio.foto) {
        foto.src = socio.foto;
    } else {
        // Usar placeholder SVG
        foto.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJhMmEzMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzNSIgZmlsbD0iIzU1NTU2MCIvPjxwYXRoIGQ9Ik01MCAxNjAgUTUwIDEyMCAxMDAgMTIwIFQxNTAgMTYwIiBmaWxsPSIjNTU1NTYwIi8+PC9zdmc+';
    }
    nombre.textContent = socio.nombre;
    id.textContent = `ID: ${socio.id}`;
    
    // Configurar según estado
    if (estado === 'permitido') {
        mensaje.className = 'mensaje-grande mensaje-exito';
        mensaje.textContent = '✓ ¡BIENVENIDO!';
        membresiaText.textContent = membresia.tipo || 'Membresía Activa';
        vencimiento.textContent = formatearFecha(membresia.fechaVencimiento);
        submensaje.textContent = '¡Que tengas un excelente entrenamiento!';
        reproducirSonido('success');
        
    } else if (estado === 'proximo_vencer') {
        mensaje.className = 'mensaje-grande mensaje-warning';
        mensaje.textContent = '⚠ ¡BIENVENIDO!';
        membresiaText.textContent = membresia.tipo || 'Membresía Activa';
        vencimiento.textContent = formatearFecha(membresia.fechaVencimiento);
        submensaje.textContent = `Atención: Tu membresía vence en ${diasRestantes} día(s)`;
        reproducirSonido('warning');
        
    } else if (estado === 'vencida') {
        mensaje.className = 'mensaje-grande mensaje-error';
        mensaje.textContent = '✗ ACCESO DENEGADO';
        membresiaText.textContent = (membresia.tipo || 'Membresía') + ' (Vencida)';
        vencimiento.textContent = formatearFecha(membresia.fechaVencimiento);
        submensaje.textContent = 'Por favor, renueva tu membresía en recepción';
        reproducirSonido('error');
        
    } else if (estado === 'sin_membresia') {
        mensaje.className = 'mensaje-grande mensaje-error';
        mensaje.textContent = '✗ ACCESO DENEGADO';
        membresiaText.textContent = 'Sin membresía activa';
        vencimiento.textContent = 'N/A';
        submensaje.textContent = 'Dirígete a recepción para adquirir una membresía';
        reproducirSonido('error');
        
    } else if (estado === 'sin_pago') {
        mensaje.className = 'mensaje-grande mensaje-error';
        mensaje.textContent = '✗ ACCESO DENEGADO';
        membresiaText.textContent = membresia.tipo || 'Membresía';
        vencimiento.textContent = formatearFecha(membresia.fechaVencimiento);
        submensaje.textContent = 'Membresía sin pagar - Realiza tu pago en recepción';
        reproducirSonido('error');
    }
    
    // Mostrar overlay
    overlay.style.display = 'block';
    lucide.createIcons();
    
    // Iniciar countdown de reset
    iniciarCountdownReset();
}

function iniciarCountdownReset() {
    let segundosRestantes = config.tiempoReset;
    const countdownElement = document.getElementById('countdown-seconds');
    
    countdownElement.textContent = segundosRestantes;
    
    // Actualizar cada segundo
    countdownInterval = setInterval(() => {
        segundosRestantes--;
        countdownElement.textContent = segundosRestantes;
        
        if (segundosRestantes <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Reset después del tiempo configurado
    resetTimeout = setTimeout(() => {
        resetearPantalla();
    }, config.tiempoReset * 1000);
}

function resetearPantalla() {
    console.log('🔄 Reseteando pantalla...');
    
    // Limpiar timeouts
    if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
    }
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Ocultar overlay
    document.getElementById('info-socio-overlay').style.display = 'none';
    
    // Reiniciar escaneo
    if (config.deteccionAutomatica) {
        iniciarEscaneoAutomatico();
    }
}

function mostrarMensajeNoRegistrado() {
    console.log('⚠️ Mostrando mensaje: Rostro no registrado');
    
    // Detener escaneo temporalmente
    detenerEscaneoAutomatico();
    
    const overlay = document.getElementById('info-socio-overlay');
    const foto = document.getElementById('socio-foto-grande');
    const nombre = document.getElementById('socio-nombre-grande');
    const id = document.getElementById('socio-id-grande');
    const mensaje = document.getElementById('mensaje-principal-grande');
    const membresiaText = document.getElementById('socio-membresia-grande');
    const vencimiento = document.getElementById('socio-vencimiento-grande');
    const submensaje = document.getElementById('submensaje-grande');
    
    // Placeholder de foto
    foto.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJhMmEzMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzNSIgZmlsbD0iIzU1NTU2MCIvPjxwYXRoIGQ9Ik01MCAxNjAgUTUwIDEyMCAxMDAgMTIwIFQxNTAgMTYwIiBmaWxsPSIjNTU1NTYwIi8+PC9zdmc+';
    nombre.textContent = 'Rostro No Registrado';
    id.textContent = '';
    
    mensaje.className = 'mensaje-grande mensaje-error';
    mensaje.textContent = '✗ NO REGISTRADO';
    membresiaText.textContent = 'Sin registro en el sistema';
    vencimiento.textContent = '';
    submensaje.textContent = 'Por favor, dirígete a recepción para registrarte';
    
    reproducirSonido('error');
    
    // Mostrar overlay
    overlay.style.display = 'block';
    lucide.createIcons();
    
    // Iniciar countdown de reset
    iniciarCountdownReset();
}

// =====================================================================
// COMUNICACIÓN CON VENTANA PRINCIPAL
// =====================================================================

function solicitarConfiguracion() {
    if (window.opener) {
        window.opener.postMessage({
            tipo: 'solicitar_configuracion'
        }, window.location.origin);
    }
}

function enviarEstadoSistema(estado) {
    if (window.opener) {
        window.opener.postMessage({
            tipo: 'estado_sistema',
            estado: estado
        }, window.location.origin);
    }
}

function recibirMensajeControl(event) {
    if (event.origin !== window.location.origin) return;
    
    const mensaje = event.data;
    
    if (mensaje.tipo === 'configuracion') {
        console.log('📥 Configuración recibida:', mensaje.config);
        Object.assign(config, mensaje.config);
        localStorage.setItem('config_registro_cliente', JSON.stringify(config));
        
        // Aplicar cambios de configuración
        if (config.deteccionAutomatica && !scanInterval) {
            iniciarEscaneoAutomatico();
        } else if (!config.deteccionAutomatica && scanInterval) {
            detenerEscaneoAutomatico();
        }
    }
}

// =====================================================================
// GESTIÓN DE DATOS
// =====================================================================

function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('config_registro_cliente');
    if (configGuardada) {
        Object.assign(config, JSON.parse(configGuardada));
    }
}

function obtenerSocios() {
    const sociosJSON = localStorage.getItem('hexodus_socios');
    if (!sociosJSON) {
        console.warn('⚠️ No se encontró hexodus_socios en localStorage');
        return [];
    }
    
    try {
        const socios = JSON.parse(sociosJSON);
        console.log(`📊 Total de socios en localStorage: ${socios.length}`);
        
        // Contar socios con faceDescriptor
        const sociosConRostro = socios.filter(socio => socio.faceDescriptor && socio.faceDescriptor.length > 0);
        console.log(`👤 Socios con reconocimiento facial: ${sociosConRostro.length}`);
        
        // Mostrar información de cada socio con rostro
        sociosConRostro.forEach(socio => {
            console.log(`  • ${socio.nombre} (ID: ${socio.id}) - Descriptor: ${socio.faceDescriptor.length} valores`);
        });
        
        return sociosConRostro;
    } catch (error) {
        console.error('❌ Error cargando socios:', error);
        return [];
    }
}

function obtenerMembresiaActivaSocio(socioId) {
    const sociosJSON = localStorage.getItem('hexodus_socios');
    if (!sociosJSON) return null;
    
    try {
        const socios = JSON.parse(sociosJSON);
        const socio = socios.find(s => s.id === socioId);
        
        if (!socio) return null;
        
        // El socio ya tiene toda la información de membresía
        return {
            tipo: socio.membresiaInfo?.nombre || socio.membresia,
            fechaVencimiento: socio.fechaVencimiento,
            estado: socio.estado,
            precio: socio.membresiaInfo?.precio || 0
        };
    } catch (error) {
        console.error('❌ Error obteniendo membresía:', error);
        return null;
    }
}

function verificarEstadoPago(socioId, membresia) {
    // Obtener membresías del socio
    const membresiasJSON = localStorage.getItem('hexodus_membresias');
    if (!membresiasJSON) return 'sin_pago';
    
    try {
        const membresias = JSON.parse(membresiasJSON);
        const membresiaActiva = membresias.find(m => m.socioId === socioId && m.activa);
        
        if (!membresiaActiva) return 'sin_pago';
        
        // Obtener pagos de esta membresía
        const pagosJSON = localStorage.getItem('hexodus_pagos');
        if (!pagosJSON) return 'sin_pago';
        
        const pagos = JSON.parse(pagosJSON);
        const pagosMembresia = pagos.filter(p => p.membresiaId === membresiaActiva.id);
        const totalPagado = pagosMembresia.reduce((sum, p) => sum + p.importe, 0);
        
        console.log(`💵 Total pagado: $${totalPagado} de $${membresiaActiva.precio}`);
        
        if (totalPagado === 0) return 'sin_pago';
        if (totalPagado < membresiaActiva.precio) return 'parcial';
        return 'pagado';
    } catch (error) {
        console.error('❌ Error verificando pagos:', error);
        return 'sin_pago';
    }
}

function registrarAcceso(socioId, tipo, motivo, confianza) {
    const registros = obtenerRegistrosAcceso();
    
    // Obtener nombre del socio
    const sociosJSON = localStorage.getItem('hexodus_socios');
    let nombreSocio = 'Desconocido';
    if (sociosJSON) {
        try {
            const socios = JSON.parse(sociosJSON);
            const socio = socios.find(s => s.id === socioId);
            if (socio) nombreSocio = socio.nombre;
        } catch (error) {
            console.error('Error obteniendo nombre:', error);
        }
    }
    
    const registro = {
        id: Date.now(),
        socioId: socioId,
        nombreSocio: nombreSocio,
        tipo: tipo,
        motivo: motivo,
        confianza: confianza,
        timestamp: new Date().toISOString()
    };
    
    registros.push(registro);
    
    if (registros.length > 100) {
        registros.splice(0, registros.length - 100);
    }
    
    localStorage.setItem('registros_acceso', JSON.stringify(registros));
    
    // Notificar a ventana principal
    if (window.opener) {
        window.opener.postMessage({
            tipo: 'registro_acceso',
            datos: registro
        }, window.location.origin);
    }
    
    console.log('📝 Acceso registrado:', registro);
}

function obtenerRegistrosAcceso() {
    const registrosJSON = localStorage.getItem('registros_acceso');
    return registrosJSON ? JSON.parse(registrosJSON) : [];
}

// =====================================================================
// MENSAJES Y SONIDOS
// =====================================================================

function mostrarMensajeCargando(mostrar) {
    document.getElementById('mensaje-cargando').style.display = mostrar ? 'flex' : 'none';
}

function mostrarError(texto) {
    const estadoInicial = document.getElementById('estado-inicial');
    estadoInicial.innerHTML = `
        <i data-lucide="alert-triangle" class="w-32 h-32 mx-auto mb-6 text-red-500"></i>
        <h2 class="text-red-500">Error</h2>
        <p>${texto}</p>
    `;
    estadoInicial.style.display = 'flex';
    lucide.createIcons();
}

function reproducirSonido(tipo) {
    if (!config.sonidoHabilitado) return;
    
    // Los sonidos se reproducirían aquí
    // Por ahora solo un log
    console.log(`🔊 Sonido: ${tipo}`);
}

// =====================================================================
// UTILIDADES
// =====================================================================

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Cerrar ventana con ESC (para pruebas)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (confirm('¿Cerrar pantalla de escaneo?')) {
            window.close();
        }
    }
});

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
    detenerCamara();
    detenerEscaneoAutomatico();
});

console.log('✅ Pantalla de escaneo facial cargada');
