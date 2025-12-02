// ================================================
// REPORTES.JS - GESTIÓN DE REPORTES Y ANALYTICS
// Basado en la estructura de socios.js e inventario.js
// ================================================

// Función para actualizar la hora en el encabezado
const actualizarFechaHora = () => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    document.getElementById('fecha-hora-header').textContent = `Admin. | ${fecha} | ${hora}`;
};
setInterval(actualizarFechaHora, 60000); // Actualizar cada minuto
actualizarFechaHora(); // Llamar al inicio

// -----------------------------------------------------------
// VARIABLES GLOBALES DE PAGINACIÓN Y FILTROS
// -----------------------------------------------------------
let paginaActual = 1;
let registrosPorPagina = 25;
let totalReportes = 127;
let reportesFiltrados = [];
let todosLosReportes = []; // Datos simulados - reemplazar con API calls

// -----------------------------------------------------------
// CONTROL DE INTENTOS DE GENERACIÓN DE REPORTES
// -----------------------------------------------------------
let intentosGeneracion = {
    'inventario': 0,
    'productos': 0,
    'socios': 0,
    'ventas': 0,
    'financiero': 0,
    'operacional': 0,
    'completo': 0
};

const LIMITE_INTENTOS = 2;
const TIEMPO_ESPERA_MINUTOS = 5; // Tiempo de espera en minutos

// Control de tiempo de espera por tipo de reporte
let tiemposEspera = {};

// Definición de tipos de reportes del sistema
const TIPOS_REPORTES_SISTEMA = {
    'inventario': {
        nombre: 'Inventario',
        descripcion: 'Reporte completo del inventario actual',
        icon: '📦',
        consulta: 'grande', // Siempre Excel para inventarios
        tiempoEstimado: '3-5 minutos'
    },
    'productos': {
        nombre: 'Productos',
        descripcion: 'Análisis de productos y movimientos',
        icon: '🏷️',
        consulta: 'mediana', // Excel recomendado
        tiempoEstimado: '2-4 minutos'
    },
    'socios': {
        nombre: 'Socios',
        descripcion: 'Reporte de membresías y datos de socios',
        icon: '👥',
        consulta: 'grande', // Excel para listas completas
        tiempoEstimado: '2-3 minutos'
    },
    'ventas': {
        nombre: 'Ventas',
        descripcion: 'Análisis de ventas e ingresos',
        icon: '💰',
        consulta: 'mediana', // Puede ser PDF o Excel según periodo
        tiempoEstimado: '1-3 minutos'
    },
    'financiero': {
        nombre: 'Financiero',
        descripcion: 'Estados financieros y análisis económico',
        icon: '💳',
        consulta: 'pequena', // Generalmente PDF para reportes ejecutivos
        tiempoEstimado: '2-4 minutos'
    },
    'operacional': {
        nombre: 'Operacional',
        descripcion: 'Métricas operativas y utilización',
        icon: '⚙️',
        consulta: 'mediana', // Excel para análisis detallado
        tiempoEstimado: '1-2 minutos'
    },
    'completo': {
        nombre: 'Reporte Completo',
        descripcion: 'Análisis integral de todos los módulos',
        icon: '📊',
        consulta: 'grande', // Siempre Excel para reportes completos
        tiempoEstimado: '5-8 minutos'
    }
};

// -----------------------------------------------------------
// DATOS SIMULADOS (Reemplazar con llamadas a API)
// -----------------------------------------------------------
const generateMockReportsData = () => {
    const tiposReporte = Object.keys(TIPOS_REPORTES_SISTEMA);
    const estados = ['generado', 'procesando', 'error', 'descargado'];
    const formatos = ['pdf', 'excel', 'csv', 'json'];
    const periodos = ['Hoy', 'Esta Semana', 'Este Mes', 'Este Trimestre', 'Este Año'];
    
    const nombresReporte = {
        'ventas': ['Reporte de Ventas Diarias', 'Análisis de Ingresos', 'Tendencias de Ventas', 'Ventas por Producto'],
        'socios': ['Reporte de Membresías', 'Análisis de Socios', 'Renovaciones Pendientes', 'Nuevos Registros'],
        'inventario': ['Stock Actual', 'Productos Más Vendidos', 'Reabastecimiento Necesario', 'Valor de Inventario'],
        'productos': ['Catálogo de Productos', 'Análisis de Rotación', 'Productos Populares', 'Control de Stock por Producto'],
        'financiero': ['Estado de Resultados', 'Flujo de Efectivo', 'Balance General', 'Indicadores Financieros'],
        'operacional': ['Utilización del Gimnasio', 'Horarios Pico', 'Mantenimiento de Equipos', 'Eficiencia Operacional'],
        'completo': ['Reporte Ejecutivo Mensual', 'Dashboard Completo', 'Análisis Integral', 'Reporte Anual']
    };
    
    let idCounter = 1;
    
    for (let tipoIndex = 0; tipoIndex < tiposReporte.length; tipoIndex++) {
        const tipo = tiposReporte[tipoIndex];
        const nombresPorTipo = nombresReporte[tipo];
        
        // Generar diferentes reportes para cada tipo
        for (let j = 0; j < Math.floor(Math.random() * 25) + 15; j++) {
            if (idCounter > 127) break;
            
            const nombreBase = nombresPorTipo[Math.floor(Math.random() * nombresPorTipo.length)];
            const periodo = periodos[Math.floor(Math.random() * periodos.length)];
            const estado = estados[Math.floor(Math.random() * estados.length)];
            const formato = formatos[Math.floor(Math.random() * formatos.length)];
            
            // Fechas realistas
            const fechaGeneracion = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Últimos 90 días
            const fechaDescarga = estado === 'descargado' ? 
                new Date(fechaGeneracion.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
            
            // Calcular tamaño del archivo (simulado)
            const tamanoBase = {
                'pdf': { min: 500, max: 5000 }, // KB
                'excel': { min: 200, max: 2000 },
                'csv': { min: 50, max: 500 },
                'json': { min: 100, max: 1000 }
            };
            const tamano = Math.floor(Math.random() * 
                (tamanoBase[formato].max - tamanoBase[formato].min) + tamanoBase[formato].min);
            
            // Tiempo de generación simulado
            const tiempoGeneracion = Math.floor(Math.random() * 300) + 30; // 30-330 segundos
            
            todosLosReportes.push({
                id: idCounter++,
                nombre: `${nombreBase} - ${periodo}`,
                tipo: tipo,
                periodo: periodo,
                estado: estado,
                formato: formato,
                fechaGeneracion: fechaGeneracion,
                fechaDescarga: fechaDescarga,
                tamanoArchivo: `${(tamano / 1024).toFixed(1)} MB`,
                tiempoGeneracion: `${Math.floor(tiempoGeneracion / 60)}:${(tiempoGeneracion % 60).toString().padStart(2, '0')}`,
                usuario: 'Admin',
                descripcion: `Reporte ${tipo} generado para el período ${periodo.toLowerCase()}`,
                parametros: {
                    fechaInicio: new Date(fechaGeneracion.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    fechaFin: fechaGeneracion,
                    incluirGraficos: Math.random() > 0.5,
                    incluirDetalles: Math.random() > 0.3
                },
                activo: Math.random() > 0.05 // 95% reportes activos
            });
        }
        if (idCounter > 127) break;
    }
    
    // Ordenar por fecha de generación (más recientes primero)
    todosLosReportes.sort((a, b) => b.fechaGeneracion - a.fechaGeneracion);
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(reportesFiltrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, reportesFiltrados.length);
    
    // Actualizar información de registros
    document.getElementById('registros-inicio-reportes').textContent = inicio;
    document.getElementById('registros-fin-reportes').textContent = fin;
    document.getElementById('total-registros-reportes').textContent = reportesFiltrados.length;
    document.getElementById('total-reportes').textContent = `${reportesFiltrados.length} reportes`;
    
    // Actualizar botones de navegación
    document.getElementById('btn-primera-pagina-reportes').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-anterior-reportes').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-siguiente-reportes').disabled = paginaActual === totalPaginas;
    document.getElementById('btn-ultima-pagina-reportes').disabled = paginaActual === totalPaginas;
    
    // Generar números de página
    generarNumerosPagina(totalPaginas);
};

const generarNumerosPagina = (totalPaginas) => {
    const container = document.getElementById('numeros-pagina-reportes');
    container.innerHTML = '';
    
    const maxBotones = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas, inicio + maxBotones - 1);
    
    if (fin - inicio + 1 < maxBotones) {
        inicio = Math.max(1, fin - maxBotones + 1);
    }
    
    // Botón primera página
    if (inicio > 1) {
        container.appendChild(crearBotonPagina(1));
        if (inicio > 2) {
            const span = document.createElement('span');
            span.className = 'px-2 text-gray-500';
            span.textContent = '...';
            container.appendChild(span);
        }
    }
    
    // Botones de páginas
    for (let i = inicio; i <= fin; i++) {
        container.appendChild(crearBotonPagina(i));
    }
    
    // Botón última página
    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            const span = document.createElement('span');
            span.className = 'px-2 text-gray-500';
            span.textContent = '...';
            container.appendChild(span);
        }
        container.appendChild(crearBotonPagina(totalPaginas));
    }
};

const crearBotonPagina = (numeroPagina) => {
    const button = document.createElement('button');
    button.className = `px-3 py-2 text-sm font-medium border border-gray-600 rounded transition duration-200`;
    button.textContent = numeroPagina;
    
    if (numeroPagina === paginaActual) {
        button.className += ' text-white active';
        button.style.backgroundColor = 'var(--color-rojo-principal)';
        button.style.borderColor = 'var(--color-rojo-principal)';
    } else {
        button.className += ' text-gray-400 hover:text-white hover:bg-gray-700';
        button.addEventListener('click', () => cambiarPagina(numeroPagina));
    }
    
    return button;
};

const cambiarPagina = (nuevaPagina) => {
    paginaActual = nuevaPagina;
    actualizarTabla();
    actualizarPaginacion();
};

// -----------------------------------------------------------
// FUNCIONES DE FILTRADO
// -----------------------------------------------------------
const aplicarFiltros = () => {
    const fechaFiltro = document.getElementById('fecha-filtro').value;
    const tipoFiltro = document.getElementById('tipo-reporte').value;
    const formatoFiltro = document.getElementById('formato-reporte').value;
    
    reportesFiltrados = todosLosReportes.filter(reporte => {
        // Filtro de fecha
        let coincideFecha = true;
        const ahora = new Date();
        const fechaReporte = reporte.fechaGeneracion;
        
        switch(fechaFiltro) {
            case 'hoy':
                coincideFecha = fechaReporte.toDateString() === ahora.toDateString();
                break;
            case 'semana':
                const inicioSemana = new Date(ahora);
                inicioSemana.setDate(ahora.getDate() - 7);
                coincideFecha = fechaReporte >= inicioSemana;
                break;
            case 'mes':
                const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
                coincideFecha = fechaReporte >= inicioMes;
                break;
            case 'trimestre':
                const inicioTrimestre = new Date(ahora.getFullYear(), Math.floor(ahora.getMonth() / 3) * 3, 1);
                coincideFecha = fechaReporte >= inicioTrimestre;
                break;
            case 'anio':
                const inicioAnio = new Date(ahora.getFullYear(), 0, 1);
                coincideFecha = fechaReporte >= inicioAnio;
                break;
        }
        
        // Filtro de tipo
        const coincideTipo = tipoFiltro === 'todos' || reporte.tipo === tipoFiltro;
        
        // Filtro de formato
        const coincideFormato = formatoFiltro === 'todos' || reporte.formato === formatoFiltro;
        
        return coincideFecha && coincideTipo && coincideFormato && reporte.activo;
    });
    
    paginaActual = 1; // Reset a la primera página
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

const limpiarFiltros = () => {
    document.getElementById('fecha-filtro').value = 'mes';
    document.getElementById('tipo-reporte').value = 'todos';
    document.getElementById('formato-reporte').value = 'todos';
    reportesFiltrados = todosLosReportes.filter(r => r.activo);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

// -----------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR LA TABLA
// -----------------------------------------------------------
const actualizarTabla = () => {
    const tbody = document.getElementById('tabla-reportes-body');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const reportesPagina = reportesFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = reportesPagina.map(reporte => generarFilaReporte(reporte)).join('');
    
    // Re-inicializar iconos de Lucide para las nuevas filas
    lucide.createIcons();
};

const generarFilaReporte = (reporte) => {
    const tipoInfo = obtenerInfoTipo(reporte.tipo);
    const estadoInfo = obtenerInfoEstado(reporte.estado);
    const formatoInfo = obtenerInfoFormato(reporte.formato);
    const fechaFormateada = reporte.fechaGeneracion.toLocaleDateString('es-ES');
    const horaFormateada = reporte.fechaGeneracion.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return `
        <tr class="hover:bg-gray-700 transition duration-200 cursor-pointer">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center" style="background-color: rgba(0, 191, 255, 0.2);">
                            <span class="text-sm font-bold" style="color: var(--color-azul-acento);">#${reporte.id}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-semibold text-white">${reporte.nombre}</div>
                        <div class="text-xs text-gray-400">${reporte.descripcion}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center justify-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tipo-${reporte.tipo}">
                        ${tipoInfo.icon} ${tipoInfo.nombre}
                    </span>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div>
                    <div class="text-white font-semibold">${reporte.periodo}</div>
                    <div class="text-gray-400">${reporte.tiempoGeneracion} min</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div>
                    <div class="text-white font-semibold">${fechaFormateada}</div>
                    <div class="text-gray-400">${horaFormateada}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full estado-${reporte.estado}">
                    ${estadoInfo.icon} ${estadoInfo.nombre}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full formato-${reporte.formato}">
                    ${formatoInfo.icon} ${formatoInfo.nombre.toUpperCase()}
                </span>
                <div class="text-xs text-gray-400 mt-1">${reporte.tamanoArchivo}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex items-center justify-center space-x-2">
                    <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200" title="Ver Detalles" onclick="verDetalleReporte(${reporte.id})">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition duration-200" title="Descargar" onclick="descargarReporte(${reporte.id})">
                        <i data-lucide="download" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition duration-200" title="Regenerar" onclick="regenerarReporte(${reporte.id})">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition duration-200" title="Eliminar" onclick="eliminarReporte(${reporte.id})">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// -----------------------------------------------------------
// FUNCIONES AUXILIARES
// -----------------------------------------------------------
const obtenerInfoTipo = (tipo) => {
    const tipoInfo = TIPOS_REPORTES_SISTEMA[tipo];
    if (tipoInfo) {
        return {
            nombre: tipoInfo.nombre,
            icon: tipoInfo.icon
        };
    }
    return TIPOS_REPORTES_SISTEMA['completo'];
};

const obtenerInfoEstado = (estado) => {
    const info = {
        'generado': { nombre: 'Generado', icon: '✅' },
        'procesando': { nombre: 'Procesando', icon: '⏳' },
        'error': { nombre: 'Error', icon: '❌' },
        'descargado': { nombre: 'Descargado', icon: '📥' }
    };
    return info[estado] || info['generado'];
};

const obtenerInfoFormato = (formato) => {
    const info = {
        'pdf': { nombre: 'PDF', icon: '📄' },
        'excel': { nombre: 'Excel', icon: '📊' },
        'csv': { nombre: 'CSV', icon: '📋' },
        'json': { nombre: 'JSON', icon: '🔧' }
    };
    return info[formato] || info['pdf'];
};

const actualizarKPIs = () => {
    const reportesActivos = todosLosReportes.filter(r => r.activo);
    const reportesGenerados = reportesActivos.filter(r => r.estado === 'generado').length;
    const ingresosTotales = 284750; // Simulado
    const tiempoPromedio = 2.4; // Simulado en minutos
    
    document.querySelector('.tarjeta-kpi:nth-child(1) .text-3xl').textContent = `$${ingresosTotales.toLocaleString()}`;
    document.querySelector('.tarjeta-kpi:nth-child(2) .text-3xl').textContent = reportesActivos.length;
    document.querySelector('.tarjeta-kpi:nth-child(3) .text-3xl').textContent = reportesGenerados;
    document.querySelector('.tarjeta-kpi:nth-child(4) .text-3xl').textContent = `${tiempoPromedio}m`;
};

const actualizarEstadoIntentos = () => {
    const container = document.getElementById('estado-intentos');
    if (!container) return;

    const ahora = new Date().getTime();
    let html = '';

    Object.keys(TIPOS_REPORTES_SISTEMA).forEach(tipo => {
        const tipoInfo = TIPOS_REPORTES_SISTEMA[tipo];
        const intentos = intentosGeneracion[tipo] || 0;
        const tiempoEspera = tiemposEspera[tipo];
        const intentosRestantes = Math.max(0, LIMITE_INTENTOS - intentos);
        
        let estadoClass = 'text-green-400';
        let estadoTexto = `✅ ${intentosRestantes}/2`;
        let detalles = '';
        
        if (tiempoEspera && ahora < tiempoEspera) {
            const minutosRestantes = Math.ceil((tiempoEspera - ahora) / (1000 * 60));
            estadoClass = 'text-red-400';
            estadoTexto = `⏳ Bloqueado`;
            detalles = `<div class="text-xs text-gray-500 mt-1">Esperar ${minutosRestantes}m</div>`;
        } else if (intentos >= LIMITE_INTENTOS) {
            estadoClass = 'text-red-400';
            estadoTexto = '🚫 Límite alcanzado';
        } else if (intentos > 0) {
            estadoClass = 'text-yellow-400';
            estadoTexto = `⚠️ ${intentosRestantes}/2`;
        }

        html += `
            <div class="flex justify-between items-center py-1">
                <div class="flex items-center">
                    <span class="text-xs">${tipoInfo.icon}</span>
                    <span class="ml-1 text-xs text-gray-400">${tipoInfo.nombre}</span>
                </div>
                <div class="text-right">
                    <div class="${estadoClass} font-semibold">${estadoTexto}</div>
                    ${detalles}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// -----------------------------------------------------------
// FUNCIONES DE VALIDACIÓN Y CONTROL DE INTENTOS
// -----------------------------------------------------------

const puedeGenerarReporte = (tipoReporte) => {
    const ahora = new Date().getTime();
    const tiempoEspera = tiemposEspera[tipoReporte];
    
    // Si hay un tiempo de espera activo, verificar si ya pasó
    if (tiempoEspera && ahora < tiempoEspera) {
        const minutosRestantes = Math.ceil((tiempoEspera - ahora) / (1000 * 60));
        mostrarToastLimiteIntetos(tipoReporte, minutosRestantes);
        return false;
    }
    
    // Si ya pasó el tiempo de espera, resetear intentos
    if (tiempoEspera && ahora >= tiempoEspera) {
        intentosGeneracion[tipoReporte] = 0;
        delete tiemposEspera[tipoReporte];
        actualizarEstadoIntentos(); // Actualizar indicador visual
    }
    
    // Verificar límite de intentos
    if (intentosGeneracion[tipoReporte] >= LIMITE_INTENTOS) {
        // Establecer tiempo de espera
        tiemposEspera[tipoReporte] = ahora + (TIEMPO_ESPERA_MINUTOS * 60 * 1000);
        mostrarToastLimiteIntetos(tipoReporte, TIEMPO_ESPERA_MINUTOS);
        actualizarEstadoIntentos(); // Actualizar indicador visual
        return false;
    }
    
    return true;
};

const registrarIntentoGeneracion = (tipoReporte) => {
    intentosGeneracion[tipoReporte] = (intentosGeneracion[tipoReporte] || 0) + 1;
    actualizarEstadoIntentos(); // Actualizar indicador visual
};

const determinarFormatoAutomatico = (tipoReporte, fechaInicio, fechaFin) => {
    const tipoInfo = TIPOS_REPORTES_SISTEMA[tipoReporte];
    if (!tipoInfo) return 'pdf';
    
    // Calcular días del período
    const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
    
    // Lógica de formato basada en tipo de consulta y período
    switch (tipoInfo.consulta) {
        case 'grande':
            return 'excel'; // Siempre Excel para consultas grandes
        case 'mediana':
            return dias > 7 ? 'excel' : 'pdf'; // Excel para períodos > 1 semana
        case 'pequena':
            return dias > 30 ? 'excel' : 'pdf'; // PDF preferido para consultas pequeñas
        default:
            return 'pdf';
    }
};

const mostrarToastLimiteIntetos = (tipoReporte, minutosEspera) => {
    const tipoInfo = TIPOS_REPORTES_SISTEMA[tipoReporte];
    const nombreTipo = tipoInfo ? tipoInfo.nombre : tipoReporte;
    
    mostrarToastEspecial(
        `⚠️ Demasiados intentos para reportes de ${nombreTipo}`,
        `Debe esperar ${minutosEspera} minuto(s) antes de generar otro reporte de este tipo.`,
        'warning',
        5000
    );
};

const mostrarToastEspecial = (titulo, mensaje, tipo = 'warning', duracion = 5000) => {
    const toast = document.createElement('div');
    toast.className = `toast-especial ${tipo}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong>${titulo}</strong>
        </div>
        <div class="toast-body">
            ${mensaje}
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">
            ✕
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-especial {
                position: fixed;
                top: 80px;
                right: 20px;
                min-width: 300px;
                max-width: 400px;
                background: var(--color-fondo-secundario, #1C1C20);
                border: 1px solid var(--color-azul-acento, #00BFFF);
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            .toast-especial.show { transform: translateX(0); }
            .toast-especial.warning { border-color: #fbbf24; }
            .toast-especial.error { border-color: var(--color-rojo-principal, #FF3B3B); }
            .toast-especial .toast-header {
                color: white;
                font-size: 14px;
                margin-bottom: 8px;
                font-weight: 600;
            }
            .toast-especial .toast-body {
                color: #d1d5db;
                font-size: 13px;
                line-height: 1.4;
            }
            .toast-especial .toast-close {
                position: absolute;
                top: 8px;
                right: 8px;
                cursor: pointer;
                color: #9ca3af;
                font-weight: bold;
                font-size: 16px;
                padding: 2px 6px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            .toast-especial .toast-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-remover
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duracion);
};

// -----------------------------------------------------------
// FUNCIONES DE GESTIÓN DE REPORTES
// -----------------------------------------------------------
const verDetalleReporte = (reporteId) => {
    const reporte = todosLosReportes.find(r => r.id === reporteId);
    if (reporte) {
        const fechaGen = reporte.fechaGeneracion.toLocaleString('es-ES');
        const fechaDesc = reporte.fechaDescarga ? reporte.fechaDescarga.toLocaleString('es-ES') : 'No descargado';
        alert(`Reporte: ${reporte.nombre}\nTipo: ${reporte.tipo}\nEstado: ${reporte.estado}\nFormato: ${reporte.formato}\nTamaño: ${reporte.tamanoArchivo}\nGenerado: ${fechaGen}\nDescargado: ${fechaDesc}`);
    }
};

const descargarReporte = (reporteId) => {
    const reporte = todosLosReportes.find(r => r.id === reporteId);
    if (reporte && reporte.estado === 'generado') {
        // Simular descarga
        reporte.estado = 'descargado';
        reporte.fechaDescarga = new Date();
        mostrarNotificacion('✅ Reporte descargado exitosamente', 'success');
        aplicarFiltros(); // Actualizar tabla
    } else {
        mostrarNotificacion('❌ No se puede descargar este reporte', 'error');
    }
};

const regenerarReporte = (reporteId) => {
    const reporte = todosLosReportes.find(r => r.id === reporteId);
    if (reporte) {
        reporte.estado = 'procesando';
        reporte.fechaGeneracion = new Date();
        mostrarNotificacion('🔄 Regenerando reporte...', 'info');
        
        // Simular tiempo de procesamiento
        setTimeout(() => {
            reporte.estado = 'generado';
            mostrarNotificacion('✅ Reporte regenerado exitosamente', 'success');
            aplicarFiltros(); // Actualizar tabla
        }, 3000);
        
        aplicarFiltros(); // Actualizar tabla inmediatamente
    }
};

const eliminarReporte = (reporteId) => {
    if (confirm('¿Está seguro de que desea eliminar este reporte?')) {
        const reporte = todosLosReportes.find(r => r.id === reporteId);
        if (reporte) {
            reporte.activo = false;
            aplicarFiltros();
            mostrarNotificacion('✅ Reporte eliminado correctamente', 'success');
        }
    }
};

// -----------------------------------------------------------
// FUNCIONES DEL MODAL
// -----------------------------------------------------------
const configurarModal = () => {
    const modal = document.getElementById('modal-reporte-avanzado');
    const btnGenerarReporte = document.getElementById('btn-generar-reporte');
    const btnCerrar = document.getElementById('btn-cerrar-modal-reporte');
    const btnCancelar = document.getElementById('btn-cancelar-reporte');
    const formReporte = document.getElementById('form-reporte-avanzado');
    const tipoReporteSelect = document.getElementById('tipo-reporte-modal');

    if (btnGenerarReporte) {
        btnGenerarReporte.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                configurarFechasIniciales();
            }
            lucide.createIcons();
        });
    }

    // Configurar fechas iniciales del modal
    const configurarFechasIniciales = () => {
        const hoy = new Date();
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(hoy.getDate() - 30);
        
        document.getElementById('fecha-inicio').value = treintaDiasAtras.toISOString().split('T')[0];
        document.getElementById('fecha-fin').value = hoy.toISOString().split('T')[0];
    };

    // Manejar cambios en el tipo de reporte
    if (tipoReporteSelect) {
        tipoReporteSelect.addEventListener('change', (e) => {
            const tipoSeleccionado = e.target.value;
            actualizarInfoTipo(tipoSeleccionado);
            actualizarFormatoInfo(tipoSeleccionado);
        });
    }

    const actualizarInfoTipo = (tipo) => {
        const infoDiv = document.getElementById('tipo-info');
        if (tipo && TIPOS_REPORTES_SISTEMA[tipo]) {
            const tipoInfo = TIPOS_REPORTES_SISTEMA[tipo];
            infoDiv.innerHTML = `${tipoInfo.descripcion}<br><small>⏱️ Tiempo estimado: ${tipoInfo.tiempoEstimado}</small>`;
            infoDiv.className = 'text-xs text-blue-400 mt-1';
        } else {
            infoDiv.innerHTML = '';
        }
    };

    const actualizarFormatoInfo = (tipo) => {
        const formatoDiv = document.getElementById('formato-info');
        if (tipo && TIPOS_REPORTES_SISTEMA[tipo]) {
            const tipoInfo = TIPOS_REPORTES_SISTEMA[tipo];
            let formatoTexto = '';
            
            switch (tipoInfo.consulta) {
                case 'grande':
                    formatoTexto = 'Excel (recomendado para grandes volúmenes de datos)';
                    break;
                case 'mediana':
                    formatoTexto = 'PDF para períodos cortos, Excel para períodos largos';
                    break;
                case 'pequena':
                    formatoTexto = 'PDF (recomendado para consultas rápidas)';
                    break;
                default:
                    formatoTexto = 'Se determinará automáticamente según el tipo y período';
            }
            
            formatoDiv.textContent = formatoTexto;
        } else {
            formatoDiv.textContent = 'Se determinará automáticamente según el tipo y período';
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (formReporte) {
                formReporte.reset();
                // Limpiar info dinámico
                document.getElementById('tipo-info').innerHTML = '';
                document.getElementById('formato-info').textContent = 'Se determinará automáticamente según el tipo y período';
            }
        }
    };

    if (btnCerrar) btnCerrar.addEventListener('click', closeModal);
    if (btnCancelar) btnCancelar.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Validación y envío del formulario
    if (formReporte) {
        formReporte.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(formReporte);
            const tipoReporte = document.getElementById('tipo-reporte-modal').value;
            
            // Validaciones básicas
            if (!tipoReporte) {
                mostrarNotificacion('❌ Por favor seleccione un tipo de reporte', 'error');
                return;
            }
            
            const fechaInicio = new Date(formData.get('fecha-inicio'));
            const fechaFin = new Date(formData.get('fecha-fin'));
            
            // Validar fechas
            if (fechaInicio >= fechaFin) {
                mostrarNotificacion('❌ La fecha de inicio debe ser anterior a la fecha de fin', 'error');
                return;
            }
            
            const diasDiferencia = (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24);
            if (diasDiferencia > 365) {
                mostrarNotificacion('❌ El período no puede ser mayor a 1 año', 'error');
                return;
            }
            
            // Validar límite de intentos antes de proceder
            if (!puedeGenerarReporte(tipoReporte)) {
                return; // El toast ya se muestra en la función puedeGenerarReporte
            }
            
            // Registrar intento de generación
            registrarIntentoGeneracion(tipoReporte);
            
            // Determinar formato automáticamente
            const formatoAutomatico = determinarFormatoAutomatico(tipoReporte, fechaInicio, fechaFin);
            
            const tipoInfo = TIPOS_REPORTES_SISTEMA[tipoReporte];
            const nombreTipo = tipoInfo ? tipoInfo.nombre : tipoReporte;
            
            const nuevoReporte = {
                id: Math.max(...todosLosReportes.map(r => r.id)) + 1,
                nombre: formData.get('nombre-reporte') || `Reporte de ${nombreTipo} - ${fechaInicio.toLocaleDateString('es-ES')}`,
                tipo: tipoReporte,
                periodo: 'Personalizado',
                estado: 'procesando',
                formato: formatoAutomatico,
                fechaGeneracion: new Date(),
                fechaDescarga: null,
                tamanoArchivo: '0 MB',
                tiempoGeneracion: '0:00',
                usuario: 'Admin',
                descripcion: formData.get('descripcion-reporte') || (tipoInfo ? tipoInfo.descripcion : `Reporte ${tipoReporte} personalizado`),
                parametros: {
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    incluirGraficos: formData.get('incluir-graficos') === 'on',
                    incluirDetalles: formData.get('incluir-detalles') === 'on'
                },
                activo: true
            };
            
            todosLosReportes.unshift(nuevoReporte); // Agregar al inicio
            
            const tiempoEstimado = tipoInfo ? tipoInfo.tiempoEstimado : '2-4 minutos';
            const intentosRestantes = LIMITE_INTENTOS - intentosGeneracion[tipoReporte];
            
            // Mostrar notificaciones informativas
            mostrarNotificacion(`🔄 Generando reporte de ${nombreTipo}... (${tiempoEstimado})`, 'info');
            mostrarNotificacion(`📄 Formato: ${formatoAutomatico.toUpperCase()} | Intentos restantes: ${intentosRestantes}`, 'info');
            
            // Simular tiempo de generación realista basado en el tipo
            const tiempoGeneracion = tipoInfo?.consulta === 'grande' ? 
                Math.floor(Math.random() * 3000) + 4000 : // 4-7 segundos para grandes
                Math.floor(Math.random() * 2000) + 2000;   // 2-4 segundos para otros
            
            setTimeout(() => {
                nuevoReporte.estado = 'generado';
                
                // Tamaño realista basado en formato
                const tamanoBase = formatoAutomatico === 'excel' ? 
                    { min: 2, max: 8 } : { min: 0.5, max: 3 };
                nuevoReporte.tamanoArchivo = `${(Math.random() * (tamanoBase.max - tamanoBase.min) + tamanoBase.min).toFixed(1)} MB`;
                
                nuevoReporte.tiempoGeneracion = `${Math.floor(tiempoGeneracion / 1000 / 60)}:${Math.floor((tiempoGeneracion / 1000) % 60).toString().padStart(2, '0')}`;
                
                mostrarNotificacion(`✅ Reporte de ${nombreTipo} generado exitosamente`, 'success');
                aplicarFiltros();
            }, tiempoGeneracion);
            
            aplicarFiltros();
            closeModal();
        });
    }
};

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------
const configurarEventListeners = () => {
    // Event listeners para filtros
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros-reportes');
    const btnReestablecerFiltros = document.getElementById('btn-restablecer-filtros');
    const fechaFiltro = document.getElementById('fecha-filtro');
    const tipoReporte = document.getElementById('tipo-reporte');
    const formatoReporte = document.getElementById('formato-reporte');
    
    if (btnAplicarFiltros) btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    if (btnReestablecerFiltros) btnReestablecerFiltros.addEventListener('click', limpiarFiltros);
    if (fechaFiltro) fechaFiltro.addEventListener('change', aplicarFiltros);
    if (tipoReporte) tipoReporte.addEventListener('change', aplicarFiltros);
    if (formatoReporte) formatoReporte.addEventListener('change', aplicarFiltros);
    
    // Event listeners para paginación
    const btnPrimeraPagina = document.getElementById('btn-primera-pagina-reportes');
    const btnPaginaAnterior = document.getElementById('btn-pagina-anterior-reportes');
    const btnPaginaSiguiente = document.getElementById('btn-pagina-siguiente-reportes');
    const btnUltimaPagina = document.getElementById('btn-ultima-pagina-reportes');
    
    if (btnPrimeraPagina) btnPrimeraPagina.addEventListener('click', () => cambiarPagina(1));
    if (btnPaginaAnterior) btnPaginaAnterior.addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
    if (btnPaginaSiguiente) btnPaginaSiguiente.addEventListener('click', () => {
        const totalPaginas = Math.ceil(reportesFiltrados.length / registrosPorPagina);
        cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
    });
    if (btnUltimaPagina) btnUltimaPagina.addEventListener('click', () => {
        const totalPaginas = Math.ceil(reportesFiltrados.length / registrosPorPagina);
        cambiarPagina(totalPaginas);
    });
    
    // Event listener para cambiar registros por página
    const registrosPorPaginaSelect = document.getElementById('registros-por-pagina-reportes');
    if (registrosPorPaginaSelect) {
        registrosPorPaginaSelect.addEventListener('change', (e) => {
            registrosPorPagina = parseInt(e.target.value);
            paginaActual = 1;
            actualizarTabla();
            actualizarPaginacion();
        });
    }
};

// Sistema de notificaciones
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => notificacion.classList.add('show'), 100);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
};

// Lógica para toggle en móvil
const menuToggle = document.getElementById('menu-toggle');
const backdrop = document.getElementById('backdrop');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        backdrop.classList.toggle('hidden');
    });
}

if (backdrop) {
    backdrop.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    });
}

// -----------------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------------

// Función de inicialización que se ejecuta cuando el DOM está listo
const inicializarReportes = () => {
    console.log('Inicializando reportes...');
    
    // Generar datos simulados y configurar la tabla inicial
    generateMockReportsData();
    console.log(`Reportes generados: ${todosLosReportes.length}`);
    
    reportesFiltrados = todosLosReportes.filter(r => r.activo);
    console.log(`Reportes activos filtrados: ${reportesFiltrados.length}`);
    
    // Configurar event listeners
    configurarEventListeners();
    configurarModal();
    
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
    actualizarEstadoIntentos();

    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    // Actualizar estado de intentos cada minuto
    setInterval(actualizarEstadoIntentos, 60000);
    
    console.log('Reportes inicializados correctamente');
};

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarReportes);
} else {
    inicializarReportes();
}