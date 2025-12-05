// ================================================
// MEMBRESIAS.JS - GESTIÓN DE MEMBRESÍAS HEXODUS
// Sistema avanzado de gestión de tipos de membresías
// ================================================

// Función para actualizar la hora en el encabezado
const actualizarFechaHora = () => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    document.getElementById('fecha-hora-header').textContent = `Admin. | ${fecha} | ${hora}`;
};
setInterval(actualizarFechaHora, 60000);
actualizarFechaHora();

// -----------------------------------------------------------
// VARIABLES GLOBALES
// -----------------------------------------------------------
let paginaActual = 1;
let registrosPorPagina = 25;
let membresiasFiltradas = [];
let todasLasMembresias = [];
let modoEdicion = false;
let membresiaEditando = null;

// -----------------------------------------------------------
// DATOS SIMULADOS DE MEMBRESÍAS
// -----------------------------------------------------------
const generateMockMembresiaData = () => {
    const membresiasTipo = [
        {
            id: 1,
            nombre: 'Mensual Básica',
            precio: 800.00,
            tipo: 'mensual',
            duracion: { cantidad: 1, unidad: 'meses' },
            descripcion: 'Acceso completo al gimnasio por 30 días',
            activa: true,
            esOferta: false,
            fechaCreacion: new Date('2025-01-15'),
            sociosActivos: 45
        },
        {
            id: 2,
            nombre: 'Mensual VIP',
            precio: 1400.00,
            tipo: 'mensual',
            duracion: { cantidad: 1, unidad: 'meses' },
            descripcion: 'Acceso completo + clases grupales + entrenador personal 2 sesiones',
            activa: true,
            esOferta: false,
            fechaCreacion: new Date('2025-01-15'),
            sociosActivos: 23
        },
        {
            id: 3,
            nombre: 'Trimestral Premium',
            precio: 3500.00,
            tipo: 'mensual',
            duracion: { cantidad: 3, unidad: 'meses' },
            descripcion: 'Pago trimestral con descuento del 15%',
            activa: true,
            esOferta: false,
            fechaCreacion: new Date('2025-01-20'),
            sociosActivos: 67
        },
        {
            id: 4,
            nombre: 'Anual Gold',
            precio: 12000.00,
            tipo: 'anual',
            duracion: { cantidad: 1, unidad: 'anos' },
            descripcion: 'Membresía anual con todos los beneficios y descuentos especiales',
            activa: true,
            esOferta: false,
            fechaCreacion: new Date('2025-01-10'),
            sociosActivos: 89
        },
        {
            id: 5,
            nombre: 'Pase Diario',
            precio: 50.00,
            tipo: 'dias',
            duracion: { cantidad: 1, unidad: 'dias' },
            descripcion: 'Acceso por un día completo al gimnasio',
            activa: true,
            esOferta: false,
            fechaCreacion: new Date('2025-02-01'),
            sociosActivos: 12
        },
        {
            id: 6,
            nombre: 'Semanal Student',
            precio: 300.00,
            tipo: 'semanal',
            duracion: { cantidad: 1, unidad: 'semanas' },
            descripcion: 'Membresía semanal especial para estudiantes',
            activa: true,
            esOferta: true,
            precioOriginal: 400.00,
            fechaVencimientoOferta: new Date('2025-12-31'),
            fechaCreacion: new Date('2025-03-01'),
            sociosActivos: 34
        },
        {
            id: 7,
            nombre: 'Oferta Verano 2025',
            precio: 2500.00,
            tipo: 'temporada',
            duracion: { cantidad: 4, unidad: 'meses' },
            descripcion: 'Promoción especial de verano - 4 meses por precio de 3',
            activa: true,
            esOferta: true,
            precioOriginal: 3200.00,
            fechaVencimientoOferta: new Date('2025-08-31'),
            fechaCreacion: new Date('2025-05-01'),
            sociosActivos: 78
        },
        {
            id: 8,
            nombre: 'Plan Familiar',
            precio: 2800.00,
            tipo: 'mensual',
            duracion: { cantidad: 1, unidad: 'meses' },
            descripcion: 'Membresía familiar hasta 4 personas',
            activa: false,
            esOferta: false,
            fechaCreacion: new Date('2024-12-01'),
            sociosActivos: 0
        }
    ];

    todasLasMembresias = membresiasTipo;
    actualizarKPIs();
};

// -----------------------------------------------------------
// FUNCIONES DE KPIs
// -----------------------------------------------------------
const actualizarKPIs = () => {
    const tiposActivos = todasLasMembresias.filter(m => m.activa).length;
    const totalSociosActivos = todasLasMembresias.reduce((sum, m) => sum + m.sociosActivos, 0);
    const ingresosMensualesEstimados = calcularIngresosMensuales();
    const proximosVencimientos = contarVencimientosProximos();

    document.getElementById('kpi-tipos-membresias').textContent = tiposActivos;
    document.getElementById('kpi-membresias-activas').textContent = totalSociosActivos;
    document.getElementById('kpi-ingresos-mensuales').textContent = `$${ingresosMensualesEstimados.toLocaleString()}`;
    document.getElementById('kpi-proximos-vencimientos').textContent = proximosVencimientos;
};

const calcularIngresosMensuales = () => {
    return todasLasMembresias.reduce((total, m) => {
        if (!m.activa) return total;
        let ingresoMensual = 0;
        
        switch(m.tipo) {
            case 'dias':
                ingresoMensual = m.precio * m.sociosActivos * 30; // Estimado diario
                break;
            case 'semanal':
                ingresoMensual = m.precio * m.sociosActivos * 4; // 4 semanas
                break;
            case 'mensual':
                ingresoMensual = m.precio * m.sociosActivos;
                break;
            case 'anual':
                ingresoMensual = (m.precio / 12) * m.sociosActivos;
                break;
            case 'temporada':
                ingresoMensual = (m.precio / (m.duracion.cantidad || 1)) * m.sociosActivos;
                break;
        }
        return total + ingresoMensual;
    }, 0);
};

const contarVencimientosProximos = () => {
    // Simulación de vencimientos próximos
    return 23;
};

// -----------------------------------------------------------
// FUNCIONES DE FILTRADO Y PAGINACIÓN
// -----------------------------------------------------------
const aplicarFiltros = () => {
    const busqueda = document.getElementById('buscar-membresia').value.toLowerCase().trim();
    const tipoFiltro = document.getElementById('filtro-tipo').value;
    const estadoFiltro = document.getElementById('filtro-estado').value;
    const precioMin = parseFloat(document.getElementById('precio-min').value) || 0;
    const precioMax = parseFloat(document.getElementById('precio-max').value) || Infinity;
    
    membresiasFiltradas = todasLasMembresias.filter(membresia => {
        const coincideBusqueda = !busqueda || 
            membresia.nombre.toLowerCase().includes(busqueda) ||
            membresia.descripcion.toLowerCase().includes(busqueda);
        
        const coincideTipo = tipoFiltro === 'todos' || membresia.tipo === tipoFiltro;
        
        let coincideEstado = true;
        switch(estadoFiltro) {
            case 'activa':
                coincideEstado = membresia.activa;
                break;
            case 'inactiva':
                coincideEstado = !membresia.activa;
                break;
            case 'oferta':
                coincideEstado = membresia.esOferta;
                break;
        }
        
        const coincidePrecio = membresia.precio >= precioMin && membresia.precio <= precioMax;
        
        return coincideBusqueda && coincideTipo && coincideEstado && coincidePrecio;
    });
    
    paginaActual = 1;
    actualizarGrid();
    actualizarPaginacion();
};

const limpiarFiltros = () => {
    document.getElementById('buscar-membresia').value = '';
    document.getElementById('filtro-tipo').value = 'todos';
    document.getElementById('filtro-estado').value = 'todos';
    document.getElementById('precio-min').value = '';
    document.getElementById('precio-max').value = '';
    
    membresiasFiltradas = [...todasLasMembresias];
    paginaActual = 1;
    actualizarGrid();
    actualizarPaginacion();
};

// -----------------------------------------------------------
// FUNCIONES DE RENDERIZADO
// -----------------------------------------------------------
const actualizarGrid = () => {
    const grid = document.getElementById('grid-membresias');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const membresiasPagina = membresiasFiltradas.slice(inicio, fin);
    
    grid.innerHTML = membresiasPagina.map(membresia => generarTarjetaMembresia(membresia)).join('');
    
    // Re-inicializar iconos de Lucide
    lucide.createIcons();
};

const generarTarjetaMembresia = (membresia) => {
    const tipoInfo = obtenerInfoTipo(membresia.tipo);
    const duracionTexto = generarTexturaDuracion(membresia.duracion);
    const estadoClass = membresia.activa ? 'estado-activa' : 'estado-inactiva';
    
    return `
        <div class="membresia-card" data-id="${membresia.id}">
            ${membresia.esOferta ? '<div class="oferta-badge">🔥 OFERTA</div>' : ''}
            
            <div class="membresia-header">
                <div class="flex items-center justify-between mb-2">
                    <span class="membresia-tipo tipo-${membresia.tipo}">${tipoInfo.nombre}</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${estadoClass}">
                        ${membresia.activa ? '✅ Activa' : '❌ Inactiva'}
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-white mb-1">${membresia.nombre}</h3>
                <div class="flex items-baseline gap-2">
                    <span class="membresia-precio">$${membresia.precio.toLocaleString()}</span>
                    ${membresia.esOferta && membresia.precioOriginal ? 
                        `<span class="membresia-precio-original">$${membresia.precioOriginal.toLocaleString()}</span>` : ''
                    }
                </div>
                ${membresia.esOferta && membresia.fechaVencimientoOferta ? 
                    `<p class="text-xs text-yellow-400 mt-1">⏰ Válida hasta ${membresia.fechaVencimientoOferta.toLocaleDateString('es-ES')}</p>` : ''
                }
            </div>
            
            <div class="membresia-body">
                <div class="membresia-duracion">
                    <i data-lucide="calendar" class="w-4 h-4"></i>
                    <span>${duracionTexto}</span>
                </div>
                ${membresia.descripcion ? `<p class="membresia-descripcion">${membresia.descripcion}</p>` : ''}
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-400">Socios activos:</span>
                    <span class="font-semibold text-blue-400">${membresia.sociosActivos}</span>
                </div>
            </div>
            
            <div class="membresia-footer">
                <div class="membresia-acciones">
                    <button class="btn-accion btn-ver" onclick="verDetalleMembresia(${membresia.id})" title="Ver detalle">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="btn-accion btn-editar" onclick="editarMembresia(${membresia.id})" title="Editar">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button class="btn-accion btn-toggle" onclick="toggleEstadoMembresia(${membresia.id})" title="${membresia.activa ? 'Desactivar' : 'Activar'}">
                        <i data-lucide="${membresia.activa ? 'toggle-right' : 'toggle-left'}" class="w-4 h-4"></i>
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarMembresia(${membresia.id})" title="Eliminar">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

// -----------------------------------------------------------
// FUNCIONES AUXILIARES
// -----------------------------------------------------------
const obtenerInfoTipo = (tipo) => {
    const tipos = {
        'mensual': { nombre: 'Mensual', icon: '📅' },
        'anual': { nombre: 'Anual', icon: '🗓️' },
        'semanal': { nombre: 'Semanal', icon: '📆' },
        'dias': { nombre: 'Diario', icon: '🌅' },
        'temporada': { nombre: 'Temporada', icon: '🎯' }
    };
    return tipos[tipo] || tipos['mensual'];
};

const generarTexturaDuracion = (duracion) => {
    const { cantidad, unidad } = duracion;
    const unidades = {
        'dias': cantidad === 1 ? 'día' : 'días',
        'semanas': cantidad === 1 ? 'semana' : 'semanas',
        'meses': cantidad === 1 ? 'mes' : 'meses',
        'anos': cantidad === 1 ? 'año' : 'años'
    };
    return `${cantidad} ${unidades[unidad]}`;
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(membresiasFiltradas.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, membresiasFiltradas.length);
    
    document.getElementById('registros-inicio').textContent = inicio;
    document.getElementById('registros-fin').textContent = fin;
    document.getElementById('total-registros').textContent = membresiasFiltradas.length;
    document.getElementById('total-membresias').textContent = `${membresiasFiltradas.length} tipos registrados`;
    
    document.getElementById('btn-primera-pagina').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-siguiente').disabled = paginaActual === totalPaginas;
    document.getElementById('btn-ultima-pagina').disabled = paginaActual === totalPaginas;
    
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
    
    for (let i = inicio; i <= fin; i++) {
        const boton = document.createElement('button');
        boton.className = `px-3 py-2 text-sm font-medium border border-gray-600 rounded transition duration-200 ${
            i === paginaActual 
                ? 'text-white border-red-500' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`;
        if (i === paginaActual) {
            boton.style.backgroundColor = 'var(--color-rojo-principal)';
            boton.style.borderColor = 'var(--color-rojo-principal)';
        }
        boton.textContent = i;
        boton.onclick = () => cambiarPagina(i);
        container.appendChild(boton);
    }
};

const cambiarPagina = (nuevaPagina) => {
    paginaActual = nuevaPagina;
    actualizarGrid();
    actualizarPaginacion();
};

// -----------------------------------------------------------
// FUNCIONES DE MODAL
// -----------------------------------------------------------
const abrirModalMembresia = (membresia = null) => {
    const modal = document.getElementById('modal-membresia');
    const titulo = document.getElementById('modal-titulo');
    const form = document.getElementById('form-membresia');
    
    modoEdicion = !!membresia;
    membresiaEditando = membresia;
    
    titulo.textContent = modoEdicion ? 'Editar Membresía' : 'Nueva Membresía';
    
    if (modoEdicion) {
        llenarFormulario(membresia);
    } else {
        form.reset();
        document.getElementById('oferta-detalles').classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

const cerrarModalMembresia = () => {
    document.getElementById('modal-membresia').classList.add('hidden');
    document.body.style.overflow = '';
    document.getElementById('form-membresia').reset();
    modoEdicion = false;
    membresiaEditando = null;
};

const llenarFormulario = (membresia) => {
    document.getElementById('nombre-membresia').value = membresia.nombre;
    document.getElementById('precio-membresia').value = membresia.precio;
    document.getElementById('tipo-duracion').value = membresia.tipo;
    document.getElementById('duracion-cantidad').value = membresia.duracion.cantidad;
    document.getElementById('duracion-unidad').value = membresia.duracion.unidad;
    document.getElementById('descripcion-membresia').value = membresia.descripcion || '';
    document.getElementById('es-oferta').checked = membresia.esOferta;
    
    if (membresia.esOferta) {
        document.getElementById('oferta-detalles').classList.remove('hidden');
        document.getElementById('precio-original').value = membresia.precioOriginal || '';
        if (membresia.fechaVencimientoOferta) {
            document.getElementById('fecha-vencimiento-oferta').value = membresia.fechaVencimientoOferta.toISOString().split('T')[0];
        }
    }
};

// -----------------------------------------------------------
// FUNCIONES DE ACCIONES
// -----------------------------------------------------------
const verDetalleMembresia = (id) => {
    const membresia = todasLasMembresias.find(m => m.id === id);
    if (membresia) {
        mostrarNotificacion(`📋 Detalle de ${membresia.nombre}`, 'info');
        // Aquí se podría abrir un modal de detalle
    }
};

const editarMembresia = (id) => {
    const membresia = todasLasMembresias.find(m => m.id === id);
    if (membresia) {
        abrirModalMembresia(membresia);
    }
};

const toggleEstadoMembresia = (id) => {
    const membresia = todasLasMembresias.find(m => m.id === id);
    if (membresia) {
        membresia.activa = !membresia.activa;
        actualizarGrid();
        actualizarKPIs();
        mostrarNotificacion(
            `✅ Membresía ${membresia.activa ? 'activada' : 'desactivada'} exitosamente`, 
            'success'
        );
    }
};

const eliminarMembresia = (id) => {
    if (confirm('¿Estás seguro de eliminar esta membresía? Esta acción no se puede deshacer.')) {
        const index = todasLasMembresias.findIndex(m => m.id === id);
        if (index !== -1) {
            const membresia = todasLasMembresias[index];
            todasLasMembresias.splice(index, 1);
            aplicarFiltros();
            actualizarKPIs();
            mostrarNotificacion(`🗑️ Membresía "${membresia.nombre}" eliminada`, 'success');
        }
    }
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
        setTimeout(() => document.body.removeChild(notificacion), 300);
    }, 3000);
};

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para filtros
    document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    document.getElementById('buscar-membresia').addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);

    // Event listeners para paginación
    document.getElementById('btn-primera-pagina').addEventListener('click', () => cambiarPagina(1));
    document.getElementById('btn-pagina-anterior').addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
    document.getElementById('btn-pagina-siguiente').addEventListener('click', () => {
        const totalPaginas = Math.ceil(membresiasFiltradas.length / registrosPorPagina);
        cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
    });
    document.getElementById('btn-ultima-pagina').addEventListener('click', () => {
        const totalPaginas = Math.ceil(membresiasFiltradas.length / registrosPorPagina);
        cambiarPagina(totalPaginas);
    });

    // Event listener para modal
    document.getElementById('btn-nueva-membresia').addEventListener('click', () => abrirModalMembresia());
    document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModalMembresia);
    document.getElementById('btn-cancelar').addEventListener('click', cerrarModalMembresia);

    // Event listener para checkbox de oferta
    document.getElementById('es-oferta').addEventListener('change', (e) => {
        const detalles = document.getElementById('oferta-detalles');
        if (e.target.checked) {
            detalles.classList.remove('hidden');
        } else {
            detalles.classList.add('hidden');
        }
    });

    // Event listener para el formulario
    document.getElementById('form-membresia').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nuevaMembresia = {
            id: modoEdicion ? membresiaEditando.id : Math.max(...todasLasMembresias.map(m => m.id)) + 1,
            nombre: formData.get('nombre-membresia'),
            precio: parseFloat(formData.get('precio-membresia')),
            tipo: formData.get('tipo-duracion'),
            duracion: {
                cantidad: parseInt(formData.get('duracion-cantidad')),
                unidad: formData.get('duracion-unidad')
            },
            descripcion: formData.get('descripcion-membresia') || '',
            activa: true,
            esOferta: formData.get('es-oferta') === 'on',
            fechaCreacion: modoEdicion ? membresiaEditando.fechaCreacion : new Date(),
            sociosActivos: modoEdicion ? membresiaEditando.sociosActivos : 0
        };

        if (nuevaMembresia.esOferta) {
            nuevaMembresia.precioOriginal = parseFloat(formData.get('precio-original')) || null;
            const fechaVencimiento = formData.get('fecha-vencimiento-oferta');
            nuevaMembresia.fechaVencimientoOferta = fechaVencimiento ? new Date(fechaVencimiento) : null;
        }

        if (modoEdicion) {
            const index = todasLasMembresias.findIndex(m => m.id === membresiaEditando.id);
            todasLasMembresias[index] = nuevaMembresia;
            mostrarNotificacion('✅ Membresía actualizada exitosamente', 'success');
        } else {
            todasLasMembresias.unshift(nuevaMembresia);
            mostrarNotificacion('✅ Membresía creada exitosamente', 'success');
        }

        aplicarFiltros();
        actualizarKPIs();
        cerrarModalMembresia();
    });

    // Event listener para registros por página
    document.getElementById('registros-por-pagina').addEventListener('change', (e) => {
        registrosPorPagina = parseInt(e.target.value);
        paginaActual = 1;
        actualizarGrid();
        actualizarPaginacion();
    });

    // Toggle móvil
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

    // Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalMembresia();
        }
    });

    // Inicializar datos
    generateMockMembresiaData();
    membresiasFiltradas = [...todasLasMembresias];
    actualizarGrid();
    actualizarPaginacion();

    // Inicializar iconos de Lucide
    lucide.createIcons();
});