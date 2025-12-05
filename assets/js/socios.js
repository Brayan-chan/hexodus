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
let totalSocios = 345;
let sociosFiltrados = [];
let todosLosSocios = []; // Simulated data - replace with API calls

// -----------------------------------------------------------
// INTEGRACIÓN CON SISTEMA DE MEMBRESÍAS
// -----------------------------------------------------------

// Función para cargar membresías disponibles desde el sistema de membresías
const cargarMembresiasSistema = () => {
    // Simular carga desde el sistema de membresías (en producción sería una llamada a API)
    const membresiasSistema = [
        {
            id: 'diaria-estandar',
            nombre: 'Diaria Estándar',
            tipo: 'diaria',
            precio: 50,
            precioOriginal: 50,
            duracion: 1,
            unidad: 'día',
            descripcion: 'Acceso completo por 1 día',
            activa: true
        },
        {
            id: 'semanal-basica',
            nombre: 'Semanal Básica',
            tipo: 'semanal',
            precio: 300,
            precioOriginal: 350,
            duracion: 7,
            unidad: 'días',
            descripcion: 'Acceso semanal básico',
            activa: true,
            oferta: {
                activa: true,
                descuentoPorcentaje: 14.3,
                fechaExpiracion: '2024-12-31'
            }
        },
        {
            id: 'mensual-premium',
            nombre: 'Mensual Premium',
            tipo: 'mensual',
            precio: 1200,
            precioOriginal: 1400,
            duracion: 1,
            unidad: 'mes',
            descripcion: 'Acceso mensual con todos los beneficios',
            activa: true,
            oferta: {
                activa: true,
                descuentoPorcentaje: 14.3,
                fechaExpiracion: '2024-12-31'
            }
        },
        {
            id: 'trimestral-gold',
            nombre: 'Trimestral Gold',
            tipo: 'trimestral',
            precio: 3200,
            precioOriginal: 3500,
            duracion: 3,
            unidad: 'meses',
            descripcion: 'Acceso trimestral con beneficios gold',
            activa: true,
            oferta: {
                activa: true,
                descuentoPorcentaje: 8.6,
                fechaExpiracion: '2024-12-31'
            }
        },
        {
            id: 'anual-platinum',
            nombre: 'Anual Platinum',
            tipo: 'anual',
            precio: 10800,
            precioOriginal: 12000,
            duracion: 12,
            unidad: 'meses',
            descripcion: 'Acceso anual completo con todos los beneficios',
            activa: true,
            oferta: {
                activa: true,
                descuentoPorcentaje: 10,
                fechaExpiracion: '2024-12-31'
            }
        },
        {
            id: 'verano-2024',
            nombre: 'Promoción Verano 2024',
            tipo: 'promocional',
            precio: 2000,
            precioOriginal: 2800,
            duracion: 4,
            unidad: 'meses',
            descripcion: 'Promoción especial de verano',
            activa: true,
            oferta: {
                activa: true,
                descuentoPorcentaje: 28.6,
                fechaExpiracion: '2024-08-31'
            }
        }
    ];
    
    return membresiasSistema.filter(m => m.activa);
};

// Función para popular el select de membresías
// Función para popular el select de filtro de membresías
const popularFiltroMembresias = () => {
    const selectFiltro = document.getElementById('filtro-tipo-membresia');
    const membresiasDisponibles = cargarMembresiasSistema();
    
    // Limpiar opciones existentes (excepto la primera)
    selectFiltro.innerHTML = '<option value="todos">Todos los Tipos</option>';
    
    // Agregar membresías disponibles al filtro
    membresiasDisponibles.forEach(membresia => {
        const option = document.createElement('option');
        option.value = membresia.id;
        const iconos = {
            'diaria': '📅',
            'semanal': '📊', 
            'mensual': '🔹',
            'trimestral': '🔷',
            'anual': '💎',
            'promocional': '🎯'
        };
        option.textContent = `${iconos[membresia.tipo] || '🔹'} ${membresia.nombre}`;
        selectFiltro.appendChild(option);
    });
};
const mostrarDetallesMembresia = (membresiaId) => {
    const selectMembresias = document.getElementById('tipo-membresia');
    const selectedOption = selectMembresias.querySelector(`option[value="${membresiaId}"]`);
    const detailsContainer = document.getElementById('membresia-details');
    
    if (!selectedOption || !selectedOption.dataset.membresiaData) {
        detailsContainer.classList.add('hidden');
        return;
    }
    
    const membresia = JSON.parse(selectedOption.dataset.membresiaData);
    
    // Actualizar elementos de detalles
    document.getElementById('precio-original').textContent = `$${membresia.precioOriginal.toLocaleString()} MXN`;
    document.getElementById('precio-final').textContent = `$${membresia.precio.toLocaleString()} MXN`;
    document.getElementById('duracion').textContent = `${membresia.duracion} ${membresia.unidad}`;
    
    // Mostrar información de oferta si existe
    const ofertaInfo = document.getElementById('oferta-info');
    if (membresia.oferta && membresia.oferta.activa) {
        document.getElementById('descuento').textContent = `${membresia.oferta.descuentoPorcentaje.toFixed(1)}% OFF`;
        ofertaInfo.classList.remove('hidden');
    } else {
        ofertaInfo.classList.add('hidden');
    }
    
    detailsContainer.classList.remove('hidden');
};

// Event listener para cambio de membresía
document.addEventListener('DOMContentLoaded', () => {
    const selectMembresias = document.getElementById('tipo-membresia');
    if (selectMembresias) {
        selectMembresias.addEventListener('change', (e) => {
            mostrarDetallesMembresia(e.target.value);
        });
    }
});

// -----------------------------------------------------------
// DATOS SIMULADOS ACTUALIZADOS CON NUEVAS MEMBRESÍAS
// -----------------------------------------------------------
const generateMockData = () => {
    const nombres = ['Juan López', 'Andrea González', 'Carlos Ortíz', 'María Rodríguez', 'Luis Martínez', 'Ana Sánchez', 'Pedro García', 'Laura Jiménez', 'Miguel Torres', 'Carmen Ruiz'];
    const apellidos = ['Pérez', 'González', 'Rodríguez', 'García', 'López', 'Martínez', 'Sánchez', 'Jiménez', 'Torres', 'Ruiz'];
    const membresiasIds = ['diaria-estandar', 'semanal-basica', 'mensual-premium', 'trimestral-gold', 'anual-platinum', 'verano-2024'];
    const estados = ['activo', 'adeudo', 'proximo', 'expirado'];
    
    for (let i = 1; i <= 345; i++) {
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
        const membresiaId = membresiasIds[Math.floor(Math.random() * membresiasIds.length)];
        const estado = estados[Math.floor(Math.random() * estados.length)];
        
        // Obtener información de la membresía
        const membresiasDisponibles = cargarMembresiasSistema();
        const membresiaInfo = membresiasDisponibles.find(m => m.id === membresiaId) || membresiasDisponibles[0];
        
        todosLosSocios.push({
            id: 1000 + i,
            nombre: `${nombre} ${apellido}`,
            email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
            telefono: `+52 999 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
            membresia: membresiaId,
            membresiaInfo: membresiaInfo,
            fechaVencimiento: new Date(Date.now() + (Math.random() * 365 * 24 * 60 * 60 * 1000)),
            estado: estado,
            fechaIngreso: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000))
        });
    }
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(sociosFiltrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, sociosFiltrados.length);
    
    // Actualizar información de registros
    document.getElementById('registros-inicio').textContent = inicio;
    document.getElementById('registros-fin').textContent = fin;
    document.getElementById('total-registros').textContent = sociosFiltrados.length;
    document.getElementById('total-socios').textContent = `${sociosFiltrados.length} socios`;
    
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
    const estatusFiltro = document.getElementById('estatus').value;
    const tipoMembresia = document.getElementById('filtro-tipo-membresia').value;
    
    sociosFiltrados = todosLosSocios.filter(socio => {
        // Filtro de búsqueda
        const coincideBusqueda = !busqueda || 
            socio.nombre.toLowerCase().includes(busqueda) ||
            socio.email.toLowerCase().includes(busqueda) ||
            socio.id.toString().includes(busqueda);
        
        // Filtro de estatus
        const coincidenEstatus = estatusFiltro === 'todos' || socio.estado === estatusFiltro;
        
        // Filtro de tipo de membresía
        const coincideTipoMembresia = tipoMembresia === 'todos' || socio.membresia === tipoMembresia;
        
        return coincideBusqueda && coincidenEstatus && coincideTipoMembresia;
    });
    
    paginaActual = 1; // Reset a la primera página
    actualizarTabla();
    actualizarPaginacion();
};

const limpiarFiltros = () => {
    document.getElementById('buscar').value = '';
    document.getElementById('estatus').value = 'todos';
    document.getElementById('filtro-tipo-membresia').value = 'todos';
    sociosFiltrados = [...todosLosSocios];
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
};

// -----------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR LA TABLA
// -----------------------------------------------------------
const actualizarTabla = () => {
    const tbody = document.getElementById('tabla-socios-body');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const sociosPagina = sociosFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = sociosPagina.map(socio => generarFilaSocio(socio)).join('');
    
    // Re-inicializar iconos de Lucide para las nuevas filas
    lucide.createIcons();
};

const generarFilaSocio = (socio) => {
    const membresiaInfo = obtenerInfoMembresia(socio.membresia);
    const estadoInfo = obtenerInfoEstado(socio.estado);
    const fechaFormateada = socio.fechaVencimiento.toLocaleDateString('es-ES');
    const diasRestantes = Math.ceil((socio.fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
        <tr class="hover:bg-gray-700 transition duration-200 cursor-pointer">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center" style="background-color: ${estadoInfo.bgColor};">
                            <span class="text-sm font-bold" style="color: ${estadoInfo.textColor};">#${socio.id}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-semibold text-white">${socio.nombre}</div>
                    <div class="text-xs text-gray-400">Miembro desde: ${socio.fechaIngreso.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div>
                    <div class="text-white">📧 ${socio.email}</div>
                    <div class="text-gray-400">📱 ${socio.telefono}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style="background-color: ${membresiaInfo.bgColor}; color: ${membresiaInfo.textColor};">${membresiaInfo.icon} ${membresiaInfo.nombre}</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">${membresiaInfo.precio}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="${diasRestantes < 0 ? 'text-red-400' : diasRestantes < 30 ? 'text-yellow-400' : 'text-green-400'} font-semibold">${fechaFormateada}</div>
                <div class="text-xs ${diasRestantes < 0 ? 'text-red-400' : diasRestantes < 30 ? 'text-yellow-400' : 'text-gray-400'}">${diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : `En ${diasRestantes} días`}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" style="background-color: ${estadoInfo.bgColor}; color: ${estadoInfo.textColor};">${estadoInfo.icon} ${estadoInfo.nombre}</span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex items-center justify-center space-x-2">
                    <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200 btn-ver-perfil" title="Ver Perfil" data-socio-id="${socio.id}">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition duration-200 btn-gestionar-membresias" title="Gestionar Membresías" data-socio-id="${socio.id}">
                        <i data-lucide="credit-card" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition duration-200" title="Editar Socio">
                        <i data-lucide="square-pen" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition duration-200" title="Eliminar">
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
const obtenerInfoMembresia = (membresiaId) => {
    const membresiasDisponibles = cargarMembresiasSistema();
    const membresia = membresiasDisponibles.find(m => m.id === membresiaId);
    
    if (!membresia) {
        return { 
            nombre: 'No Asignada', 
            precio: '$0.00 MXN', 
            icon: '❓', 
            bgColor: 'rgba(128, 128, 128, 0.2)', 
            textColor: '#808080' 
        };
    }
    
    // Mapeo de iconos por tipo de membresía
    const iconos = {
        'diaria': '📅',
        'semanal': '📊',
        'mensual': '🔹',
        'trimestral': '🔷',
        'anual': '💎',
        'promocional': '🎯'
    };
    
    // Mapeo de colores por tipo
    const colores = {
        'diaria': { bgColor: 'rgba(139, 69, 19, 0.2)', textColor: '#8B4513' },
        'semanal': { bgColor: 'rgba(34, 197, 94, 0.2)', textColor: '#22C55E' },
        'mensual': { bgColor: 'rgba(0, 191, 255, 0.2)', textColor: 'var(--color-azul-acento)' },
        'trimestral': { bgColor: 'rgba(102, 0, 204, 0.2)', textColor: '#9333EA' },
        'anual': { bgColor: 'rgba(255, 215, 0, 0.2)', textColor: '#FFD700' },
        'promocional': { bgColor: 'rgba(239, 68, 68, 0.2)', textColor: '#EF4444' }
    };
    
    const tipoColor = colores[membresia.tipo] || colores['mensual'];
    
    return {
        nombre: membresia.nombre,
        precio: `$${membresia.precio.toLocaleString()} MXN`,
        icon: iconos[membresia.tipo] || '🔹',
        bgColor: tipoColor.bgColor,
        textColor: tipoColor.textColor,
        tipo: membresia.tipo,
        duracion: membresia.duracion,
        unidad: membresia.unidad,
        oferta: membresia.oferta
    };
};

const obtenerInfoEstado = (estado) => {
    const info = {
        'activo': { nombre: 'Al Corriente', icon: '✅', bgColor: 'rgba(75, 181, 67, 0.2)', textColor: 'var(--color-exito)' },
        'adeudo': { nombre: 'Adeudo', icon: '⚠️', bgColor: 'rgba(255, 0, 0, 0.2)', textColor: 'var(--color-peligro)' },
        'proximo': { nombre: 'Próx. Venc.', icon: '🔔', bgColor: 'rgba(255, 215, 0, 0.2)', textColor: 'var(--color-alerta)' },
        'expirado': { nombre: 'Expirado', icon: '❌', bgColor: 'rgba(128, 128, 128, 0.2)', textColor: '#808080' }
    };
    return info[estado] || info['activo'];
};

// -----------------------------------------------------------
// SISTEMA DE GESTIÓN DE PAGOS DE MEMBRESÍAS
// -----------------------------------------------------------

// Variables globales para gestión de pagos
let socioSeleccionado = null;
let membresiaSeleccionadaPago = null;

// Función para generar datos de pagos simulados
const generarDatosPagosSimulados = (socioId) => {
    const socio = todosLosSocios.find(s => s.id === socioId);
    if (!socio) return [];

    // Generar historial de membresías y pagos
    const historialMembresias = [];
    const fechaIngreso = new Date(socio.fechaIngreso);
    
    // Agregar membresía actual
    historialMembresias.push({
        id: `mem_${socioId}_1`,
        socioId: socioId,
        membresiaId: socio.membresia,
        membresiaInfo: socio.membresiaInfo,
        fechaInicio: fechaIngreso,
        fechaVencimiento: socio.fechaVencimiento,
        precio: socio.membresiaInfo.precio,
        estado: socio.estado,
        pagos: generarPagosMembresia(socioId, socio.membresiaInfo.precio, fechaIngreso)
    });

    // Agregar membresías anteriores simuladas (si tiene más de 6 meses)
    if (Date.now() - fechaIngreso.getTime() > 6 * 30 * 24 * 60 * 60 * 1000) {
        const fechaAnterior = new Date(fechaIngreso);
        fechaAnterior.setMonth(fechaAnterior.getMonth() - 3);
        
        historialMembresias.unshift({
            id: `mem_${socioId}_2`,
            socioId: socioId,
            membresiaId: 'mensual-premium',
            membresiaInfo: cargarMembresiasSistema().find(m => m.id === 'mensual-premium'),
            fechaInicio: fechaAnterior,
            fechaVencimiento: new Date(fechaAnterior.getTime()),
            precio: 1200,
            estado: 'pagada',
            pagos: generarPagosMembresia(socioId, 1200, fechaAnterior, true)
        });
    }

    return historialMembresias;
};

// Función para generar pagos de una membresía específica
const generarPagosMembresia = (socioId, precio, fechaMembresia, completo = false) => {
    const pagos = [];
    
    if (completo || Math.random() > 0.3) {
        pagos.push({
            id: `pago_${socioId}_${Date.now()}`,
            fecha: fechaMembresia,
            importe: precio,
            folio: `F${Math.floor(Math.random() * 10000)}`,
            tipo: ['efectivo', 'tarjeta', 'transferencia'][Math.floor(Math.random() * 3)],
            observaciones: completo ? 'Pago completo' : 'Pago registrado'
        });
    }
    
    return pagos;
};

// Función para abrir modal de gestión de membresías
const abrirModalGestionMembresias = (socioId) => {
    socioSeleccionado = todosLosSocios.find(s => s.id === parseInt(socioId));
    if (!socioSeleccionado) return;

    // Actualizar información del socio
    document.getElementById('socio-nombre').textContent = socioSeleccionado.nombre;
    document.getElementById('socio-id').textContent = socioSeleccionado.id;

    // Actualizar información de membresía actual
    const membresiaActual = socioSeleccionado.membresiaInfo;
    document.getElementById('tipo-actual').textContent = membresiaActual.nombre;
    document.getElementById('precio-actual').textContent = `$${membresiaActual.precio.toLocaleString()} MXN`;
    document.getElementById('vencimiento-actual').textContent = socioSeleccionado.fechaVencimiento.toLocaleDateString('es-ES');
    
    const estadoInfo = obtenerInfoEstado(socioSeleccionado.estado);
    const estadoElement = document.getElementById('estado-actual');
    estadoElement.textContent = estadoInfo.nombre;
    estadoElement.style.color = estadoInfo.textColor;

    // Cargar historial de membresías
    cargarHistorialMembresias(socioId);

    // Mostrar modal
    document.getElementById('modal-gestionar-membresias').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

// Función para cargar historial de membresías en la tabla
const cargarHistorialMembresias = (socioId) => {
    const tbody = document.getElementById('historial-membresias-body');
    const historial = generarDatosPagosSimulados(socioId);
    
    tbody.innerHTML = historial.map(membresia => {
        const totalPagado = membresia.pagos.reduce((sum, pago) => sum + pago.importe, 0);
        const estadoPago = totalPagado >= membresia.precio ? 'Pagada' : totalPagado > 0 ? 'Parcial' : 'Sin pagar';
        const colorEstado = estadoPago === 'Pagada' ? 'text-green-400' : estadoPago === 'Parcial' ? 'text-yellow-400' : 'text-red-400';
        
        return `
            <tr class="hover:bg-gray-800 transition duration-200">
                <td class="px-4 py-3 text-sm text-white">${membresia.fechaInicio.toLocaleDateString('es-ES')}</td>
                <td class="px-4 py-3 text-sm">
                    <div class="text-white font-semibold">${membresia.membresiaInfo.nombre}</div>
                    <div class="text-xs text-gray-400">${membresia.membresiaInfo.duracion} ${membresia.membresiaInfo.unidad}</div>
                </td>
                <td class="px-4 py-3 text-sm text-green-400 font-semibold">$${membresia.precio.toLocaleString()} MXN</td>
                <td class="px-4 py-3 text-sm">
                    <div class="${colorEstado} font-semibold">${estadoPago}</div>
                    <div class="text-xs text-gray-400">$${totalPagado.toLocaleString()} / $${membresia.precio.toLocaleString()}</div>
                </td>
                <td class="px-4 py-3 text-sm text-white">${membresia.fechaVencimiento.toLocaleDateString('es-ES')}</td>
                <td class="px-4 py-3 text-center">
                    <button class="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition duration-200 btn-pagar-membresia" 
                            title="Gestionar Pagos" data-membresia-id="${membresia.id}">
                        <i data-lucide="dollar-sign" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Re-inicializar iconos
    lucide.createIcons();
};

// Función para abrir modal de registrar pago
const abrirModalRegistrarPago = (membresiaId) => {
    const historial = generarDatosPagosSimulados(socioSeleccionado.id);
    membresiaSeleccionadaPago = historial.find(m => m.id === membresiaId);
    
    if (!membresiaSeleccionadaPago) return;

    // Actualizar información de la membresía
    document.getElementById('pago-fecha').textContent = membresiaSeleccionadaPago.fechaInicio.toLocaleDateString('es-ES');
    document.getElementById('pago-precio').textContent = `$${membresiaSeleccionadaPago.precio.toLocaleString()} MXN`;
    
    const totalPagado = membresiaSeleccionadaPago.pagos.reduce((sum, pago) => sum + pago.importe, 0);
    document.getElementById('pago-total-pagado').textContent = `$${totalPagado.toLocaleString()} MXN`;
    
    // Actualizar estado de pago
    const estadoPagoDisplay = document.getElementById('estado-pago-display');
    if (totalPagado >= membresiaSeleccionadaPago.precio) {
        estadoPagoDisplay.className = 'mt-3 p-2 rounded text-center bg-green-600/20 text-green-400';
        estadoPagoDisplay.innerHTML = '<span class="font-semibold">✅ Pagada</span>';
    } else if (totalPagado > 0) {
        estadoPagoDisplay.className = 'mt-3 p-2 rounded text-center bg-yellow-600/20 text-yellow-400';
        estadoPagoDisplay.innerHTML = '<span class="font-semibold">⚠️ Pago Parcial</span>';
    } else {
        estadoPagoDisplay.className = 'mt-3 p-2 rounded text-center bg-red-600/20 text-red-400';
        estadoPagoDisplay.innerHTML = '<span class="font-semibold">❌ Sin pagar</span>';
    }

    // Cargar historial de pagos
    cargarHistorialPagosMembresia();

    // Mostrar modal
    document.getElementById('modal-registrar-pago').classList.remove('hidden');
};

// Función para cargar historial de pagos de una membresía específica
const cargarHistorialPagosMembresia = () => {
    const tbody = document.getElementById('historial-pagos-membresia');
    
    tbody.innerHTML = membresiaSeleccionadaPago.pagos.map((pago, index) => `
        <tr>
            <td class="py-2 text-white">${index + 1}</td>
            <td class="py-2 text-gray-300">${pago.folio}</td>
            <td class="py-2 text-green-400 font-semibold">$${pago.importe.toLocaleString()}</td>
            <td class="py-2 text-center">
                <button class="p-1 text-red-400 hover:bg-red-400/10 rounded" title="Eliminar pago">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
};

// Función para registrar un nuevo pago
const registrarNuevoPago = (formData) => {
    const nuevoPago = {
        id: `pago_${socioSeleccionado.id}_${Date.now()}`,
        fecha: new Date(),
        importe: parseFloat(formData.get('importe-pago')),
        folio: formData.get('folio-pago') || `F${Math.floor(Math.random() * 10000)}`,
        tipo: formData.get('tipo-pago'),
        observaciones: formData.get('observacion-pago') || ''
    };

    // Agregar el pago a la membresía
    membresiaSeleccionadaPago.pagos.push(nuevoPago);

    // Actualizar estado del socio
    const totalPagado = membresiaSeleccionadaPago.pagos.reduce((sum, pago) => sum + pago.importe, 0);
    if (totalPagado >= membresiaSeleccionadaPago.precio) {
        socioSeleccionado.estado = 'activo';
    }

    // Refrescar vistas
    cargarHistorialPagosMembresia();
    cargarHistorialMembresias(socioSeleccionado.id);
    aplicarFiltros(); // Refrescar tabla principal
    
    // Limpiar formulario
    document.getElementById('form-registrar-pago').reset();
    
    // Mostrar notificación
    mostrarNotificacion(`✅ Pago de $${nuevoPago.importe.toLocaleString()} registrado exitosamente`, 'success');
};

// Función para agregar nueva membresía a un socio
const agregarNuevaMembresia = (formData) => {
    const membresiaId = formData.get('nueva-membresia-tipo');
    const fechaInicio = new Date(formData.get('nueva-fecha-inicio'));
    const membresiaInfo = cargarMembresiasSistema().find(m => m.id === membresiaId);
    
    if (!membresiaInfo) {
        mostrarNotificacion('❌ Error: Membresía no válida', 'error');
        return;
    }

    const fechaVencimiento = calcularFechaVencimiento(fechaInicio, membresiaInfo);

    // Actualizar información del socio
    socioSeleccionado.membresia = membresiaId;
    socioSeleccionado.membresiaInfo = membresiaInfo;
    socioSeleccionado.fechaVencimiento = fechaVencimiento;
    socioSeleccionado.estado = 'adeudo'; // Nueva membresía sin pagar

    // Refrescar vistas
    abrirModalGestionMembresias(socioSeleccionado.id);
    aplicarFiltros(); // Refrescar tabla principal
    
    // Cerrar modal
    document.getElementById('modal-agregar-membresia-socio').classList.add('hidden');
    
    // Mostrar notificación
    mostrarNotificacion(`✅ Nueva membresía ${membresiaInfo.nombre} agregada`, 'success');
};

// -----------------------------------------------------------
// EVENT LISTENERS PARA GESTIÓN DE PAGOS
// -----------------------------------------------------------

// Event listeners para filtros
document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
document.getElementById('buscar').addEventListener('input', aplicarFiltros);
document.getElementById('estatus').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-tipo-membresia').addEventListener('change', aplicarFiltros);

// Event listeners para paginación
document.getElementById('btn-primera-pagina').addEventListener('click', () => cambiarPagina(1));
document.getElementById('btn-pagina-anterior').addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
document.getElementById('btn-pagina-siguiente').addEventListener('click', () => {
    const totalPaginas = Math.ceil(sociosFiltrados.length / registrosPorPagina);
    cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
});
document.getElementById('btn-ultima-pagina').addEventListener('click', () => {
    const totalPaginas = Math.ceil(sociosFiltrados.length / registrosPorPagina);
    cambiarPagina(totalPaginas);
});

// Event listener para cambiar registros por página
document.getElementById('registros-por-pagina').addEventListener('change', (e) => {
    registrosPorPagina = parseInt(e.target.value);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
});

// Event listeners para gestión de pagos y membresías
document.addEventListener('click', (e) => {
    // Gestionar membresías
    if (e.target.closest('.btn-gestionar-membresias')) {
        const socioId = e.target.closest('.btn-gestionar-membresias').dataset.socioId;
        abrirModalGestionMembresias(socioId);
    }
    
    // Pagar membresía específica
    if (e.target.closest('.btn-pagar-membresia')) {
        const membresiaId = e.target.closest('.btn-pagar-membresia').dataset.membresiaId;
        abrirModalRegistrarPago(membresiaId);
    }
});

// Event listeners para modales de gestión de membresías
document.getElementById('btn-cerrar-modal-membresias').addEventListener('click', () => {
    document.getElementById('modal-gestionar-membresias').classList.add('hidden');
    document.body.style.overflow = '';
});

document.getElementById('btn-agregar-membresia').addEventListener('click', () => {
    popularSelectMembresias('nueva-membresia-tipo');
    document.getElementById('modal-agregar-membresia-socio').classList.remove('hidden');
});

document.getElementById('btn-registrar-pago').addEventListener('click', () => {
    if (socioSeleccionado) {
        const membresiaActual = generarDatosPagosSimulados(socioSeleccionado.id)[0];
        abrirModalRegistrarPago(membresiaActual.id);
    }
});

// Event listeners para modal de registrar pago
document.getElementById('btn-cerrar-modal-pago').addEventListener('click', () => {
    document.getElementById('modal-registrar-pago').classList.add('hidden');
});

document.getElementById('btn-cancelar-pago').addEventListener('click', () => {
    document.getElementById('modal-registrar-pago').classList.add('hidden');
});

document.getElementById('form-registrar-pago').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    registrarNuevoPago(formData);
});

// Event listeners para modal de agregar membresía
document.getElementById('btn-cerrar-modal-agregar-membresia').addEventListener('click', () => {
    document.getElementById('modal-agregar-membresia-socio').classList.add('hidden');
});

document.getElementById('btn-cancelar-nueva-membresia').addEventListener('click', () => {
    document.getElementById('modal-agregar-membresia-socio').classList.add('hidden');
});

document.getElementById('nueva-membresia-tipo').addEventListener('change', (e) => {
    const membresiaId = e.target.value;
    if (membresiaId) {
        mostrarDetallesNuevaMembresia(membresiaId);
        calcularFechaVencimientoNuevaMembresia();
    } else {
        document.getElementById('nueva-membresia-details').classList.add('hidden');
    }
});

document.getElementById('nueva-fecha-inicio').addEventListener('change', () => {
    calcularFechaVencimientoNuevaMembresia();
});

document.getElementById('form-agregar-membresia-socio').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    agregarNuevaMembresia(formData);
});

// Función auxiliar para mostrar detalles de nueva membresía
const mostrarDetallesNuevaMembresia = (membresiaId) => {
    const membresiasDisponibles = cargarMembresiasSistema();
    const membresia = membresiasDisponibles.find(m => m.id === membresiaId);
    
    if (!membresia) return;
    
    document.getElementById('nueva-precio-original').textContent = `$${membresia.precioOriginal.toLocaleString()} MXN`;
    document.getElementById('nueva-precio-final').textContent = `$${membresia.precio.toLocaleString()} MXN`;
    document.getElementById('nueva-duracion').textContent = `${membresia.duracion} ${membresia.unidad}`;
    
    // Mostrar información de oferta si existe
    const ofertaInfo = document.getElementById('nueva-oferta-info');
    if (membresia.oferta && membresia.oferta.activa) {
        document.getElementById('nuevo-descuento').textContent = `${membresia.oferta.descuentoPorcentaje.toFixed(1)}% OFF`;
        ofertaInfo.classList.remove('hidden');
    } else {
        ofertaInfo.classList.add('hidden');
    }
    
    document.getElementById('nueva-membresia-details').classList.remove('hidden');
};

// Función auxiliar para calcular fecha de vencimiento en nueva membresía
const calcularFechaVencimientoNuevaMembresia = () => {
    const fechaInicioInput = document.getElementById('nueva-fecha-inicio').value;
    const membresiaId = document.getElementById('nueva-membresia-tipo').value;
    
    if (!fechaInicioInput || !membresiaId) return;
    
    const membresia = cargarMembresiasSistema().find(m => m.id === membresiaId);
    if (!membresia) return;
    
    const fechaVencimiento = calcularFechaVencimiento(fechaInicioInput, membresia);
    document.getElementById('nueva-fecha-vencimiento').textContent = fechaVencimiento.toLocaleDateString('es-ES');
};

// Función auxiliar para popular select de membresías (reutilizable)
const popularSelectMembresias = (selectId = 'tipo-membresia') => {
    const selectMembresias = document.getElementById(selectId);
    const membresiasDisponibles = cargarMembresiasSistema();
    
    // Limpiar opciones existentes (excepto la primera)
    selectMembresias.innerHTML = '<option value="">Seleccionar membresía</option>';
    
    // Agregar membresías disponibles
    membresiasDisponibles.forEach(membresia => {
        const option = document.createElement('option');
        option.value = membresia.id;
        option.textContent = `${membresia.nombre} ($${membresia.precio.toLocaleString()} MXN)`;
        option.dataset.membresiaData = JSON.stringify(membresia);
        selectMembresias.appendChild(option);
    });
};

// Lógica para mostrar y ocultar el modal (RF12)
const modal = document.getElementById('modal-agregar-socio');
const btnAgregar = document.getElementById('btn-agregar-socio');
const btnCerrar = document.getElementById('btn-cerrar-modal');
const btnCancelar = document.getElementById('btn-cancelar-registro');
const formNuevoSocio = document.getElementById('form-nuevo-socio');

btnAgregar.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Set fecha actual como default
    document.getElementById('fecha-inicio').value = new Date().toISOString().split('T')[0];
});

const closeModal = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    formNuevoSocio.reset();
};

btnCerrar.addEventListener('click', closeModal);
btnCancelar.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Validación y envío del formulario
formNuevoSocio.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(formNuevoSocio);
    const membresiaId = formData.get('tipo-membresia');
    const membresiaInfo = cargarMembresiasSistema().find(m => m.id === membresiaId);
    
    if (!membresiaInfo) {
        mostrarNotificacion('❌ Error: Membresía no válida', 'error');
        return;
    }
    
    const nuevoSocio = {
        id: Math.max(...todosLosSocios.map(s => s.id)) + 1,
        nombre: formData.get('nombre-socio'),
        email: formData.get('correo-socio'),
        telefono: formData.get('telefono-socio') || 'No proporcionado',
        membresia: membresiaId,
        membresiaInfo: membresiaInfo,
        fechaVencimiento: calcularFechaVencimiento(formData.get('fecha-inicio'), membresiaInfo),
        estado: 'activo',
        fechaIngreso: new Date(formData.get('fecha-inicio'))
    };
    
    // Agregar al array de socios
    todosLosSocios.unshift(nuevoSocio);
    aplicarFiltros(); // Refresh tabla con filtros actuales
    
    // Mostrar mensaje de éxito
    mostrarNotificacion(`✅ Socio registrado con membresía ${membresiaInfo.nombre}`, 'success');
    
    closeModal();
});

// Función auxiliar para calcular fecha de vencimiento basada en la membresía
const calcularFechaVencimiento = (fechaInicio, membresiaInfo) => {
    const fecha = new Date(fechaInicio);
    
    switch(membresiaInfo.unidad) {
        case 'día':
        case 'días':
            fecha.setDate(fecha.getDate() + membresiaInfo.duracion);
            break;
        case 'mes':
        case 'meses':
            fecha.setMonth(fecha.getMonth() + membresiaInfo.duracion);
            break;
        case 'año':
        case 'años':
            fecha.setFullYear(fecha.getFullYear() + membresiaInfo.duracion);
            break;
        default:
            // Por defecto, agregar los días especificados
            fecha.setDate(fecha.getDate() + membresiaInfo.duracion);
    }
    
    return fecha;
};

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
generateMockData();
sociosFiltrados = [...todosLosSocios];

// Cargar membresías en el formulario de registro y filtros
popularSelectMembresias('tipo-membresia');
popularFiltroMembresias();

// Actualizar tabla y paginación
actualizarTabla();
actualizarPaginacion();

// Inicializar iconos de Lucide
lucide.createIcons();
