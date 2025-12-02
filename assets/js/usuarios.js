// ================================================
// USUARIOS.JS - GESTIÓN DE USUARIOS DEL SISTEMA
// Basado en la estructura de socios.js, inventario.js y reportes.js
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
let totalUsuarios = 24;
let usuariosFiltrados = [];
let todosLosUsuarios = []; // Datos simulados - reemplazar con API calls
let usuarioEditando = null; // Para modo edición

// -----------------------------------------------------------
// DATOS SIMULADOS (Reemplazar con llamadas a API)
// -----------------------------------------------------------
const generateMockUsersData = () => {
    const nombres = ['Carlos Rodríguez', 'María González', 'Juan López', 'Ana Martínez', 'Luis Sánchez', 'Laura García', 'Pedro Torres', 'Carmen Ruiz', 'Miguel Jiménez', 'Elena Morales'];
    const apellidos = ['Admin', 'López', 'García', 'Martínez', 'González', 'Rodríguez', 'Sánchez', 'Torres', 'Ruiz', 'Morales'];
    const roles = ['admin', 'moderador', 'empleado', 'invitado'];
    const departamentos = ['administracion', 'ventas', 'operaciones', 'marketing', 'soporte'];
    const estados = ['activo', 'inactivo', 'bloqueado'];
    
    const nombresUsuario = ['crodriguez', 'mgonzalez', 'jlopez', 'amartinez', 'lsanchez', 'lgarcia', 'ptorres', 'cruiz', 'mjimenez', 'emorales'];
    const dominios = ['hexodus.com', 'empresa.mx', 'gym.com'];
    
    for (let i = 1; i <= 24; i++) {
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const username = `${nombresUsuario[Math.floor(Math.random() * nombresUsuario.length)]}${i}`;
        const dominio = dominios[Math.floor(Math.random() * dominios.length)];
        const rol = i <= 5 ? 'admin' : roles[Math.floor(Math.random() * roles.length)]; // Primeros 5 son admin
        const departamento = departamentos[Math.floor(Math.random() * departamentos.length)];
        const estado = Math.random() > 0.15 ? 'activo' : estados[Math.floor(Math.random() * estados.length)]; // 85% activos
        
        // Fechas realistas
        const fechaCreacion = new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000); // Últimos 2 años
        const ultimoAcceso = estado === 'activo' ? 
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : // Último mes para activos
            new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Últimos 6 meses para inactivos
        
        // Permisos basados en rol
        const permisosPorRol = {
            'admin': ['usuarios', 'socios', 'ventas', 'inventario', 'reportes', 'configuracion'],
            'moderador': ['socios', 'ventas', 'inventario', 'reportes'],
            'empleado': ['socios', 'ventas'],
            'invitado': ['socios']
        };
        
        todosLosUsuarios.push({
            id: 2000 + i,
            nombre: nombre,
            username: username,
            email: `${username}@${dominio}`,
            telefono: `+52 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
            rol: rol,
            departamento: departamento,
            estado: estado,
            fechaCreacion: fechaCreacion,
            ultimoAcceso: ultimoAcceso,
            permisos: permisosPorRol[rol] || [],
            sesionActiva: estado === 'activo' && Math.random() > 0.5, // 50% de usuarios activos tienen sesión activa
            activo: true // Para soft delete
        });
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    todosLosUsuarios.sort((a, b) => b.fechaCreacion - a.fechaCreacion);
};

// -----------------------------------------------------------
// FUNCIONES DE PAGINACIÓN (Reutilizadas y adaptadas)
// -----------------------------------------------------------
const actualizarPaginacion = () => {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, usuariosFiltrados.length);
    
    // Actualizar información de registros
    document.getElementById('registros-inicio-usuarios').textContent = inicio;
    document.getElementById('registros-fin-usuarios').textContent = fin;
    document.getElementById('total-registros-usuarios').textContent = usuariosFiltrados.length;
    document.getElementById('total-usuarios').textContent = `${usuariosFiltrados.length} usuarios`;
    
    // Actualizar botones de navegación
    document.getElementById('btn-primera-pagina-usuarios').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-anterior-usuarios').disabled = paginaActual === 1;
    document.getElementById('btn-pagina-siguiente-usuarios').disabled = paginaActual === totalPaginas;
    document.getElementById('btn-ultima-pagina-usuarios').disabled = paginaActual === totalPaginas;
    
    // Generar números de página
    generarNumerosPagina(totalPaginas);
};

const generarNumerosPagina = (totalPaginas) => {
    const container = document.getElementById('numeros-pagina-usuarios');
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
    const estadoFiltro = document.getElementById('estado-filtro').value;
    const rolFiltro = document.getElementById('rol-filtro').value;
    const departamentoFiltro = document.getElementById('departamento-filtro').value;
    
    usuariosFiltrados = todosLosUsuarios.filter(usuario => {
        // Filtro de estado
        const coincideEstado = estadoFiltro === 'todos' || usuario.estado === estadoFiltro;
        
        // Filtro de rol
        const coincideRol = rolFiltro === 'todos' || usuario.rol === rolFiltro;
        
        // Filtro de departamento
        const coincideDepartamento = departamentoFiltro === 'todos' || usuario.departamento === departamentoFiltro;
        
        return coincideEstado && coincideRol && coincideDepartamento && usuario.activo;
    });
    
    paginaActual = 1; // Reset a la primera página
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

const limpiarFiltros = () => {
    document.getElementById('estado-filtro').value = 'todos';
    document.getElementById('rol-filtro').value = 'todos';
    document.getElementById('departamento-filtro').value = 'todos';
    usuariosFiltrados = todosLosUsuarios.filter(u => u.activo);
    paginaActual = 1;
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();
};

// -----------------------------------------------------------
// FUNCIÓN PARA ACTUALIZAR LA TABLA
// -----------------------------------------------------------
const actualizarTabla = () => {
    const tbody = document.getElementById('tabla-usuarios-body');
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = usuariosPagina.map(usuario => generarFilaUsuario(usuario)).join('');
    
    // Re-inicializar iconos de Lucide para las nuevas filas
    lucide.createIcons();
};

const generarFilaUsuario = (usuario) => {
    const rolInfo = obtenerInfoRol(usuario.rol);
    const estadoInfo = obtenerInfoEstado(usuario.estado);
    const departamentoInfo = obtenerInfoDepartamento(usuario.departamento);
    const fechaUltimoAcceso = usuario.ultimoAcceso.toLocaleDateString('es-ES');
    const horaUltimoAcceso = usuario.ultimoAcceso.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const indicadorSesion = usuario.sesionActiva ? '<span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>' : '';
    
    return `
        <tr class="hover:bg-gray-700 transition duration-200 cursor-pointer">
            <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center" style="background-color: rgba(0, 191, 255, 0.2);">
                            <span class="text-sm font-bold" style="color: var(--color-azul-acento);">#${usuario.id}</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-semibold text-white">${usuario.nombre}</div>
                        <div class="text-xs text-gray-400">@${usuario.username}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div>
                    <div class="text-white font-semibold">${usuario.email}</div>
                    <div class="text-gray-400">${usuario.telefono}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium rol-${usuario.rol}">
                    ${rolInfo.icon} ${rolInfo.nombre}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium depto-${usuario.departamento}">
                    ${departamentoInfo.icon} ${departamentoInfo.nombre}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full estado-${usuario.estado}">
                    ${indicadorSesion}${estadoInfo.icon} ${estadoInfo.nombre}
                </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm">
                <div>
                    <div class="text-white font-semibold">${fechaUltimoAcceso}</div>
                    <div class="text-gray-400">${horaUltimoAcceso}</div>
                </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex items-center justify-center space-x-2">
                    <button class="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition duration-200" title="Ver Detalles" onclick="verDetalleUsuario(${usuario.id})">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition duration-200" title="Editar" onclick="editarUsuario(${usuario.id})">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition duration-200" title="Cambiar Estado" onclick="cambiarEstadoUsuario(${usuario.id})">
                        <i data-lucide="toggle-left" class="w-4 h-4"></i>
                    </button>
                    <button class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition duration-200" title="Eliminar" onclick="eliminarUsuario(${usuario.id})">
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
const obtenerInfoRol = (rol) => {
    const info = {
        'admin': { nombre: 'Administrador', icon: '🛡️' },
        'moderador': { nombre: 'Moderador', icon: '⚖️' },
        'empleado': { nombre: 'Empleado', icon: '👤' },
        'invitado': { nombre: 'Invitado', icon: '👁️' }
    };
    return info[rol] || info['empleado'];
};

const obtenerInfoEstado = (estado) => {
    const info = {
        'activo': { nombre: 'Activo', icon: '✅' },
        'inactivo': { nombre: 'Inactivo', icon: '❌' },
        'bloqueado': { nombre: 'Bloqueado', icon: '🚫' }
    };
    return info[estado] || info['activo'];
};

const obtenerInfoDepartamento = (departamento) => {
    const info = {
        'administracion': { nombre: 'Administración', icon: '🏛️' },
        'ventas': { nombre: 'Ventas', icon: '💼' },
        'operaciones': { nombre: 'Operaciones', icon: '⚙️' },
        'marketing': { nombre: 'Marketing', icon: '📢' },
        'soporte': { nombre: 'Soporte', icon: '🎧' }
    };
    return info[departamento] || info['administracion'];
};

const actualizarKPIs = () => {
    const usuariosActivos = todosLosUsuarios.filter(u => u.activo);
    const usuariosActivosEstado = usuariosActivos.filter(u => u.estado === 'activo').length;
    const administradores = usuariosActivos.filter(u => u.rol === 'admin').length;
    const sesionesActivas = usuariosActivos.filter(u => u.sesionActiva).length;
    
    document.querySelector('.tarjeta-kpi:nth-child(1) .text-3xl').textContent = usuariosActivos.length;
    document.querySelector('.tarjeta-kpi:nth-child(2) .text-3xl').textContent = usuariosActivosEstado;
    document.querySelector('.tarjeta-kpi:nth-child(3) .text-3xl').textContent = administradores;
    
    // Actualizar último acceso (simular tiempo real)
    const ultimoAcceso = Math.floor(Math.random() * 10) + 1;
    document.querySelector('.tarjeta-kpi:nth-child(4) .text-3xl').textContent = `${ultimoAcceso}m`;
    
    // Actualizar contador de sesiones activas
    const contadorAdmin = document.querySelector('#sesiones-activas .text-green-400');
    if (contadorAdmin) {
        contadorAdmin.textContent = `${Math.floor(sesionesActivas * 0.4)} online`; // ~40% admin
    }
};

// -----------------------------------------------------------
// FUNCIONES DE GESTIÓN DE USUARIOS
// -----------------------------------------------------------
const verDetalleUsuario = (usuarioId) => {
    const usuario = todosLosUsuarios.find(u => u.id === usuarioId);
    if (usuario) {
        const fechaCreacion = usuario.fechaCreacion.toLocaleString('es-ES');
        const ultimoAcceso = usuario.ultimoAcceso.toLocaleString('es-ES');
        const permisos = usuario.permisos.join(', ');
        alert(`Usuario: ${usuario.nombre}\\nEmail: ${usuario.email}\\nRol: ${usuario.rol}\\nDepartamento: ${usuario.departamento}\\nEstado: ${usuario.estado}\\nCreado: ${fechaCreacion}\\nÚltimo acceso: ${ultimoAcceso}\\nPermisos: ${permisos}`);
    }
};

const editarUsuario = (usuarioId) => {
    const usuario = todosLosUsuarios.find(u => u.id === usuarioId);
    if (usuario) {
        usuarioEditando = usuario;
        abrirModalUsuario(false); // false = modo edición
        llenarFormularioUsuario(usuario);
    }
};

const cambiarEstadoUsuario = (usuarioId) => {
    const usuario = todosLosUsuarios.find(u => u.id === usuarioId);
    if (usuario) {
        const nuevosEstados = {
            'activo': 'inactivo',
            'inactivo': 'activo',
            'bloqueado': 'activo'
        };
        
        const nuevoEstado = nuevosEstados[usuario.estado];
        if (confirm(`¿Cambiar estado de ${usuario.nombre} a ${nuevoEstado}?`)) {
            usuario.estado = nuevoEstado;
            usuario.sesionActiva = nuevoEstado === 'activo' ? Math.random() > 0.5 : false;
            
            aplicarFiltros();
            mostrarNotificacion(`✅ Estado de usuario actualizado a ${nuevoEstado}`, 'success');
        }
    }
};

const eliminarUsuario = (usuarioId) => {
    const usuario = todosLosUsuarios.find(u => u.id === usuarioId);
    if (usuario) {
        if (confirm(`¿Está seguro de que desea eliminar al usuario ${usuario.nombre}?`)) {
            usuario.activo = false; // Soft delete
            aplicarFiltros();
            mostrarNotificacion('✅ Usuario eliminado correctamente', 'success');
        }
    }
};

// -----------------------------------------------------------
// FUNCIONES DEL MODAL
// -----------------------------------------------------------
const configurarModal = () => {
    const modal = document.getElementById('modal-usuario');
    const btnAgregarUsuario = document.getElementById('btn-agregar-usuario');
    const btnCerrar = document.getElementById('btn-cerrar-modal-usuario');
    const btnCancelar = document.getElementById('btn-cancelar-usuario');
    const formUsuario = document.getElementById('form-usuario');

    if (btnAgregarUsuario) {
        btnAgregarUsuario.addEventListener('click', () => {
            abrirModalUsuario(true); // true = modo agregar
        });
    }

    const abrirModalUsuario = (esNuevoUsuario = true) => {
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            const titulo = document.getElementById('titulo-modal-usuario');
            const btnGuardar = document.getElementById('btn-guardar-usuario');
            const seccionPassword = document.getElementById('seccion-password');
            
            if (esNuevoUsuario) {
                titulo.textContent = 'Agregar Nuevo Usuario';
                btnGuardar.textContent = 'CREAR USUARIO';
                seccionPassword.style.display = 'block';
                formUsuario.reset();
                usuarioEditando = null;
            } else {
                titulo.textContent = 'Editar Usuario';
                btnGuardar.textContent = 'ACTUALIZAR USUARIO';
                seccionPassword.style.display = 'none';
            }
        }
        lucide.createIcons();
    };

    const llenarFormularioUsuario = (usuario) => {
        document.getElementById('nombre-usuario').value = usuario.nombre;
        document.getElementById('email-usuario').value = usuario.email;
        document.getElementById('telefono-usuario').value = usuario.telefono || '';
        document.getElementById('username-usuario').value = usuario.username;
        document.getElementById('rol-usuario').value = usuario.rol;
        document.getElementById('departamento-usuario').value = usuario.departamento;
        document.getElementById('estado-usuario').value = usuario.estado;
        
        // Marcar permisos
        const checkboxes = document.querySelectorAll('input[name=\"permisos\"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = usuario.permisos.includes(checkbox.value);
        });
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            if (formUsuario) {
                formUsuario.reset();
            }
            usuarioEditando = null;
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
    if (formUsuario) {
        formUsuario.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(formUsuario);
            
            // Validaciones básicas
            const nombre = formData.get('nombre-usuario');
            const email = formData.get('email-usuario');
            const username = formData.get('username-usuario');
            const rol = formData.get('rol-usuario');
            const departamento = formData.get('departamento-usuario');
            
            if (!nombre || !email || !username || !rol || !departamento) {
                mostrarNotificacion('❌ Por favor complete todos los campos obligatorios', 'error');
                return;
            }
            
            // Validar contraseñas si es usuario nuevo
            if (!usuarioEditando) {
                const password = formData.get('password-usuario');
                const confirmarPassword = formData.get('confirmar-password');
                
                if (!password || password.length < 6) {
                    mostrarNotificacion('❌ La contraseña debe tener al menos 6 caracteres', 'error');
                    return;
                }
                
                if (password !== confirmarPassword) {
                    mostrarNotificacion('❌ Las contraseñas no coinciden', 'error');
                    return;
                }
            }
            
            // Validar email único
            const emailExiste = todosLosUsuarios.some(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.id !== (usuarioEditando?.id || 0)
            );
            
            if (emailExiste) {
                mostrarNotificacion('❌ Este email ya está registrado', 'error');
                return;
            }
            
            // Validar username único
            const usernameExiste = todosLosUsuarios.some(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.id !== (usuarioEditando?.id || 0)
            );
            
            if (usernameExiste) {
                mostrarNotificacion('❌ Este nombre de usuario ya existe', 'error');
                return;
            }
            
            // Recopilar permisos seleccionados
            const permisosSeleccionados = [];
            const checkboxes = document.querySelectorAll('input[name=\"permisos\"]:checked');
            checkboxes.forEach(checkbox => {
                permisosSeleccionados.push(checkbox.value);
            });
            
            if (usuarioEditando) {
                // Actualizar usuario existente
                usuarioEditando.nombre = nombre;
                usuarioEditando.email = email;
                usuarioEditando.telefono = formData.get('telefono-usuario') || '';
                usuarioEditando.username = username;
                usuarioEditando.rol = rol;
                usuarioEditando.departamento = departamento;
                usuarioEditando.estado = formData.get('estado-usuario');
                usuarioEditando.permisos = permisosSeleccionados;
                
                mostrarNotificacion('✅ Usuario actualizado exitosamente', 'success');
            } else {
                // Crear nuevo usuario
                const nuevoUsuario = {
                    id: Math.max(...todosLosUsuarios.map(u => u.id)) + 1,
                    nombre: nombre,
                    username: username,
                    email: email,
                    telefono: formData.get('telefono-usuario') || '',
                    rol: rol,
                    departamento: departamento,
                    estado: formData.get('estado-usuario'),
                    fechaCreacion: new Date(),
                    ultimoAcceso: new Date(),
                    permisos: permisosSeleccionados,
                    sesionActiva: false,
                    activo: true
                };
                
                todosLosUsuarios.unshift(nuevoUsuario); // Agregar al inicio
                mostrarNotificacion('✅ Usuario creado exitosamente', 'success');
            }
            
            aplicarFiltros();
            closeModal();
        });
    }

    // Exponer función para uso externo
    window.abrirModalUsuario = abrirModalUsuario;
    window.llenarFormularioUsuario = llenarFormularioUsuario;
};

// -----------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------
const configurarEventListeners = () => {
    // Event listeners para filtros
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros-usuarios');
    const btnReestablecerFiltros = document.getElementById('btn-restablecer-filtros');
    const estadoFiltro = document.getElementById('estado-filtro');
    const rolFiltro = document.getElementById('rol-filtro');
    const departamentoFiltro = document.getElementById('departamento-filtro');
    
    if (btnAplicarFiltros) btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    if (btnReestablecerFiltros) btnReestablecerFiltros.addEventListener('click', limpiarFiltros);
    if (estadoFiltro) estadoFiltro.addEventListener('change', aplicarFiltros);
    if (rolFiltro) rolFiltro.addEventListener('change', aplicarFiltros);
    if (departamentoFiltro) departamentoFiltro.addEventListener('change', aplicarFiltros);
    
    // Event listeners para paginación
    const btnPrimeraPagina = document.getElementById('btn-primera-pagina-usuarios');
    const btnPaginaAnterior = document.getElementById('btn-pagina-anterior-usuarios');
    const btnPaginaSiguiente = document.getElementById('btn-pagina-siguiente-usuarios');
    const btnUltimaPagina = document.getElementById('btn-ultima-pagina-usuarios');
    
    if (btnPrimeraPagina) btnPrimeraPagina.addEventListener('click', () => cambiarPagina(1));
    if (btnPaginaAnterior) btnPaginaAnterior.addEventListener('click', () => cambiarPagina(Math.max(1, paginaActual - 1)));
    if (btnPaginaSiguiente) btnPaginaSiguiente.addEventListener('click', () => {
        const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
        cambiarPagina(Math.min(totalPaginas, paginaActual + 1));
    });
    if (btnUltimaPagina) btnUltimaPagina.addEventListener('click', () => {
        const totalPaginas = Math.ceil(usuariosFiltrados.length / registrosPorPagina);
        cambiarPagina(totalPaginas);
    });
    
    // Event listener para cambiar registros por página
    const registrosPorPaginaSelect = document.getElementById('registros-por-pagina-usuarios');
    if (registrosPorPaginaSelect) {
        registrosPorPaginaSelect.addEventListener('change', (e) => {
            registrosPorPagina = parseInt(e.target.value);
            paginaActual = 1;
            actualizarTabla();
            actualizarPaginacion();
        });
    }
};

// Sistema de notificaciones (Reutilizado de reportes.js)
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

// Lógica para toggle en móvil (Reutilizada)
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
const inicializarUsuarios = () => {
    console.log('Inicializando usuarios...');
    
    // Generar datos simulados y configurar la tabla inicial
    generateMockUsersData();
    console.log(`Usuarios generados: ${todosLosUsuarios.length}`);
    
    usuariosFiltrados = todosLosUsuarios.filter(u => u.activo);
    console.log(`Usuarios activos filtrados: ${usuariosFiltrados.length}`);
    
    // Configurar event listeners
    configurarEventListeners();
    configurarModal();
    
    actualizarTabla();
    actualizarPaginacion();
    actualizarKPIs();

    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    console.log('Usuarios inicializados correctamente');
};

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarUsuarios);
} else {
    inicializarUsuarios();
}