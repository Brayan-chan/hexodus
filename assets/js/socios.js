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
// DATOS SIMULADOS (Reemplazar con llamadas a API)
// -----------------------------------------------------------
const generateMockData = () => {
    const nombres = ['Juan López', 'Andrea González', 'Carlos Ortíz', 'María Rodríguez', 'Luis Martínez', 'Ana Sánchez', 'Pedro García', 'Laura Jiménez', 'Miguel Torres', 'Carmen Ruiz'];
    const apellidos = ['Pérez', 'González', 'Rodríguez', 'García', 'López', 'Martínez', 'Sánchez', 'Jiménez', 'Torres', 'Ruiz'];
    const membresias = ['anual', 'trimestral', 'mensual'];
    const estados = ['activo', 'adeudo', 'proximo', 'expirado'];
    
    for (let i = 1; i <= 345; i++) {
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
        const membresia = membresias[Math.floor(Math.random() * membresias.length)];
        const estado = estados[Math.floor(Math.random() * estados.length)];
        
        todosLosSocios.push({
            id: 1000 + i,
            nombre: `${nombre} ${apellido}`,
            email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
            telefono: `+52 999 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
            membresia: membresia,
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
    const tipoMembresia = document.getElementById('tipo-membresia').value;
    
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
    document.getElementById('tipo-membresia').value = 'todos';
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
                    <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200" title="Ver Perfil">
                        <i data-lucide="eye" class="w-4 h-4"></i>
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
const obtenerInfoMembresia = (tipo) => {
    const info = {
        'anual': { nombre: 'Anual Premium', precio: '$12,000.00 MXN', icon: '💎', bgColor: 'rgba(255, 215, 0, 0.2)', textColor: '#FFD700' },
        'trimestral': { nombre: 'Trimestral', precio: '$3,500.00 MXN', icon: '🔷', bgColor: 'rgba(102, 0, 204, 0.2)', textColor: '#9333EA' },
        'mensual': { nombre: 'Mensual', precio: '$1,400.00 MXN', icon: '🔹', bgColor: 'rgba(0, 191, 255, 0.2)', textColor: 'var(--color-azul-acento)' }
    };
    return info[tipo] || info['mensual'];
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
// EVENT LISTENERS
// -----------------------------------------------------------

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------

// Event listeners para filtros
document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
document.getElementById('buscar').addEventListener('input', aplicarFiltros);
document.getElementById('estatus').addEventListener('change', aplicarFiltros);
document.getElementById('tipo-membresia').addEventListener('change', aplicarFiltros);

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
    const nuevoSocio = {
        id: Math.max(...todosLosSocios.map(s => s.id)) + 1,
        nombre: formData.get('nombre-socio'),
        email: formData.get('correo-socio'),
        telefono: formData.get('telefono-socio') || 'No proporcionado',
        membresia: formData.get('membresia'),
        fechaVencimiento: calcularFechaVencimiento(formData.get('fecha-inicio'), formData.get('membresia')),
        estado: 'activo',
        fechaIngreso: new Date(formData.get('fecha-inicio'))
    };
    
    // Agregar al array de socios
    todosLosSocios.unshift(nuevoSocio);
    aplicarFiltros(); // Refresh tabla con filtros actuales
    
    // Mostrar mensaje de éxito
    mostrarNotificacion('✅ Socio registrado exitosamente', 'success');
    
    closeModal();
});

// Función auxiliar para calcular fecha de vencimiento
const calcularFechaVencimiento = (fechaInicio, tipoMembresia) => {
    const fecha = new Date(fechaInicio);
    switch(tipoMembresia) {
        case 'mensual': fecha.setMonth(fecha.getMonth() + 1); break;
        case 'trimestral': fecha.setMonth(fecha.getMonth() + 3); break;
        case 'anual': fecha.setFullYear(fecha.getFullYear() + 1); break;
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
actualizarTabla();
actualizarPaginacion();

// Inicializar iconos de Lucide
lucide.createIcons();
