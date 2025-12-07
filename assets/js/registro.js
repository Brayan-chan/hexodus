/* ===================================================================
   HEXODUS - PANEL DE CONTROL DE ASISTENCIA (ADMINISTRADOR)
   Gestión y monitoreo del sistema de registro facial
   =================================================================== */

// =====================================================================
// VARIABLES GLOBALES
// =====================================================================

let ventanaCliente = null; // Referencia a la ventana de cliente
let faceApiLoaded = false; // Estado de carga de modelos
let configActual = {
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
    console.log('🎮 Iniciando panel de control de asistencia...');
    
    lucide.createIcons();
    
    // Cargar configuración
    cargarConfiguracion();
    
    // Inicializar eventos
    inicializarEventos();
    
    // Cargar y actualizar datos
    actualizarKPIs();
    actualizarHistorial();
    
    // Cargar modelos de face-api.js
    actualizarEstadoSistema('Cargando modelos...', 'cargando');
    const cargaExitosa = await cargarModelosFaceAPI();
    
    if (cargaExitosa) {
        actualizarEstadoSistema('Listo', 'listo');
        document.getElementById('btn-abrir-pantalla').disabled = false;
        console.log('✅ Sistema listo para usar');
    } else {
        actualizarEstadoSistema('Error', 'error');
        alert('❌ Error al cargar el sistema de reconocimiento facial');
    }
    
    // Actualizar reloj
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
    
    // Verificar periódicamente el estado de la ventana cliente
    setInterval(verificarEstadoVentanaCliente, 1000);
    
    // Escuchar mensajes de la ventana cliente
    window.addEventListener('message', recibirMensajeCliente);
});

// =====================================================================
// CARGA DE MODELOS FACE-API.JS
// =====================================================================

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
        
        // Guardar estado en localStorage para la ventana cliente
        localStorage.setItem('face_api_loaded', 'true');
        
        return true;
    } catch (error) {
        console.error('Error cargando modelos:', error);
        return false;
    }
}

// =====================================================================
// GESTIÓN DE VENTANA CLIENTE
// =====================================================================

function abrirVentanaCliente() {
    if (ventanaCliente && !ventanaCliente.closed) {
        ventanaCliente.focus();
        return;
    }
    
    // Guardar configuración antes de abrir
    guardarConfiguracion();
    sincronizarConfiguracionConCliente();
    
    // Abrir ventana en pantalla completa
    const ancho = screen.width;
    const alto = screen.height;
    
    ventanaCliente = window.open(
        'registro-cliente.html',
        'VentanaEscaneo',
        `width=${ancho},height=${alto},left=0,top=0,fullscreen=yes,location=no,menubar=no,toolbar=no,status=no`
    );
    
    if (ventanaCliente) {
        console.log('🖥️ Ventana de cliente abierta');
        actualizarEstadoPantalla(true);
        
        // Enviar configuración cuando la ventana esté lista
        ventanaCliente.addEventListener('load', () => {
            setTimeout(() => {
                enviarConfiguracionACliente();
            }, 1000);
        });
    } else {
        alert('❌ No se pudo abrir la ventana de escaneo. Por favor, permite las ventanas emergentes.');
    }
}

function cerrarVentanaCliente() {
    if (ventanaCliente && !ventanaCliente.closed) {
        ventanaCliente.close();
        ventanaCliente = null;
        console.log('🖥️ Ventana de cliente cerrada');
        actualizarEstadoPantalla(false);
    }
}

function verificarEstadoVentanaCliente() {
    if (ventanaCliente && ventanaCliente.closed) {
        ventanaCliente = null;
        actualizarEstadoPantalla(false);
    }
}

// =====================================================================
// COMUNICACIÓN CON VENTANA CLIENTE
// =====================================================================

function enviarConfiguracionACliente() {
    if (ventanaCliente && !ventanaCliente.closed) {
        ventanaCliente.postMessage({
            tipo: 'configuracion',
            config: configActual
        }, window.location.origin);
        console.log('📤 Configuración enviada a cliente');
    }
}

function sincronizarConfiguracionConCliente() {
    localStorage.setItem('config_registro_cliente', JSON.stringify(configActual));
}

function recibirMensajeCliente(event) {
    // Verificar origen del mensaje
    if (event.origin !== window.location.origin) return;
    
    const mensaje = event.data;
    
    switch (mensaje.tipo) {
        case 'registro_acceso':
            console.log('📝 Registro de acceso recibido:', mensaje.datos);
            actualizarKPIs();
            actualizarHistorial();
            break;
            
        case 'solicitar_configuracion':
            enviarConfiguracionACliente();
            break;
            
        case 'estado_sistema':
            console.log('ℹ️ Estado del sistema cliente:', mensaje.estado);
            break;
    }
}

// =====================================================================
// ACTUALIZACIÓN DE UI
// =====================================================================

function actualizarEstadoPantalla(abierta) {
    const indicator = document.getElementById('pantalla-status-indicator');
    const text = document.getElementById('pantalla-status-text');
    const btnAbrir = document.getElementById('btn-abrir-pantalla');
    const btnCerrar = document.getElementById('btn-cerrar-pantalla');
    
    if (abierta) {
        indicator.className = 'w-3 h-3 rounded-full bg-green-500 animate-pulse';
        text.textContent = 'Abierta';
        text.className = 'text-sm font-semibold text-green-400';
        btnAbrir.style.display = 'none';
        btnCerrar.style.display = 'flex';
    } else {
        indicator.className = 'w-3 h-3 rounded-full bg-gray-500';
        text.textContent = 'Cerrada';
        text.className = 'text-sm font-semibold text-gray-400';
        btnAbrir.style.display = 'flex';
        btnCerrar.style.display = 'none';
    }
    
    lucide.createIcons();
}

function actualizarEstadoSistema(texto, estado) {
    const indicator = document.getElementById('sistema-status-indicator');
    const text = document.getElementById('sistema-status-text');
    
    text.textContent = texto;
    
    if (estado === 'listo') {
        indicator.className = 'w-3 h-3 rounded-full bg-green-500 animate-pulse';
        text.className = 'text-sm font-semibold text-green-400';
    } else if (estado === 'cargando') {
        indicator.className = 'w-3 h-3 rounded-full bg-yellow-500 animate-pulse';
        text.className = 'text-sm font-semibold text-yellow-400';
    } else if (estado === 'error') {
        indicator.className = 'w-3 h-3 rounded-full bg-red-500';
        text.className = 'text-sm font-semibold text-red-400';
    }
}

function actualizarKPIs() {
    const registros = obtenerRegistrosAcceso();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const registrosHoy = registros.filter(r => {
        const fecha = new Date(r.timestamp);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
    });
    
    const asistentesHoy = new Set(
        registrosHoy
            .filter(r => r.tipo === 'permitido')
            .map(r => r.socioId)
    ).size;
    
    const denegadosHoy = registrosHoy.filter(r => r.tipo === 'denegado').length;
    
    const hace4Horas = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const activosAhora = new Set(
        registros
            .filter(r => r.tipo === 'permitido' && new Date(r.timestamp) > hace4Horas)
            .map(r => r.socioId)
    ).size;
    
    const permanenciaPromedio = '1h 45m';
    
    document.getElementById('kpi-asistentes-hoy').textContent = asistentesHoy;
    document.getElementById('kpi-activos-ahora').textContent = activosAhora;
    document.getElementById('kpi-denegados').textContent = denegadosHoy;
    document.getElementById('kpi-permanencia').textContent = permanenciaPromedio;
}

function actualizarHistorial() {
    const registros = obtenerRegistrosAcceso();
    const container = document.getElementById('historial-registros');
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const busqueda = document.getElementById('buscar-socio').value.toLowerCase();
    
    // Filtrar registros de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let registrosFiltrados = registros.filter(r => {
        const fecha = new Date(r.timestamp);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
    });
    
    // Aplicar filtro de tipo
    if (filtroTipo !== 'todos') {
        registrosFiltrados = registrosFiltrados.filter(r => r.tipo === filtroTipo);
    }
    
    // Aplicar búsqueda
    if (busqueda) {
        const socios = obtenerSocios();
        registrosFiltrados = registrosFiltrados.filter(r => {
            const socio = socios.find(s => s.id === r.socioId);
            return socio && socio.nombre.toLowerCase().includes(busqueda);
        });
    }
    
    // Ordenar por más reciente
    registrosFiltrados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (registrosFiltrados.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-8">No hay registros que coincidan</p>';
        return;
    }
    
    const socios = obtenerSocios();
    
    let html = '';
    registrosFiltrados.forEach(registro => {
        // Usar nombre guardado en el registro o buscar en socios
        let nombreSocio = registro.nombreSocio || 'Desconocido';
        if (nombreSocio === 'Desconocido') {
            const socio = socios.find(s => s.id === registro.socioId);
            nombreSocio = socio ? socio.nombre : 'Desconocido';
        }
        
        const tipoClase = registro.tipo === 'permitido' ? 'entrada' : 'salida';
        const icono = registro.tipo === 'permitido' ? 'check-circle' : 'x-circle';
        const color = registro.tipo === 'permitido' ? 'text-green-400' : 'text-red-400';
        
        html += `
            <div class="registro-item ${tipoClase}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${icono}" class="w-5 h-5 ${color}"></i>
                        <div>
                            <p class="font-semibold">${nombreSocio}</p>
                            <p class="text-xs text-gray-400">${registro.motivo}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm">${formatearHora(registro.timestamp)}</p>
                        <p class="text-xs text-gray-400">${registro.confianza}% confianza</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    lucide.createIcons();
}

// =====================================================================
// CONFIGURACIÓN
// =====================================================================

function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('config_registro');
    if (configGuardada) {
        Object.assign(configActual, JSON.parse(configGuardada));
    }
    
    document.getElementById('config-sonido').checked = configActual.sonidoHabilitado;
    document.getElementById('config-auto-detect').checked = configActual.deteccionAutomatica;
    document.getElementById('config-show-detection').checked = configActual.mostrarDeteccion;
    document.getElementById('config-threshold').value = configActual.umbralConfianza;
    document.getElementById('threshold-value').textContent = configActual.umbralConfianza;
    document.getElementById('config-reset-time').value = configActual.tiempoReset;
}

function guardarConfiguracion() {
    localStorage.setItem('config_registro', JSON.stringify(configActual));
    sincronizarConfiguracionConCliente();
    console.log('⚙️ Configuración guardada');
}

// =====================================================================
// GESTIÓN DE DATOS
// =====================================================================

function obtenerSocios() {
    const sociosJSON = localStorage.getItem('socios');
    return sociosJSON ? JSON.parse(sociosJSON) : [];
}

function obtenerRegistrosAcceso() {
    const registrosJSON = localStorage.getItem('registros_acceso');
    return registrosJSON ? JSON.parse(registrosJSON) : [];
}

function exportarRegistros() {
    const registros = obtenerRegistrosAcceso();
    const socios = obtenerSocios();
    
    // Filtrar registros de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const registrosHoy = registros.filter(r => {
        const fecha = new Date(r.timestamp);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
    });
    
    // Crear CSV
    let csv = 'Fecha/Hora,Socio,ID,Tipo,Motivo,Confianza\n';
    
    registrosHoy.forEach(r => {
        const socio = socios.find(s => s.id === r.socioId);
        const nombreSocio = socio ? socio.nombre : 'Desconocido';
        csv += `${formatearFechaHora(r.timestamp)},${nombreSocio},${r.socioId},${r.tipo},${r.motivo},${r.confianza}%\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registros_${formatearFecha(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('📥 Registros exportados');
}

function limpiarHistorial() {
    if (confirm('¿Estás seguro de que deseas limpiar el historial de hoy?')) {
        const registros = obtenerRegistrosAcceso();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // Mantener solo registros de otros días
        const registrosOtrosDias = registros.filter(r => {
            const fecha = new Date(r.timestamp);
            fecha.setHours(0, 0, 0, 0);
            return fecha.getTime() !== hoy.getTime();
        });
        
        localStorage.setItem('registros_acceso', JSON.stringify(registrosOtrosDias));
        actualizarHistorial();
        actualizarKPIs();
        alert('✅ Historial de hoy limpiado correctamente');
    }
}

// =====================================================================
// EVENTOS
// =====================================================================

function inicializarEventos() {
    // Botones de ventana
    document.getElementById('btn-abrir-pantalla').addEventListener('click', abrirVentanaCliente);
    document.getElementById('btn-cerrar-pantalla').addEventListener('click', cerrarVentanaCliente);
    
    // Configuración
    document.getElementById('config-sonido').addEventListener('change', (e) => {
        configActual.sonidoHabilitado = e.target.checked;
        guardarConfiguracion();
        enviarConfiguracionACliente();
    });
    
    document.getElementById('config-auto-detect').addEventListener('change', (e) => {
        configActual.deteccionAutomatica = e.target.checked;
        guardarConfiguracion();
        enviarConfiguracionACliente();
    });
    
    document.getElementById('config-show-detection').addEventListener('change', (e) => {
        configActual.mostrarDeteccion = e.target.checked;
        guardarConfiguracion();
        enviarConfiguracionACliente();
    });
    
    document.getElementById('config-threshold').addEventListener('input', (e) => {
        configActual.umbralConfianza = parseFloat(e.target.value);
        document.getElementById('threshold-value').textContent = configActual.umbralConfianza;
        guardarConfiguracion();
        enviarConfiguracionACliente();
    });
    
    document.getElementById('config-reset-time').addEventListener('change', (e) => {
        configActual.tiempoReset = parseInt(e.target.value);
        guardarConfiguracion();
        enviarConfiguracionACliente();
    });
    
    // Historial
    document.getElementById('filtro-tipo').addEventListener('change', actualizarHistorial);
    document.getElementById('buscar-socio').addEventListener('input', actualizarHistorial);
    document.getElementById('btn-exportar-registros').addEventListener('click', exportarRegistros);
    document.getElementById('btn-limpiar-historial').addEventListener('click', limpiarHistorial);
    
    // Cerrar ventana cliente al cerrar esta ventana
    window.addEventListener('beforeunload', () => {
        if (ventanaCliente && !ventanaCliente.closed) {
            ventanaCliente.close();
        }
    });
}

// =====================================================================
// UTILIDADES
// =====================================================================

function actualizarReloj() {
    const now = new Date();
    const hora = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    document.getElementById('hora-actual').textContent = hora;
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatearFechaHora(fecha) {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearHora(fecha) {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

console.log('✅ Panel de control de asistencia cargado');
