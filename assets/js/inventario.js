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
// FUNCIONES DEL MODAL
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

    // Validación y envío del formulario
    if (formProducto) {
        formProducto.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(formProducto);
            const editId = formProducto.dataset.editId;
            
            const productoData = {
                nombre: formData.get('nombre-producto'),
                codigo: formData.get('codigo-producto'),
                categoria: formData.get('categoria-producto'),
                marca: formData.get('marca-producto'),
                precioCompra: parseFloat(formData.get('precio-compra')),
                precioVenta: parseFloat(formData.get('precio-venta')),
                stockActual: parseInt(formData.get('stock-inicial')),
                stockMinimo: parseInt(formData.get('stock-minimo')) || 5,
                ubicacion: formData.get('ubicacion-producto') || 'Sin asignar',
                descripcion: formData.get('descripcion-producto') || '',
                fechaActualizacion: new Date(),
                activo: true
            };
            
            // Determinar estado del stock
            if (productoData.stockActual === 0) {
                productoData.estadoStock = 'agotado';
            } else if (productoData.stockActual <= productoData.stockMinimo) {
                productoData.estadoStock = 'bajo';
            } else {
                productoData.estadoStock = 'disponible';
            }
            
            if (editId) {
                // Actualizar producto existente
                const producto = todosLosProductos.find(p => p.id === parseInt(editId));
                if (producto) {
                    Object.assign(producto, productoData);
                    mostrarNotificacion('✅ Producto actualizado exitosamente', 'success');
                }
            } else {
                // Crear nuevo producto
                const nuevoId = Math.max(...todosLosProductos.map(p => p.id)) + 1;
                productoData.id = nuevoId;
                todosLosProductos.push(productoData);
                mostrarNotificacion('✅ Producto creado exitosamente', 'success');
            }
            
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