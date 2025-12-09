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
let totalVentas = 1247;
let ventasFiltradas = [];
let todasLasVentas = []; // Simulated data - replace with API calls
let productosDisponibles = [];
let productosSeleccionados = [];

// -----------------------------------------------------------
// DATOS SIMULADOS (Reemplazar con llamadas a API)
// -----------------------------------------------------------
const generateMockSalesData = () => {
    const clientes = ['Juan López', 'Andrea González', 'Carlos Ortíz', 'María Rodríguez', 'Luis Martínez', 'Ana Sánchez', 'Pedro García', 'Laura Jiménez', 'Miguel Torres', 'Carmen Ruiz'];
    const productos = [
        { id: 1, nombre: 'Proteína Whey', precio: 850 },
        { id: 2, nombre: 'Creatina 300g', precio: 450 },
        { id: 3, nombre: 'BCAA Capsulas', precio: 320 },
        { id: 4, nombre: 'Shaker 500ml', precio: 120 },
        { id: 5, nombre: 'Toalla Gym', precio: 180 },
        { id: 6, nombre: 'Guantes Training', precio: 250 },
        { id: 7, nombre: 'Banda Elástica', precio: 95 },
        { id: 8, nombre: 'Botella de Agua', precio: 65 }
    ];
    const metodosPago = ['efectivo', 'tarjeta', 'transferencia', 'digital'];
    
    productosDisponibles = [...productos];
    
    for (let i = 1; i <= 1247; i++) {
        const cliente = clientes[Math.floor(Math.random() * clientes.length)];
        const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];
        const numProductos = Math.floor(Math.random() * 4) + 1; // 1-4 productos
        const productosVenta = [];
        let totalVenta = 0;
        
        for (let j = 0; j < numProductos; j++) {
            const producto = productos[Math.floor(Math.random() * productos.length)];
            const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 cantidad
            const subtotal = producto.precio * cantidad;
            
            productosVenta.push({
                ...producto,
                cantidad: cantidad,
                subtotal: subtotal
            });
            totalVenta += subtotal;
        }
        
        const fechaVenta = new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)); // Últimos 90 días
        
        todasLasVentas.push({
            id: 10000 + i,
            cliente: cliente,
            productos: productosVenta,
            total: totalVenta,
            fecha: fechaVenta,
            metodoPago: metodoPago,
            estado: 'completada'
        });
    }
    
    // Ordenar por fecha descendente (más reciente primero)
    todasLasVentas.sort((a, b) => b.fecha - a.fecha);
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(ventasFiltradas.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, ventasFiltradas.length);
    
    // Actualizar información de registros
    document.getElementById('registros-inicio').textContent = inicio;
    document.getElementById('registros-fin').textContent = fin;
    document.getElementById('total-registros').textContent = ventasFiltradas.length;
    document.getElementById('total-ventas').textContent = `${ventasFiltradas.length} ventas`;
    
    // Actualizar botones de navegación
    document.getElementById('btn-primera-pagina').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-siguiente').disabled = paginaActual === totalPaginas;
    document.getElementById('btn-ultima-pagina').disabled = paginaActual === totalPaginas;
    
    // Generar números de página
    generarNumerosPagina(totalPaginas);
};

const generarNumerosPagina = (totalPaginas) => {
    const container = document.getElementById('numeros-pagina');
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
        button.className += ' text-white';
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
    const busqueda = document.getElementById('buscar').value.toLowerCase().trim();
    const fechaFiltro = document.getElementById('fecha-filtro').value;
    const tipoPago = document.getElementById('tipo-pago').value;
    
    ventasFiltradas = todasLasVentas.filter(venta => {
        // Filtro de búsqueda
        const coincideBusqueda = !busqueda || 
            venta.id.toString().includes(busqueda) ||
            venta.cliente.toLowerCase().includes(busqueda) ||
            venta.productos.some(p => p.nombre.toLowerCase().includes(busqueda));
        
        // Filtro de fecha
        let coincideFecha = true;
        if (fechaFiltro !== 'personalizado') {
            const hoy = new Date();
            const fechaVenta = new Date(venta.fecha);
            
            switch(fechaFiltro) {
                case 'hoy':
                    coincideFecha = fechaVenta.toDateString() === hoy.toDateString();
                    break;
                case 'ayer':
                    const ayer = new Date(hoy);
                    ayer.setDate(ayer.getDate() - 1);
                    coincideFecha = fechaVenta.toDateString() === ayer.toDateString();
                    break;
                case 'semana':
                    const inicioSemana = new Date(hoy);
                    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
                    coincideFecha = fechaVenta >= inicioSemana;
                    break;
                case 'mes':
                    coincideFecha = fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear();
                    break;
            }
        }
        
        // Filtro de tipo de pago
        const coincideTipoPago = tipoPago === 'todos' || venta.metodoPago === tipoPago;
        
        return coincideBusqueda && coincideFecha && coincideTipoPago;
    });
    
    paginaActual = 1; // Reset a la primera página
    actualizarTabla();
    actualizarPaginacion();
};

const limpiarFiltros = () => {
    document.getElementById('buscar').value = '';
    document.getElementById('fecha-filtro').value = 'hoy';
    document.getElementById('tipo-pago').value = 'todos';
    ventasFiltradas = [...todasLasVentas];
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
};

// -----------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR LA TABLA
// -----------------------------------------------------------
const actualizarTabla = () => {
    const tbody = document.getElementById('tabla-ventas-body');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const ventasPagina = ventasFiltradas.slice(inicio, fin);
    
    tbody.innerHTML = ventasPagina.map(venta => generarFilaVenta(venta)).join('');
    
    // Re-inicializar iconos de Lucide para las nuevas filas
    lucide.createIcons();
};

const generarFilaVenta = (venta) => {
    const metodoPagoInfo = obtenerInfoMetodoPago(venta.metodoPago);
    const fechaFormateada = venta.fecha.toLocaleDateString('es-ES');
    const horaFormateada = venta.fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const productosTexto = venta.productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
    
    return `
        <tr class="hover:bg-gray-700 transition duration-200 cursor-pointer">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center" style="background-color: rgba(0, 191, 255, 0.2);">
                            <span class="text-sm font-bold" style="color: var(--color-azul-acento);">#${venta.id}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-semibold text-white">${venta.cliente}</div>
                    <div class="text-xs text-gray-400">${horaFormateada}</div>
                </div>
            </td>
            <td class="px-4 py-4">
                <div class="max-w-xs">
                    <div class="text-sm text-white truncate" title="${productosTexto}">${productosTexto}</div>
                    <div class="text-xs text-gray-400">${venta.productos.length} producto(s)</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-lg font-bold" style="color: var(--color-rojo-principal);">$${venta.total.toFixed(2)}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="text-white font-semibold">${fechaFormateada}</div>
                <div class="text-xs text-gray-400">${horaFormateada}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full metodo-pago-${venta.metodoPago}">
                    ${metodoPagoInfo.icon} ${metodoPagoInfo.nombre}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex items-center justify-center space-x-2">
                    <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200" title="Ver Detalle" onclick="verDetalleVenta(${venta.id})">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition duration-200" title="Imprimir Ticket" onclick="imprimirTicket(${venta.id})">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition duration-200" title="Anular Venta" onclick="anularVenta(${venta.id})">
                        <i data-lucide="x-circle" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// -----------------------------------------------------------
// FUNCIONES AUXILIARES
// -----------------------------------------------------------
const obtenerInfoMetodoPago = (metodo) => {
    const info = {
        'efectivo': { nombre: 'Efectivo', icon: '💵' },
        'tarjeta': { nombre: 'Tarjeta', icon: '💳' },
        'transferencia': { nombre: 'Transferencia', icon: '🏦' },
        'digital': { nombre: 'Digital', icon: '📱' }
    };
    return info[metodo] || info['efectivo'];
};

// -----------------------------------------------------------
// FUNCIONES DE GESTIÓN DE VENTAS
// -----------------------------------------------------------
const agregarProducto = () => {
    const busqueda = document.getElementById('producto-buscar').value.toLowerCase();
    const producto = productosDisponibles.find(p => 
        p.nombre.toLowerCase().includes(busqueda)
    );
    
    if (producto) {
        const existente = productosSeleccionados.find(p => p.id === producto.id);
        if (existente) {
            existente.cantidad += 1;
            existente.subtotal = existente.precio * existente.cantidad;
        } else {
            productosSeleccionados.push({
                ...producto,
                cantidad: 1,
                subtotal: producto.precio
            });
        }
        
        document.getElementById('producto-buscar').value = '';
        actualizarListaProductos();
    } else {
        mostrarNotificacion('❌ Producto no encontrado', 'error');
    }
};

const actualizarListaProductos = () => {
    const container = document.getElementById('lista-productos-seleccionados');
    
    if (productosSeleccionados.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray-400 text-center py-4">No hay productos seleccionados</div>';
        document.getElementById('total-venta').textContent = '$0.00';
        return;
    }
    
    container.innerHTML = productosSeleccionados.map((producto, index) => `
        <div class="producto-item">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="font-semibold text-white">${producto.nombre}</div>
                    <div class="text-sm precio">$${producto.precio.toFixed(2)} c/u</div>
                </div>
                <div class="cantidad-control">
                    <button type="button" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <span class="px-2">${producto.cantidad}</span>
                    <button type="button" onclick="cambiarCantidad(${index}, 1)">+</button>
                    <button type="button" onclick="eliminarProducto(${index})" class="ml-2 text-red-400 hover:text-red-300">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <div class="mt-2 text-right">
                <span class="font-bold" style="color: var(--color-rojo-principal);">$${producto.subtotal.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
    
    const total = productosSeleccionados.reduce((sum, p) => sum + p.subtotal, 0);
    document.getElementById('total-venta').textContent = `$${total.toFixed(2)}`;
    
    // Re-inicializar iconos
    lucide.createIcons();
};

const cambiarCantidad = (index, cambio) => {
    const producto = productosSeleccionados[index];
    producto.cantidad = Math.max(1, producto.cantidad + cambio);
    producto.subtotal = producto.precio * producto.cantidad;
    actualizarListaProductos();
};

const eliminarProducto = (index) => {
    productosSeleccionados.splice(index, 1);
    actualizarListaProductos();
};

// -----------------------------------------------------------
// FUNCIONES DEL MODAL
// -----------------------------------------------------------
const modal = document.getElementById('modal-nueva-venta');
const btnNuevaVenta = document.getElementById('btn-nueva-venta');
const btnCerrar = document.getElementById('btn-cerrar-modal');
const btnCancelar = document.getElementById('btn-cancelar-venta');
const formNuevaVenta = document.getElementById('form-nueva-venta');

btnNuevaVenta.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
});

const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    formNuevaVenta.reset();
    productosSeleccionados = [];
    actualizarListaProductos();
};

btnCerrar.addEventListener('click', closeModal);
btnCancelar.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Validación y envío del formulario
formNuevaVenta.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (productosSeleccionados.length === 0) {
        mostrarNotificacion('❌ Debe agregar al menos un producto', 'error');
        return;
    }
    
    const formData = new FormData(formNuevaVenta);
    const total = productosSeleccionados.reduce((sum, p) => sum + p.subtotal, 0);
    
    const nuevaVenta = {
        id: Math.max(...todasLasVentas.map(v => v.id)) + 1,
        cliente: formData.get('cliente-buscar') || 'Cliente General',
        productos: [...productosSeleccionados],
        total: total,
        fecha: new Date(),
        metodoPago: formData.get('metodo-pago'),
        estado: 'completada'
    };
    
    // Agregar al array de ventas
    todasLasVentas.unshift(nuevaVenta);
    aplicarFiltros(); // Refresh tabla con filtros actuales
    
    // 💰 Registrar movimiento automático (ingreso)
    if (window.registrarMovimientoAutomatico) {
        window.registrarMovimientoAutomatico({
            tipo: 'ingreso',
            concepto: `Venta - ${nuevaVenta.cliente}`,
            total: nuevaVenta.total,
            tipoPago: nuevaVenta.metodoPago,
            observaciones: `Venta #${nuevaVenta.id}. Productos: ${productosSeleccionados.length}`,
            origen: 'ventas'
        });
    }
    
    // Mostrar mensaje de éxito
    mostrarNotificacion('✅ Venta registrada exitosamente', 'success');
    
    closeModal();
});

// -----------------------------------------------------------
// FUNCIONES DE ACCIÓN
// -----------------------------------------------------------
const verDetalleVenta = (ventaId) => {
    const venta = todasLasVentas.find(v => v.id === ventaId);
    if (venta) {
        const detalle = venta.productos.map(p => `${p.cantidad}x ${p.nombre} - $${p.subtotal.toFixed(2)}`).join('\n');
        alert(`Venta #${venta.id}\nCliente: ${venta.cliente}\nProductos:\n${detalle}\nTotal: $${venta.total.toFixed(2)}`);
    }
};

const imprimirTicket = (ventaId) => {
    mostrarNotificacion('🖨️ Enviando ticket a impresora...', 'info');
};

const anularVenta = (ventaId) => {
    if (confirm('¿Está seguro de que desea anular esta venta?')) {
        const index = todasLasVentas.findIndex(v => v.id === ventaId);
        if (index !== -1) {
            todasLasVentas[index].estado = 'anulada';
            mostrarNotificacion('✅ Venta anulada exitosamente', 'success');
            aplicarFiltros();
        }
    }
};

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------

// Event listeners para filtros
document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
document.getElementById('buscar').addEventListener('input', aplicarFiltros);
document.getElementById('fecha-filtro').addEventListener('change', aplicarFiltros);
document.getElementById('tipo-pago').addEventListener('change', aplicarFiltros);

// Event listeners para paginación
document.getElementById('btn-primera-pagina').addEventListener('click', () => cambiarPagina(1));
document.getElementById('btn-pagina-anterior').addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
document.getElementById('btn-pagina-siguiente').addEventListener('click', () => {
    const totalPaginas = Math.ceil(ventasFiltradas.length / registrosPorPagina);
    cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
});
document.getElementById('btn-ultima-pagina').addEventListener('click', () => {
    const totalPaginas = Math.ceil(ventasFiltradas.length / registrosPorPagina);
    cambiarPagina(totalPaginas);
});

// Event listener para cambiar registros por página
document.getElementById('registros-por-pagina').addEventListener('change', (e) => {
    registrosPorPagina = parseInt(e.target.value);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
});

// Event listener para agregar productos
document.getElementById('btn-agregar-producto').addEventListener('click', agregarProducto);
document.getElementById('producto-buscar').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        agregarProducto();
    }
});

// Sistema de notificaciones
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
    
    // Animar entrada
    setTimeout(() => notificacion.classList.remove('translate-x-full'), 100);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notificacion), 300);
    }, 3000);
};

// Lógica para toggle en móvil
const sidebar = document.querySelector('.sidebar');
const backdrop = document.getElementById('backdrop');
document.getElementById('menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    backdrop.classList.toggle('hidden');
});
backdrop.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
});

// -----------------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------------

// Generar datos simulados y configurar la tabla inicial
generateMockSalesData();
ventasFiltradas = [...todasLasVentas];
aplicarFiltros(); // Aplicar filtro inicial (hoy)
actualizarTabla();
actualizarPaginacion();

// Inicializar iconos de Lucide
lucide.createIcons();