// ================================================
// MOVIMIENTOS.JS - CONTROL DE INGRESOS Y EGRESOS
// Sistema de gestión de movimientos financieros del gimnasio
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
let movimientosFiltrados = [];
let todosLosMovimientos = [];

// -----------------------------------------------------------
// INICIALIZACIÓN Y CARGA DE DATOS
// -----------------------------------------------------------

// Función para cargar movimientos desde localStorage
const cargarMovimientos = () => {
    const movimientosJSON = localStorage.getItem('hexodus_movimientos');
    if (movimientosJSON) {
        try {
            const movimientosCargados = JSON.parse(movimientosJSON);
            // Reconstruir fechas
            movimientosCargados.forEach(mov => {
                mov.fecha = new Date(mov.fecha);
            });
            todosLosMovimientos = movimientosCargados;
            console.log(`✅ ${movimientosCargados.length} movimientos cargados desde localStorage`);
        } catch (error) {
            console.error('❌ Error cargando movimientos desde localStorage:', error);
            generarMovimientosPrueba();
        }
    } else {
        console.log('⚠️ No hay movimientos guardados, generando datos de prueba...');
        generarMovimientosPrueba();
    }
};

// Función para guardar movimientos en localStorage
const guardarMovimientos = () => {
    try {
        localStorage.setItem('hexodus_movimientos', JSON.stringify(todosLosMovimientos));
        console.log(`💾 ${todosLosMovimientos.length} movimientos guardados en localStorage`);
    } catch (error) {
        console.error('❌ Error guardando movimientos:', error);
    }
};

// Función para generar movimientos de prueba
const generarMovimientosPrueba = () => {
    const conceptosIngresos = [
        'Pago de membresía mensual',
        'Pago de membresía anual',
        'Venta de producto',
        'Clase personalizada',
        'Inscripción nueva',
        'Renovación de membresía'
    ];
    
    const conceptosEgresos = [
        'Compra de equipo',
        'Mantenimiento de instalaciones',
        'Pago de servicios públicos',
        'Compra de productos',
        'Salario de personal',
        'Material de limpieza'
    ];
    
    const tiposPago = ['efectivo', 'transferencia', 'tarjeta'];
    const usuarios = ['Administrador', 'Gerente', 'Recepcionista'];
    
    todosLosMovimientos = [];
    
    // Generar 50 movimientos de prueba
    for (let i = 0; i < 50; i++) {
        const esIngreso = Math.random() > 0.4; // 60% ingresos, 40% egresos
        const tipo = esIngreso ? 'ingreso' : 'egreso';
        const conceptos = esIngreso ? conceptosIngresos : conceptosEgresos;
        
        const movimiento = {
            id: `mov_${Date.now()}_${i}`,
            fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
            tipo: tipo,
            concepto: conceptos[Math.floor(Math.random() * conceptos.length)],
            total: parseFloat((Math.random() * (esIngreso ? 2000 : 1500) + (esIngreso ? 500 : 200)).toFixed(2)),
            tipoPago: tiposPago[Math.floor(Math.random() * tiposPago.length)],
            usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
            observaciones: Math.random() > 0.7 ? 'Observación de ejemplo' : '',
            origen: 'manual', // 'manual', 'membresia', 'venta', etc.
            activo: true
        };
        
        todosLosMovimientos.push(movimiento);
    }
    
    // Ordenar por fecha descendente
    todosLosMovimientos.sort((a, b) => b.fecha - a.fecha);
    guardarMovimientos();
};

// -----------------------------------------------------------
// FUNCIONES DE KPIs
// -----------------------------------------------------------
const actualizarKPIs = () => {
    const movimientosActivos = movimientosFiltrados.filter(m => m.activo);
    
    const totalIngresos = movimientosActivos
        .filter(m => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + m.total, 0);
    
    const totalEgresos = movimientosActivos
        .filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + m.total, 0);
    
    const balanceNeto = totalIngresos - totalEgresos;
    
    document.getElementById('kpi-total-ingresos').textContent = `$${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('kpi-total-egresos').textContent = `$${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const balanceElement = document.getElementById('kpi-balance-neto');
    balanceElement.textContent = `$${Math.abs(balanceNeto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    balanceElement.style.color = balanceNeto >= 0 ? 'var(--color-exito)' : 'var(--color-peligro)';
    
    document.getElementById('kpi-total-movimientos').textContent = movimientosActivos.length;
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(movimientosFiltrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, movimientosFiltrados.length);
    
    document.getElementById('registros-inicio').textContent = inicio;
    document.getElementById('registros-fin').textContent = fin;
    document.getElementById('total-registros').textContent = movimientosFiltrados.length;
    document.getElementById('total-movimientos-display').textContent = `${movimientosFiltrados.length} movimientos`;
    
    document.getElementById('btn-primera-pagina').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-siguiente').disabled = paginaActual === totalPaginas;
    document.getElementById('btn-ultima-pagina').disabled = paginaActual === totalPaginas;
    
    generarNumerosPagina(totalPaginas);
};

const generarNumerosPagina = (totalPaginas) => {
    const container = document.getElementById('numeros-pagina');
    container.innerHTML = '';
    
    let paginasAMostrar = [];
    
    if (totalPaginas <= 7) {
        paginasAMostrar = Array.from({ length: totalPaginas }, (_, i) => i + 1);
    } else {
        if (paginaActual <= 4) {
            paginasAMostrar = [1, 2, 3, 4, 5, '...', totalPaginas];
        } else if (paginaActual >= totalPaginas - 3) {
            paginasAMostrar = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
        } else {
            paginasAMostrar = [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
        }
    }
    
    paginasAMostrar.forEach(pagina => {
        if (pagina === '...') {
            const span = document.createElement('span');
            span.textContent = '...';
            span.className = 'px-3 py-2 text-sm text-gray-400';
            container.appendChild(span);
        } else {
            container.appendChild(crearBotonPagina(pagina));
        }
    });
    
    lucide.createIcons();
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
    const busqueda = document.getElementById('buscar-movimiento').value.toLowerCase().trim();
    const tipoFiltro = document.getElementById('filtro-tipo').value;
    const tipoPagoFiltro = document.getElementById('filtro-tipo-pago').value;
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    movimientosFiltrados = todosLosMovimientos.filter(movimiento => {
        if (!movimiento.activo) return false;
        
        // Filtro de búsqueda
        const coincideBusqueda = !busqueda || 
            movimiento.concepto.toLowerCase().includes(busqueda) ||
            movimiento.id.toLowerCase().includes(busqueda) ||
            movimiento.usuario.toLowerCase().includes(busqueda);
        
        // Filtro de tipo
        const coincideTipo = tipoFiltro === 'todos' || movimiento.tipo === tipoFiltro;
        
        // Filtro de tipo de pago
        const coincideTipoPago = tipoPagoFiltro === 'todos' || movimiento.tipoPago === tipoPagoFiltro;
        
        // Filtro de rango de fechas
        let coincideFecha = true;
        if (fechaInicio && fechaFin) {
            const fechaMovimiento = new Date(movimiento.fecha).setHours(0, 0, 0, 0);
            const inicio = new Date(fechaInicio).setHours(0, 0, 0, 0);
            const fin = new Date(fechaFin).setHours(23, 59, 59, 999);
            coincideFecha = fechaMovimiento >= inicio && fechaMovimiento <= fin;
        } else if (fechaInicio) {
            const fechaMovimiento = new Date(movimiento.fecha).setHours(0, 0, 0, 0);
            const inicio = new Date(fechaInicio).setHours(0, 0, 0, 0);
            coincideFecha = fechaMovimiento >= inicio;
        } else if (fechaFin) {
            const fechaMovimiento = new Date(movimiento.fecha).setHours(0, 0, 0, 0);
            const fin = new Date(fechaFin).setHours(23, 59, 59, 999);
            coincideFecha = fechaMovimiento <= fin;
        }
        
        return coincideBusqueda && coincideTipo && coincideTipoPago && coincideFecha;
    });
    
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

const limpiarFiltros = () => {
    document.getElementById('buscar-movimiento').value = '';
    document.getElementById('filtro-tipo').value = 'todos';
    document.getElementById('filtro-tipo-pago').value = 'todos';
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    movimientosFiltrados = todosLosMovimientos.filter(m => m.activo);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

// -----------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR LA TABLA
// -----------------------------------------------------------
const actualizarTabla = () => {
    const tbody = document.getElementById('tabla-movimientos-body');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const movimientosPagina = movimientosFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = movimientosPagina.map(movimiento => generarFilaMovimiento(movimiento)).join('');
    
    lucide.createIcons();
};

const generarFilaMovimiento = (movimiento) => {
    const tipoClase = movimiento.tipo === 'ingreso' ? 'tipo-ingreso' : 'tipo-egreso';
    const tipoIcono = movimiento.tipo === 'ingreso' ? 'trending-up' : 'trending-down';
    const tipoTexto = movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
    
    const tipoPagoClase = `pago-${movimiento.tipoPago}`;
    const tipoPagoIcono = {
        'efectivo': 'dollar-sign',
        'transferencia': 'credit-card',
        'tarjeta': 'credit-card'
    }[movimiento.tipoPago];
    const tipoPagoTexto = {
        'efectivo': 'Efectivo',
        'transferencia': 'Transferencia',
        'tarjeta': 'Tarjeta'
    }[movimiento.tipoPago];
    
    const fechaFormateada = movimiento.fecha.toLocaleDateString('es-ES');
    const horaFormateada = movimiento.fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return `
        <tr class="hover:bg-gray-700 transition duration-200">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">${fechaFormateada}</div>
                <div class="text-xs text-gray-400">${horaFormateada}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoClase}">
                    <i data-lucide="${tipoIcono}" class="w-3 h-3 mr-1"></i>
                    ${tipoTexto}
                </span>
            </td>
            <td class="px-4 py-4">
                <div class="text-sm font-medium text-white">${movimiento.concepto}</div>
                ${movimiento.observaciones ? `<div class="text-xs text-gray-400 mt-1">${movimiento.observaciones}</div>` : ''}
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-bold ${movimiento.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}">
                    ${movimiento.tipo === 'ingreso' ? '+' : '-'} $${movimiento.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoPagoClase}">
                    <i data-lucide="${tipoPagoIcono}" class="w-3 h-3 mr-1"></i>
                    ${tipoPagoTexto}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300">${movimiento.usuario}</div>
            </td>
            <td class="px-4 py-4 text-center whitespace-nowrap">
                <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200 mr-2 btn-ver-movimiento" 
                        data-movimiento-id="${movimiento.id}" title="Ver detalles">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
                ${movimiento.origen === 'manual' ? `
                <button class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition duration-200 btn-eliminar-movimiento" 
                        data-movimiento-id="${movimiento.id}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `;
};

// -----------------------------------------------------------
// FUNCIONES DE MODAL
// -----------------------------------------------------------
const abrirModalMovimiento = () => {
    document.getElementById('modal-titulo').textContent = 'Registrar Nuevo Movimiento';
    document.getElementById('form-movimiento').reset();
    document.getElementById('modal-movimiento').classList.remove('hidden');
    lucide.createIcons();
};

const cerrarModalMovimiento = () => {
    document.getElementById('modal-movimiento').classList.add('hidden');
    document.getElementById('form-movimiento').reset();
};

// -----------------------------------------------------------
// FUNCIÓN PARA REGISTRAR MOVIMIENTO
// -----------------------------------------------------------
const registrarMovimiento = (formData) => {
    const nuevoMovimiento = {
        id: `mov_${Date.now()}`,
        fecha: new Date(),
        tipo: formData.get('tipo-movimiento'),
        concepto: formData.get('concepto-movimiento'),
        total: parseFloat(formData.get('total-movimiento')),
        tipoPago: formData.get('tipo-pago-movimiento'),
        usuario: 'Administrador', // En producción obtener del usuario autenticado
        observaciones: formData.get('observaciones-movimiento') || '',
        origen: 'manual',
        activo: true
    };
    
    todosLosMovimientos.unshift(nuevoMovimiento);
    guardarMovimientos();
    aplicarFiltros();
    cerrarModalMovimiento();
    mostrarNotificacion(`✅ Movimiento de ${nuevoMovimiento.tipo} registrado exitosamente`, 'success');
};

// -----------------------------------------------------------
// FUNCIÓN PARA ELIMINAR MOVIMIENTO
// -----------------------------------------------------------
const eliminarMovimiento = (movimientoId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.')) {
        const movimiento = todosLosMovimientos.find(m => m.id === movimientoId);
        
        if (movimiento && movimiento.origen === 'manual') {
            movimiento.activo = false;
            guardarMovimientos();
            aplicarFiltros();
            mostrarNotificacion('✅ Movimiento eliminado exitosamente', 'success');
        } else {
            mostrarNotificacion('❌ No se puede eliminar este movimiento', 'error');
        }
    }
};

// -----------------------------------------------------------
// FUNCIÓN PÚBLICA PARA REGISTRAR MOVIMIENTOS AUTOMÁTICOS
// -----------------------------------------------------------
window.registrarMovimientoAutomatico = (datos) => {
    const nuevoMovimiento = {
        id: `mov_${Date.now()}`,
        fecha: new Date(),
        tipo: datos.tipo,
        concepto: datos.concepto,
        total: datos.total,
        tipoPago: datos.tipoPago || 'efectivo',
        usuario: datos.usuario || 'Sistema',
        observaciones: datos.observaciones || '',
        origen: datos.origen || 'automatico',
        activo: true
    };
    
    // Cargar movimientos actuales
    const movimientosJSON = localStorage.getItem('hexodus_movimientos');
    const movimientos = movimientosJSON ? JSON.parse(movimientosJSON) : [];
    
    movimientos.unshift(nuevoMovimiento);
    localStorage.setItem('hexodus_movimientos', JSON.stringify(movimientos));
    
    console.log('✅ Movimiento automático registrado:', nuevoMovimiento);
    return nuevoMovimiento;
};

// -----------------------------------------------------------
// FUNCIÓN PARA VER DETALLES DE UN MOVIMIENTO
// -----------------------------------------------------------
const verDetallesMovimiento = (movimientoId) => {
    const movimiento = todosLosMovimientos.find(m => m.id === movimientoId);
    if (!movimiento) return;
    
    const tipoTexto = movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
    const tipoPagoTexto = {
        'efectivo': 'Efectivo',
        'transferencia': 'Transferencia',
        'tarjeta': 'Tarjeta'
    }[movimiento.tipoPago];
    
    const origenTexto = {
        'manual': 'Registro manual',
        'membresia': 'Pago de membresía',
        'venta': 'Venta de producto',
        'automatico': 'Registro automático'
    }[movimiento.origen] || 'Otro';
    
    const detalles = `
        📋 DETALLES DEL MOVIMIENTO
        
        Folio: ${movimiento.id}
        Fecha: ${movimiento.fecha.toLocaleString('es-ES')}
        Tipo: ${tipoTexto}
        Concepto: ${movimiento.concepto}
        Total: $${movimiento.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        Tipo de pago: ${tipoPagoTexto}
        Usuario: ${movimiento.usuario}
        Origen: ${origenTexto}
        ${movimiento.observaciones ? `\nObservaciones: ${movimiento.observaciones}` : ''}
    `;
    
    alert(detalles);
};

// -----------------------------------------------------------
// SISTEMA DE NOTIFICACIONES
// -----------------------------------------------------------
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 transition-all duration-300 transform translate-x-full`;
    
    const colores = {
        'success': 'bg-green-600',
        'error': 'bg-red-600', 
        'warning': 'bg-yellow-600',
        'info': 'bg-blue-600'
    };
    
    notificacion.className += ` ${colores[tipo]}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => notificacion.classList.remove('translate-x-full'), 100);
    
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
};

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------

// Filtros
document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
document.getElementById('buscar-movimiento').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-tipo-pago').addEventListener('change', aplicarFiltros);
document.getElementById('fecha-inicio').addEventListener('change', aplicarFiltros);
document.getElementById('fecha-fin').addEventListener('change', aplicarFiltros);

// Paginación
document.getElementById('btn-primera-pagina').addEventListener('click', () => cambiarPagina(1));
document.getElementById('btn-pagina-anterior').addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
document.getElementById('btn-pagina-siguiente').addEventListener('click', () => {
    const totalPaginas = Math.ceil(movimientosFiltrados.length / registrosPorPagina);
    cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
});
document.getElementById('btn-ultima-pagina').addEventListener('click', () => {
    const totalPaginas = Math.ceil(movimientosFiltrados.length / registrosPorPagina);
    cambiarPagina(totalPaginas);
});

// Cambiar registros por página
document.getElementById('registros-por-pagina').addEventListener('change', (e) => {
    registrosPorPagina = parseInt(e.target.value);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
});

// Modal
document.getElementById('btn-agregar-movimiento').addEventListener('click', abrirModalMovimiento);
document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModalMovimiento);
document.getElementById('btn-cancelar-movimiento').addEventListener('click', cerrarModalMovimiento);

// Formulario
document.getElementById('form-movimiento').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    registrarMovimiento(formData);
});

// Delegation para botones dinámicos
document.getElementById('tabla-movimientos-body').addEventListener('click', (e) => {
    const btnVer = e.target.closest('.btn-ver-movimiento');
    const btnEliminar = e.target.closest('.btn-eliminar-movimiento');
    
    if (btnVer) {
        const movimientoId = btnVer.dataset.movimientoId;
        verDetallesMovimiento(movimientoId);
    }
    
    if (btnEliminar) {
        const movimientoId = btnEliminar.dataset.movimientoId;
        eliminarMovimiento(movimientoId);
    }
});

// Toggle móvil
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
const inicializarMovimientos = () => {
    console.log('🚀 Inicializando módulo de movimientos...');
    cargarMovimientos();
    movimientosFiltrados = todosLosMovimientos.filter(m => m.activo);
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
    lucide.createIcons();
    console.log('✅ Módulo de movimientos inicializado correctamente');
};

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarMovimientos);
} else {
    inicializarMovimientos();
}
