// ================================================
// INVENTARIO.JS - GESTIÓN DE INVENTARIO Y PRODUCTOS
// Basado en la estructura de socios.js y ventas.js
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
let totalProductos = 347;
let productosFiltrados = [];
let todosLosProductos = []; // Datos simulados - reemplazar con API calls
let comprasRealizadas = []; // Nuevo: para almacenar compras
let productosEnCompra = []; // Nuevo: para el carrito de compra actual

// -----------------------------------------------------------
// DATOS SIMULADOS (Reemplazar con llamadas a API)
// -----------------------------------------------------------
const generateMockInventoryData = () => {
    const categorias = ['suplementos', 'accesorios', 'ropa', 'equipamiento', 'bebidas', 'otros'];
    const marcas = ['Gold Standard', 'Muscletech', 'BSN', 'Dymatize', 'Universal', 'Optimum', 'Cellucor', 'Hexodus'];
    
    const productos = [
        // Suplementos
        { base: 'Proteína Whey', categoria: 'suplementos', marcas: ['Gold Standard', 'Muscletech', 'BSN'], precios: [45, 85] },
        { base: 'Creatina Monohidrato', categoria: 'suplementos', marcas: ['Muscletech', 'Universal', 'Optimum'], precios: [25, 45] },
        { base: 'BCAA Aminoácidos', categoria: 'suplementos', marcas: ['Dymatize', 'BSN', 'Cellucor'], precios: [18, 35] },
        { base: 'Pre-Workout', categoria: 'suplementos', marcas: ['Cellucor', 'BSN', 'Muscletech'], precios: [30, 55] },
        { base: 'Glutamina', categoria: 'suplementos', marcas: ['Universal', 'Optimum', 'Dymatize'], precios: [20, 40] },
        { base: 'Quemador de Grasa', categoria: 'suplementos', marcas: ['Muscletech', 'Cellucor', 'BSN'], precios: [35, 65] },
        
        // Accesorios
        { base: 'Shaker', categoria: 'accesorios', marcas: ['Hexodus', 'BSN', 'Universal'], precios: [8, 15] },
        { base: 'Guantes de Entrenamiento', categoria: 'accesorios', marcas: ['Hexodus', 'Universal'], precios: [12, 25] },
        { base: 'Cinturón de Levantamiento', categoria: 'accesorios', marcas: ['Hexodus', 'Universal'], precios: [25, 45] },
        { base: 'Straps de Muñeca', categoria: 'accesorios', marcas: ['Hexodus', 'Universal'], precios: [8, 18] },
        { base: 'Toalla Deportiva', categoria: 'accesorios', marcas: ['Hexodus'], precios: [10, 20] },
        
        // Ropa deportiva
        { base: 'Camiseta de Entrenamiento', categoria: 'ropa', marcas: ['Hexodus'], precios: [15, 30] },
        { base: 'Shorts Deportivos', categoria: 'ropa', marcas: ['Hexodus'], precios: [20, 35] },
        { base: 'Leggins Deportivos', categoria: 'ropa', marcas: ['Hexodus'], precios: [25, 40] },
        { base: 'Sudadera con Capucha', categoria: 'ropa', marcas: ['Hexodus'], precios: [35, 55] },
        
        // Equipamiento
        { base: 'Mancuernas Ajustables', categoria: 'equipamiento', marcas: ['Universal'], precios: [80, 150] },
        { base: 'Banda Elástica', categoria: 'equipamiento', marcas: ['Hexodus', 'Universal'], precios: [8, 20] },
        { base: 'Colchoneta de Yoga', categoria: 'equipamiento', marcas: ['Hexodus'], precios: [15, 30] },
        { base: 'Pelota de Ejercicio', categoria: 'equipamiento', marcas: ['Hexodus'], precios: [20, 35] },
        
        // Bebidas
        { base: 'Botella de Agua', categoria: 'bebidas', marcas: ['Hexodus'], precios: [5, 12] },
        { base: 'Bebida Energética', categoria: 'bebidas', marcas: ['Cellucor', 'BSN'], precios: [2, 4] },
        { base: 'Bebida Isotónica', categoria: 'bebidas', marcas: ['Cellucor'], precios: [1.5, 3] }
    ];
    
    let idCounter = 1;
    
    for (const productoBase of productos) {
        for (const marca of productoBase.marcas) {
            for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
                const variaciones = ['300g', '500g', '1kg', '2kg', '5kg', 'Talla S', 'Talla M', 'Talla L', 'Talla XL', 'Negro', 'Azul', 'Rojo'];
                const variacion = ['suplementos'].includes(productoBase.categoria) ? 
                    variaciones.slice(0, 5)[Math.floor(Math.random() * 5)] :
                    ['ropa'].includes(productoBase.categoria) ?
                    variaciones.slice(5, 9)[Math.floor(Math.random() * 4)] :
                    variaciones.slice(-3)[Math.floor(Math.random() * 3)];
                
                const precioBase = productoBase.precios[0] + Math.random() * (productoBase.precios[1] - productoBase.precios[0]);
                const precioCompra = Math.round(precioBase * 0.6 * 100) / 100;
                const precioVenta = Math.round(precioBase * 100) / 100;
                
                const stockActual = Math.floor(Math.random() * 100);
                const stockMinimo = Math.floor(Math.random() * 10) + 5;
                
                let estadoStock = 'disponible';
                if (stockActual === 0) estadoStock = 'agotado';
                else if (stockActual < stockMinimo) estadoStock = 'bajo';
                
                todosLosProductos.push({
                    id: idCounter,
                    codigo: `${productoBase.categoria.toUpperCase().slice(0, 3)}-${String(idCounter).padStart(3, '0')}`,
                    nombre: `${productoBase.base} ${marca} ${variacion}`,
                    categoria: productoBase.categoria,
                    marca: marca,
                    precioCompra: precioCompra,
                    precioVenta: precioVenta,
                    stockActual: stockActual,
                    stockMinimo: stockMinimo,
                    estadoStock: estadoStock,
                    ubicacion: `Estante ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}-${Math.floor(Math.random() * 10) + 1}`,
                    descripcion: `${productoBase.base} de la marca ${marca}, ideal para entrenamiento.`,
                    fechaActualizacion: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
                    activo: Math.random() > 0.1 // 90% productos activos
                });
                
                idCounter++; // Incrementar después de crear el producto
                if (idCounter > 347) break;
            }
            if (idCounter > 347) break;
        }
        if (idCounter > 347) break;
    }
    
    // Ordenar por nombre
    todosLosProductos.sort((a, b) => a.nombre.localeCompare(b.nombre));
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, productosFiltrados.length);
    
    // Actualizar información de registros
    document.getElementById('registros-inicio').textContent = inicio;
    document.getElementById('registros-fin').textContent = fin;
    document.getElementById('total-registros').textContent = productosFiltrados.length;
    document.getElementById('total-productos').textContent = `${productosFiltrados.length} productos`;
    
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
    const busqueda = document.getElementById('buscar-producto').value.toLowerCase().trim();
    const categoriaFiltro = document.getElementById('categoria-filtro').value;
    const stockFiltro = document.getElementById('stock-filtro').value;
    
    productosFiltrados = todosLosProductos.filter(producto => {
        // Filtro de búsqueda
        const coincideBusqueda = !busqueda || 
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.codigo.toLowerCase().includes(busqueda) ||
            producto.marca.toLowerCase().includes(busqueda);
        
        // Filtro de categoría
        const coincideCategoria = categoriaFiltro === 'todas' || producto.categoria === categoriaFiltro;
        
        // Filtro de stock
        let coincideStock = true;
        switch(stockFiltro) {
            case 'disponible':
                coincideStock = producto.stockActual > producto.stockMinimo;
                break;
            case 'bajo':
                coincideStock = producto.stockActual > 0 && producto.stockActual <= producto.stockMinimo;
                break;
            case 'agotado':
                coincideStock = producto.stockActual === 0;
                break;
        }
        
        return coincideBusqueda && coincideCategoria && coincideStock && producto.activo;
    });
    
    paginaActual = 1; // Reset a la primera página
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

const limpiarFiltros = () => {
    document.getElementById('buscar-producto').value = '';
    document.getElementById('categoria-filtro').value = 'todas';
    document.getElementById('stock-filtro').value = 'todos';
    productosFiltrados = todosLosProductos.filter(p => p.activo);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

// -----------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR LA TABLA
// -----------------------------------------------------------
const actualizarTabla = () => {
    const tbody = document.getElementById('tabla-productos-body');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = productosPagina.map(producto => generarFilaProducto(producto)).join('');
    
    // Re-inicializar iconos de Lucide para las nuevas filas
    lucide.createIcons();
};

const generarFilaProducto = (producto) => {
    const categoriaInfo = obtenerInfoCategoria(producto.categoria);
    const estadoStockInfo = obtenerInfoEstadoStock(producto.estadoStock, producto.stockActual);
    const fechaFormateada = producto.fechaActualizacion.toLocaleDateString('es-ES');
    
    return `
        <tr class="hover:bg-gray-700 transition duration-200 cursor-pointer">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center" style="background-color: rgba(0, 191, 255, 0.2);">
                            <span class="text-sm font-bold" style="color: var(--color-azul-acento);">${producto.codigo}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-semibold text-white">${producto.nombre}</div>
                        <div class="text-xs text-gray-400">${producto.marca}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center justify-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium categoria-${producto.categoria}">
                        ${categoriaInfo.icon} ${categoriaInfo.nombre}
                    </span>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div>
                    <div class="text-white font-semibold">${producto.stockActual} unidades</div>
                    <div class="text-gray-400">Mínimo: ${producto.stockMinimo}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-lg font-bold" style="color: var(--color-rojo-principal);">$${producto.precioVenta.toFixed(2)}</div>
                <div class="text-xs text-gray-400">Costo: $${producto.precioCompra.toFixed(2)}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full stock-${producto.estadoStock}">
                    ${estadoStockInfo.icon} ${estadoStockInfo.nombre}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-400">
                <div>${producto.ubicacion}</div>
                <div class="text-xs">${fechaFormateada}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex items-center justify-center space-x-2">
                    <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200" title="Ver Detalle" onclick="verDetalleProducto(${producto.id})">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition duration-200" title="Editar" onclick="editarProducto(${producto.id})">
                        <i data-lucide="square-pen" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition duration-200" title="Ajustar Stock" onclick="ajustarStock(${producto.id})">
                        <i data-lucide="package-plus" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition duration-200" title="Eliminar" onclick="eliminarProducto(${producto.id})">
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
const obtenerInfoCategoria = (categoria) => {
    const info = {
        'suplementos': { nombre: 'Suplementos', icon: '💊' },
        'accesorios': { nombre: 'Accesorios', icon: '🎒' },
        'ropa': { nombre: 'Ropa', icon: '👕' },
        'equipamiento': { nombre: 'Equipamiento', icon: '🏋️' },
        'bebidas': { nombre: 'Bebidas', icon: '🥤' },
        'otros': { nombre: 'Otros', icon: '📦' }
    };
    return info[categoria] || info['otros'];
};

const obtenerInfoEstadoStock = (estado, cantidad) => {
    const info = {
        'disponible': { nombre: 'Disponible', icon: '✅', clase: 'disponible' },
        'bajo': { nombre: 'Stock Bajo', icon: '⚠️', clase: 'bajo' },
        'agotado': { nombre: 'Sin Stock', icon: '❌', clase: 'agotado' }
    };
    return info[estado] || info['disponible'];
};

const actualizarKPIs = () => {
    const productosActivos = todosLosProductos.filter(p => p.activo);
    const stockBajo = productosActivos.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length;
    const valorTotal = productosActivos.reduce((sum, p) => sum + (p.precioVenta * p.stockActual), 0);
    const categorias = [...new Set(productosActivos.map(p => p.categoria))].length;
    
    document.querySelector('.tarjeta-kpi:nth-child(1) .text-3xl').textContent = productosActivos.length;
    document.querySelector('.tarjeta-kpi:nth-child(2) .text-3xl').textContent = stockBajo;
    document.querySelector('.tarjeta-kpi:nth-child(3) .text-3xl').textContent = `$${valorTotal.toLocaleString()}`;
    document.querySelector('.tarjeta-kpi:nth-child(4) .text-3xl').textContent = categorias;
};

// -----------------------------------------------------------
// FUNCIONES DE GESTIÓN DE PRODUCTOS
// -----------------------------------------------------------
const verDetalleProducto = (productoId) => {
    const producto = todosLosProductos.find(p => p.id === productoId);
    if (producto) {
        alert(`Producto: ${producto.nombre}\nCódigo: ${producto.codigo}\nCategoría: ${producto.categoria}\nStock: ${producto.stockActual}\nPrecio: $${producto.precioVenta}\nUbicación: ${producto.ubicacion}`);
    }
};

const editarProducto = (productoId) => {
    const producto = todosLosProductos.find(p => p.id === productoId);
    if (producto) {
        // Llenar el formulario con los datos del producto
        document.getElementById('nombre-producto').value = producto.nombre;
        document.getElementById('codigo-producto').value = producto.codigo;
        document.getElementById('categoria-producto').value = producto.categoria;
        document.getElementById('marca-producto').value = producto.marca;
        document.getElementById('precio-compra').value = producto.precioCompra;
        document.getElementById('precio-venta').value = producto.precioVenta;
        document.getElementById('stock-inicial').value = producto.stockActual;
        document.getElementById('stock-minimo').value = producto.stockMinimo;
        document.getElementById('ubicacion-producto').value = producto.ubicacion;
        document.getElementById('descripcion-producto').value = producto.descripcion;
        
        // Cambiar el título del modal
        document.querySelector('#modal-producto h3').textContent = 'Editar Producto';
        document.querySelector('#form-producto button[type="submit"]').innerHTML = '<i data-lucide="save" class="w-4 h-4 mr-2"></i>Actualizar Producto';
        
        // Almacenar el ID para la actualización
        document.getElementById('form-producto').dataset.editId = productoId;
        
        // Abrir el modal
        document.getElementById('modal-producto').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        lucide.createIcons();
    }
};

const ajustarStock = (productoId) => {
    const cantidad = prompt('Ingrese la cantidad a añadir (use número negativo para reducir):');
    if (cantidad !== null && !isNaN(cantidad)) {
        const producto = todosLosProductos.find(p => p.id === productoId);
        if (producto) {
            producto.stockActual = Math.max(0, producto.stockActual + parseInt(cantidad));
            producto.fechaActualizacion = new Date();
            
            // Actualizar estado del stock
            if (producto.stockActual === 0) {
                producto.estadoStock = 'agotado';
            } else if (producto.stockActual <= producto.stockMinimo) {
                producto.estadoStock = 'bajo';
            } else {
                producto.estadoStock = 'disponible';
            }
            
            aplicarFiltros();
            mostrarNotificacion('✅ Stock actualizado correctamente', 'success');
        }
    }
};

const eliminarProducto = (productoId) => {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        const producto = todosLosProductos.find(p => p.id === productoId);
        if (producto) {
            producto.activo = false;
            aplicarFiltros();
            mostrarNotificacion('✅ Producto eliminado correctamente', 'success');
        }
    }
};

// -----------------------------------------------------------
// FUNCIONES DEL MODAL DE PRODUCTO
// -----------------------------------------------------------
const configurarModal = () => {
    const modal = document.getElementById('modal-producto');
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const btnCancelar = document.getElementById('btn-cancelar-producto');
    const formProducto = document.getElementById('form-producto');

    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', () => {
            // Limpiar el formulario y configurar para nuevo producto
            if (formProducto) {
                formProducto.reset();
                delete formProducto.dataset.editId;
            }
            if (document.querySelector('#modal-producto h3')) {
                document.querySelector('#modal-producto h3').textContent = 'Agregar Nuevo Producto';
            }
            if (document.querySelector('#form-producto button[type="submit"]')) {
                document.querySelector('#form-producto button[type="submit"]').innerHTML = '<i data-lucide="save" class="w-4 h-4 mr-2"></i>Guardar Producto';
            }
            
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
            
            lucide.createIcons();
        });
    }

    const closeModal = () => {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (formProducto) {
                formProducto.reset();
                delete formProducto.dataset.editId;
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

    // Configurar validación del formulario
    if (formProducto) {
        formProducto.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarProducto();
        });
    }
};

// -----------------------------------------------------------
// FUNCIONES DEL MODAL DE COMPRAS
// -----------------------------------------------------------
const configurarModalCompras = () => {
    const modalCompra = document.getElementById('modal-compra');
    const btnNuevaCompra = document.getElementById('btn-nueva-compra');
    const btnCerrarCompra = document.getElementById('btn-cerrar-modal-compra');
    const btnCancelarCompra = document.getElementById('btn-cancelar-compra');
    const formCompra = document.getElementById('form-compra');
    const btnAgregarProducto = document.getElementById('btn-agregar-producto-compra');
    
    // Establecer fecha actual por defecto
    const fechaCompra = document.getElementById('fecha-compra');
    if (fechaCompra) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaCompra.value = hoy;
    }

    if (btnNuevaCompra) {
        btnNuevaCompra.addEventListener('click', () => {
            abrirModalCompra();
        });
    }

    const closeModalCompra = () => {
        if (modalCompra) {
            modalCompra.classList.add('hidden');
            document.body.style.overflow = '';
            if (formCompra) {
                formCompra.reset();
                // Restablecer fecha actual
                const fechaCompra = document.getElementById('fecha-compra');
                if (fechaCompra) {
                    const hoy = new Date().toISOString().split('T')[0];
                    fechaCompra.value = hoy;
                }
            }
            productosEnCompra = [];
            actualizarListaProductosCompra();
        }
    };

    if (btnCerrarCompra) btnCerrarCompra.addEventListener('click', closeModalCompra);
    if (btnCancelarCompra) btnCancelarCompra.addEventListener('click', closeModalCompra);

    // Agregar producto a la compra
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', agregarProductoACompra);
    }

    // Validación del formulario de compra
    if (formCompra) {
        formCompra.addEventListener('submit', (e) => {
            e.preventDefault();
            procesarCompra();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalCompra && !modalCompra.classList.contains('hidden')) {
            closeModalCompra();
        }
    });
};

// Función para abrir el modal de compra y cargar productos
const abrirModalCompra = () => {
    const modalCompra = document.getElementById('modal-compra');
    
    // Inicializar el selector de productos mejorado
    inicializarSelectorProductos();
    
    productosEnCompra = [];
    actualizarListaProductosCompra();
    
    if (modalCompra) {
        modalCompra.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    lucide.createIcons();
};

// Función para inicializar el selector de productos con búsqueda
const inicializarSelectorProductos = () => {
    const searchInput = document.getElementById('producto-compra-search');
    const dropdown = document.getElementById('producto-compra-dropdown');
    const productList = document.getElementById('producto-compra-list');
    const emptyMessage = document.getElementById('producto-compra-empty');
    const selectedInput = document.getElementById('producto-compra-selected');
    const displayDiv = document.getElementById('producto-compra-display');
    const clearBtn = document.getElementById('producto-compra-clear');
    const costoInput = document.getElementById('costo-unitario');
    
    const productosActivos = todosLosProductos.filter(p => p.activo);
    let filteredProducts = [...productosActivos];
    
    // Función para renderizar la lista de productos
    const renderProductList = (productos) => {
        if (productos.length === 0) {
            productList.innerHTML = '';
            emptyMessage.classList.remove('hidden');
        } else {
            emptyMessage.classList.add('hidden');
            productList.innerHTML = productos.map(producto => {
                const stockStatus = obtenerInfoEstadoStock(producto.estadoStock, producto.stockActual);
                const isLowStock = producto.stockActual <= producto.stockMinimo;
                const isOutOfStock = producto.stockActual === 0;
                
                return `
                    <div class="producto-item p-3 hover:bg-gray-700 cursor-pointer rounded border-b border-gray-700 last:border-b-0 transition-all duration-200 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}" 
                         data-id="${producto.id}" 
                         data-precio="${producto.precioCompra}"
                         data-stock="${producto.stockActual}"
                         data-stock-minimo="${producto.stockMinimo}"
                         ${isOutOfStock ? 'data-disabled="true"' : ''}>
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-white">${producto.nombre}</span>
                                    ${isOutOfStock ? '<span class="px-1.5 py-0.5 bg-red-900 text-red-300 rounded text-xs">SIN STOCK</span>' : ''}
                                    ${isLowStock && !isOutOfStock ? '<span class="px-1.5 py-0.5 bg-yellow-900 text-yellow-300 rounded text-xs">BAJO</span>' : ''}
                                </div>
                                <div class="text-sm text-gray-400 mt-1">
                                    <span class="bg-blue-900 text-blue-300 px-2 py-0.5 rounded text-xs mr-2">${producto.codigo}</span>
                                    <span class="text-gray-300">${producto.marca}</span>
                                </div>
                                <div class="flex items-center gap-3 mt-1 text-xs">
                                    <span class="${stockStatus.className}">Stock: ${producto.stockActual}</span>
                                    <span class="text-gray-400">Mín: ${producto.stockMinimo}</span>
                                    <span class="text-gray-400">${obtenerInfoCategoria(producto.categoria).nombre}</span>
                                </div>
                            </div>
                            <div class="text-right text-sm">
                                <div class="text-green-400 font-semibold">$${producto.precioCompra.toFixed(2)}</div>
                                <div class="text-xs text-gray-400">Costo unitario</div>
                                ${producto.precioVenta ? `<div class="text-xs text-blue-400">Venta: $${producto.precioVenta.toFixed(2)}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };
    
    // Función para filtrar productos
    const filterProducts = (searchTerm) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            filteredProducts = [...productosActivos];
        } else {
            filteredProducts = productosActivos.filter(producto => 
                producto.nombre.toLowerCase().includes(term) ||
                producto.codigo.toLowerCase().includes(term) ||
                producto.marca.toLowerCase().includes(term)
            );
        }
        renderProductList(filteredProducts);
    };
    
    // Event listeners
    if (searchInput) {
        // Mostrar dropdown al hacer focus
        searchInput.addEventListener('focus', () => {
            filterProducts(searchInput.value);
            dropdown.classList.remove('hidden');
        });
        
        // Filtrar mientras se escribe
        searchInput.addEventListener('input', (e) => {
            filterProducts(e.target.value);
            dropdown.classList.remove('hidden');
        });
        
        // Ocultar dropdown al perder focus (con delay para permitir clicks)
        searchInput.addEventListener('blur', (e) => {
            setTimeout(() => {
                if (!dropdown.contains(document.activeElement)) {
                    dropdown.classList.add('hidden');
                }
            }, 200);
        });
    }
    
    // Click en producto
    if (productList) {
        productList.addEventListener('click', (e) => {
            const item = e.target.closest('.producto-item');
            if (item && !item.dataset.disabled) {
                const productoId = item.dataset.id;
                const precio = item.dataset.precio;
                const stock = parseInt(item.dataset.stock);
                const stockMinimo = parseInt(item.dataset.stockMinimo);
                const producto = productosActivos.find(p => p.id == productoId);
                
                if (producto && producto.stockActual > 0) {
                    // Actualizar campos
                    selectedInput.value = productoId;
                    searchInput.value = '';
                    
                    // Mostrar producto seleccionado
                    const infoDiv = document.getElementById('producto-compra-info');
                    const warningDiv = document.getElementById('producto-compra-stock-warning');
                    const stockStatus = obtenerInfoEstadoStock(producto.estadoStock, producto.stockActual);
                    const categoriaInfo = obtenerInfoCategoria(producto.categoria);
                    
                    if (infoDiv) {
                        infoDiv.innerHTML = `
                            <div class="flex items-center gap-2">
                                <div class="flex-shrink-0 w-6 h-6 bg-blue-900/30 rounded flex items-center justify-center">
                                    <i data-lucide="package" class="w-3 h-3 text-blue-400"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-semibold text-white truncate leading-tight">${producto.nombre}</h4>
                                    <div class="flex items-center gap-2 mt-1 text-xs flex-wrap">
                                        <span class="px-1.5 py-0.5 bg-blue-900 text-blue-300 rounded flex-shrink-0">${producto.codigo}</span>
                                        <span class="text-gray-300 truncate">${producto.marca}</span>
                                        <span class="${stockStatus.className} font-medium flex-shrink-0">Stock: ${producto.stockActual}</span>
                                    </div>
                                    <div class="mt-1 text-xs">
                                        <span class="text-green-400 font-semibold">$${producto.precioCompra.toFixed(2)}</span>
                                        <span class="text-gray-400 ml-1">costo unitario</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    // Mostrar advertencia si stock es bajo
                    if (warningDiv) {
                        if (stock <= stockMinimo) {
                            warningDiv.classList.remove('hidden');
                        } else {
                            warningDiv.classList.add('hidden');
                        }
                    }
                    
                    displayDiv.classList.remove('hidden');
                    
                    // Auto-llenar precio
                    if (costoInput) {
                        costoInput.value = precio;
                    }
                    
                    // Ocultar dropdown
                    dropdown.classList.add('hidden');
                    
                    // Mostrar notificación de selección
                    mostrarNotificacion(`Producto seleccionado: ${producto.nombre}`, 'success');
                } else {
                    mostrarNotificacion('Este producto no tiene stock disponible', 'warning');
                }
            }
        });
    }
    
    // Botón para limpiar selección
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            selectedInput.value = '';
            searchInput.value = '';
            displayDiv.classList.add('hidden');
            
            // Limpiar precio y ocultar advertencia
            if (costoInput) {
                costoInput.value = '';
            }
            
            const warningDiv = document.getElementById('producto-compra-stock-warning');
            if (warningDiv) {
                warningDiv.classList.add('hidden');
            }
            
            // Focus al campo de búsqueda
            searchInput.focus();
            
            mostrarNotificacion('Selección de producto eliminada', 'info');
        });
    }
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Inicializar con todos los productos
    filterProducts('');
};

// Función para agregar producto a la compra
const agregarProductoACompra = () => {
    const selectedInput = document.getElementById('producto-compra-selected');
    const cantidadInput = document.getElementById('cantidad-compra');
    const costoInput = document.getElementById('costo-unitario');
    const searchInput = document.getElementById('producto-compra-search');
    const displayDiv = document.getElementById('producto-compra-display');
    
    const productoId = selectedInput.value;
    const cantidad = parseInt(cantidadInput.value) || 0;
    const costoUnitario = parseFloat(costoInput.value) || 0;
    
    if (!productoId || cantidad <= 0 || costoUnitario <= 0) {
        mostrarNotificacion('Por favor, complete todos los campos correctamente', 'error');
        return;
    }
    
    const producto = todosLosProductos.find(p => p.id == productoId);
    if (!producto) {
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    // Verificar si el producto ya está en la compra
    const productoExistente = productosEnCompra.find(p => p.id == productoId);
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
        productoExistente.total = productoExistente.cantidad * productoExistente.costoUnitario;
    } else {
        productosEnCompra.push({
            id: productoId,
            nombre: producto.nombre,
            codigo: producto.codigo,
            cantidad: cantidad,
            costoUnitario: costoUnitario,
            total: cantidad * costoUnitario
        });
    }
    
    // Limpiar campos
    selectedInput.value = '';
    searchInput.value = '';
    displayDiv.classList.add('hidden');
    cantidadInput.value = '1';
    costoInput.value = '';
    
    actualizarListaProductosCompra();
    mostrarNotificacion('Producto agregado a la compra', 'success');
};

// Función para actualizar la lista de productos en la compra
const actualizarListaProductosCompra = () => {
    const tbody = document.getElementById('lista-productos-compra');
    const totalSpan = document.getElementById('total-compra');
    
    if (!tbody || !totalSpan) return;
    
    if (productosEnCompra.length === 0) {
        tbody.innerHTML = '<tr class="text-gray-400"><td colspan="5" class="text-center p-8">No hay productos agregados</td></tr>';
        totalSpan.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    tbody.innerHTML = productosEnCompra.map(producto => {
        total += producto.total;
        return `
            <tr class="border-b border-gray-800 hover:bg-gray-800 transition duration-200">
                <td class="p-2 text-white">${producto.nombre} (${producto.codigo})</td>
                <td class="p-2 text-center text-white">${producto.cantidad}</td>
                <td class="p-2 text-right text-white">$${producto.costoUnitario.toFixed(2)}</td>
                <td class="p-2 text-right text-green-400 font-semibold">$${producto.total.toFixed(2)}</td>
                <td class="p-2 text-center">
                    <button type="button" onclick="eliminarProductoCompra(${producto.id})" 
                            class="text-red-400 hover:text-red-300 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    totalSpan.textContent = `$${total.toFixed(2)}`;
    lucide.createIcons();
};

// Función para eliminar producto de la compra
const eliminarProductoCompra = (productoId) => {
    productosEnCompra = productosEnCompra.filter(p => p.id != productoId);
    actualizarListaProductosCompra();
    mostrarNotificacion('Producto eliminado de la compra', 'info');
};

// Función para procesar la compra
const procesarCompra = () => {
    const proveedor = document.getElementById('proveedor-compra').value.trim();
    const tipoPago = document.getElementById('tipo-pago-compra').value;
    const fechaCompra = document.getElementById('fecha-compra').value;
    
    if (!proveedor || !tipoPago || !fechaCompra || productosEnCompra.length === 0) {
        mostrarNotificacion('Por favor, complete todos los campos y agregue al menos un producto', 'error');
        return;
    }
    
    // Calcular total
    const totalCompra = productosEnCompra.reduce((sum, p) => sum + p.total, 0);
    
    // Crear registro de compra
    const nuevaCompra = {
        id: Date.now(),
        fecha: fechaCompra,
        proveedor: proveedor,
        tipoPago: tipoPago,
        productos: [...productosEnCompra],
        total: totalCompra,
        fechaRegistro: new Date().toISOString()
    };
    
    // Agregar a lista de compras
    comprasRealizadas.push(nuevaCompra);
    
    // Actualizar stock de productos
    productosEnCompra.forEach(productoCompra => {
        const producto = todosLosProductos.find(p => p.id == productoCompra.id);
        if (producto) {
            producto.stockActual += productoCompra.cantidad;
            // Actualizar precio de compra si es diferente
            producto.precioCompra = productoCompra.costoUnitario;
            // Actualizar estado del stock
            if (producto.stockActual === 0) {
                producto.estadoStock = 'agotado';
            } else if (producto.stockActual <= producto.stockMinimo) {
                producto.estadoStock = 'bajo';
            } else {
                producto.estadoStock = 'disponible';
            }
            producto.fechaActualizacion = new Date();
        }
    });
    
    // Cerrar modal
    document.getElementById('modal-compra').classList.add('hidden');
    document.body.style.overflow = '';
    
    // Actualizar interfaz
    actualizarTabla();
    actualizarKPIs();
    
    mostrarNotificacion(`Compra registrada exitosamente. Total: $${totalCompra.toFixed(2)}`, 'success');
    
    // Limpiar
    document.getElementById('form-compra').reset();
    productosEnCompra = [];
    
    // Restablecer fecha actual
    const fechaInput = document.getElementById('fecha-compra');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.value = hoy;
    }
    
    console.log('Compra registrada:', nuevaCompra);
};

// -----------------------------------------------------------
// FUNCIÓN PARA GUARDAR PRODUCTO
// -----------------------------------------------------------
const guardarProducto = () => {
    const formData = new FormData(document.getElementById('form-producto'));
    const editId = document.getElementById('form-producto').dataset.editId;
    
    // Validar datos básicos
    const nombre = formData.get('nombre-producto').trim();
    const codigo = formData.get('codigo-producto').trim();
    const categoria = formData.get('categoria-producto');
    const precioCompra = parseFloat(formData.get('precio-compra')) || 0;
    const precioVenta = parseFloat(formData.get('precio-venta')) || 0;
    
    if (!nombre || !codigo || !categoria || precioCompra <= 0 || precioVenta <= 0) {
        mostrarNotificacion('Por favor, complete todos los campos requeridos correctamente', 'error');
        return;
    }
    
    // Verificar código único (excepto al editar el mismo producto)
    const codigoExiste = todosLosProductos.find(p => 
        p.codigo.toLowerCase() === codigo.toLowerCase() && 
        (!editId || p.id != editId)
    );
    
    if (codigoExiste) {
        mostrarNotificacion('Ya existe un producto con ese código', 'error');
        return;
    }
    
    const nuevoProducto = {
        id: editId ? parseInt(editId) : Date.now(),
        codigo: codigo,
        nombre: nombre,
        categoria: categoria,
        marca: formData.get('marca-producto') || 'Sin marca',
        precioCompra: precioCompra,
        precioVenta: precioVenta,
        stockActual: parseInt(formData.get('stock-inicial')) || 0,
        stockMinimo: parseInt(formData.get('stock-minimo')) || 0,
        ubicacion: formData.get('ubicacion-producto') || 'Sin ubicación',
        descripcion: formData.get('descripcion-producto') || '',
        activo: true,
        fechaCreacion: editId ? todosLosProductos.find(p => p.id == editId)?.fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
    };
    
    // Determinar estado del stock
    const stockActual = nuevoProducto.stockActual;
    const stockMinimo = nuevoProducto.stockMinimo;
    if (stockActual === 0) {
        nuevoProducto.estadoStock = 'agotado';
    } else if (stockActual <= stockMinimo) {
        nuevoProducto.estadoStock = 'bajo';
    } else {
        nuevoProducto.estadoStock = 'disponible';
    }
    
    if (editId) {
        // Editar producto existente
        const index = todosLosProductos.findIndex(p => p.id == editId);
        if (index !== -1) {
            todosLosProductos[index] = nuevoProducto;
            mostrarNotificacion('Producto actualizado exitosamente', 'success');
        }
    } else {
        // Agregar nuevo producto
        todosLosProductos.push(nuevoProducto);
        totalProductos++;
        mostrarNotificacion('Producto agregado exitosamente', 'success');
    }
    
    // Cerrar modal y actualizar interfaz
    document.getElementById('modal-producto').classList.add('hidden');
    document.body.style.overflow = '';
    
    aplicarFiltros();
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
    
    console.log(editId ? 'Producto editado:' : 'Producto agregado:', nuevoProducto);
};

// -----------------------------------------------------------
// FUNCIÓN PARA MOSTRAR NOTIFICACIONES
// -----------------------------------------------------------
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const iconos = {
        success: '✅',
        error: '❌', 
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const colores = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600', 
        info: 'bg-blue-600'
    };
    
    notificacion.classList.add(colores[tipo] || colores.info);
    notificacion.innerHTML = `
        <div class="flex items-center text-white">
            <span class="mr-2">${iconos[tipo] || iconos.info}</span>
            <span>${mensaje}</span>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Mostrar la notificación
    setTimeout(() => {
        notificacion.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
};

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------

const configurarEventListeners = () => {
    // Event listeners para filtros
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
    const buscarProducto = document.getElementById('buscar-producto');
    const categoriaFiltro = document.getElementById('categoria-filtro');
    const stockFiltro = document.getElementById('stock-filtro');
    
    if (btnAplicarFiltros) btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    if (btnLimpiarFiltros) btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    if (buscarProducto) buscarProducto.addEventListener('input', aplicarFiltros);
    if (categoriaFiltro) categoriaFiltro.addEventListener('change', aplicarFiltros);
    if (stockFiltro) stockFiltro.addEventListener('change', aplicarFiltros);
    
    // Event listeners para paginación
    const btnPrimeraPagina = document.getElementById('btn-primera-pagina');
    const btnPaginaAnterior = document.getElementById('btn-pagina-anterior');
    const btnPaginaSiguiente = document.getElementById('btn-pagina-siguiente');
    const btnUltimaPagina = document.getElementById('btn-ultima-pagina');
    
    if (btnPrimeraPagina) btnPrimeraPagina.addEventListener('click', () => cambiarPagina(1));
    if (btnPaginaAnterior) btnPaginaAnterior.addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
    if (btnPaginaSiguiente) btnPaginaSiguiente.addEventListener('click', () => {
        const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
        cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
    });
    if (btnUltimaPagina) btnUltimaPagina.addEventListener('click', () => {
        const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
        cambiarPagina(totalPaginas);
    });
    
    // Event listener para cambiar registros por página
    const registrosPorPaginaSelect = document.getElementById('registros-por-pagina');
    if (registrosPorPaginaSelect) {
        registrosPorPaginaSelect.addEventListener('change', (e) => {
            registrosPorPagina = parseInt(e.target.value);
            paginaActual = 1;
            actualizarTabla();
            actualizarPaginacion();
        });
    }
};

// Lógica para toggle en móvil (simplificada como en socios.js)
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
const inicializarInventario = () => {
    console.log('Inicializando inventario...');
    
    // Generar datos simulados y configurar la tabla inicial
    generateMockInventoryData();
    console.log(`Productos generados: ${todosLosProductos.length}`);
    
    productosFiltrados = todosLosProductos.filter(p => p.activo);
    console.log(`Productos activos filtrados: ${productosFiltrados.length}`);
    
    // Configurar event listeners
    configurarEventListeners();
    configurarModal();
    configurarModalCompras(); // Nuevo: configurar modal de compras
    
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();

    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    console.log('Inventario inicializado correctamente');
};

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarInventario);
} else {
    inicializarInventario();
}