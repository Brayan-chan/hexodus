// ================================================
// SETTINGS.JS - CONFIGURACIÓN DEL SISTEMA HEXODUS
// Basado en la estructura de otros módulos pero especializado para configuración
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
// VARIABLES GLOBALES DE CONFIGURACIÓN
// -----------------------------------------------------------
let configuracionActual = {};
let configuracionPorDefecto = {};
let cambiosPendientes = {};
let configuracionGuardada = true;

// -----------------------------------------------------------
// CONFIGURACIÓN POR DEFECTO DEL SISTEMA
// -----------------------------------------------------------
const inicializarConfiguracionPorDefecto = () => {
    configuracionPorDefecto = {
        apariencia: {
            colorPrincipal: '#FF3B3B',
            colorSecundario: '#00BFFF',
            modoTema: 'dark',
            nombreSistema: 'HEXODUS',
            logoUrl: '../assets/images/icon.png'
        },
        idioma: {
            idiomaSistema: 'es-MX',
            zonaHoraria: 'America/Mexico_City',
            formatoFecha: 'DD/MM/YYYY'
        },
        notificaciones: {
            push: true,
            email: true,
            sounds: false,
            tipos: {
                socios: true,
                vencimientos: true,
                ventas: true,
                inventario: true
            }
        },
        avanzado: {
            backupAuto: true,
            backupFrecuencia: 'daily',
            cacheSistema: true,
            compresion: true,
            lazyLoading: true
        }
    };

    // Cargar configuración desde localStorage o usar por defecto
    const configGuardada = localStorage.getItem('hexodus_config');
    if (configGuardada) {
        try {
            configuracionActual = JSON.parse(configGuardada);
            // Fusionar con defaults para nuevas propiedades
            configuracionActual = fusionarConfiguracion(configuracionPorDefecto, configuracionActual);
        } catch (error) {
            console.error('Error cargando configuración guardada:', error);
            configuracionActual = { ...configuracionPorDefecto };
        }
    } else {
        configuracionActual = { ...configuracionPorDefecto };
    }
};

// Función para fusionar configuraciones
const fusionarConfiguracion = (defaults, saved) => {
    const resultado = { ...defaults };
    
    Object.keys(saved).forEach(categoria => {
        if (typeof saved[categoria] === 'object' && !Array.isArray(saved[categoria])) {
            resultado[categoria] = { ...defaults[categoria], ...saved[categoria] };
        } else {
            resultado[categoria] = saved[categoria];
        }
    });
    
    return resultado;
};

// -----------------------------------------------------------
// FUNCIONES DE GESTIÓN DE LA CONFIGURACIÓN
// -----------------------------------------------------------
const cargarConfiguracionEnUI = () => {
    // Cargar apariencia
    document.getElementById('color-principal').value = configuracionActual.apariencia.colorPrincipal;
    document.getElementById('color-principal-hex').value = configuracionActual.apariencia.colorPrincipal;
    document.getElementById('color-secundario').value = configuracionActual.apariencia.colorSecundario;
    document.getElementById('color-secundario-hex').value = configuracionActual.apariencia.colorSecundario;
    document.getElementById('modo-tema').value = configuracionActual.apariencia.modoTema;
    document.getElementById('nombre-sistema').value = configuracionActual.apariencia.nombreSistema;

    // Cargar idioma
    document.getElementById('idioma-sistema').value = configuracionActual.idioma.idiomaSistema;
    document.getElementById('zona-horaria').value = configuracionActual.idioma.zonaHoraria;
    document.getElementById('formato-fecha').value = configuracionActual.idioma.formatoFecha;

    // Cargar notificaciones
    document.getElementById('notif-push').checked = configuracionActual.notificaciones.push;
    document.getElementById('notif-email').checked = configuracionActual.notificaciones.email;
    document.getElementById('notif-sounds').checked = configuracionActual.notificaciones.sounds;
    document.getElementById('notif-socios').checked = configuracionActual.notificaciones.tipos.socios;
    document.getElementById('notif-vencimientos').checked = configuracionActual.notificaciones.tipos.vencimientos;
    document.getElementById('notif-ventas').checked = configuracionActual.notificaciones.tipos.ventas;
    document.getElementById('notif-inventario').checked = configuracionActual.notificaciones.tipos.inventario;

    // Cargar configuración avanzada
    document.getElementById('backup-auto').checked = configuracionActual.avanzado.backupAuto;
    document.getElementById('backup-frecuencia').value = configuracionActual.avanzado.backupFrecuencia;
    document.getElementById('cache-sistema').checked = configuracionActual.avanzado.cacheSistema;
    document.getElementById('compresion').checked = configuracionActual.avanzado.compresion;
    document.getElementById('lazy-loading').checked = configuracionActual.avanzado.lazyLoading;

    // Actualizar KPIs
    actualizarKPIsConfiguracion();

    // Aplicar configuración actual al sistema
    aplicarConfiguracionAlSistema();
};

const guardarConfiguracion = () => {
    try {
        // Crear objeto de configuración desde la UI
        const nuevaConfig = {
            apariencia: {
                colorPrincipal: document.getElementById('color-principal').value,
                colorSecundario: document.getElementById('color-secundario').value,
                modoTema: document.getElementById('modo-tema').value,
                nombreSistema: document.getElementById('nombre-sistema').value,
                logoUrl: configuracionActual.apariencia.logoUrl // Mantener logo actual
            },
            idioma: {
                idiomaSistema: document.getElementById('idioma-sistema').value,
                zonaHoraria: document.getElementById('zona-horaria').value,
                formatoFecha: document.getElementById('formato-fecha').value
            },
            notificaciones: {
                push: document.getElementById('notif-push').checked,
                email: document.getElementById('notif-email').checked,
                sounds: document.getElementById('notif-sounds').checked,
                tipos: {
                    socios: document.getElementById('notif-socios').checked,
                    vencimientos: document.getElementById('notif-vencimientos').checked,
                    ventas: document.getElementById('notif-ventas').checked,
                    inventario: document.getElementById('notif-inventario').checked
                }
            },
            avanzado: {
                backupAuto: document.getElementById('backup-auto').checked,
                backupFrecuencia: document.getElementById('backup-frecuencia').value,
                cacheSistema: document.getElementById('cache-sistema').checked,
                compresion: document.getElementById('compresion').checked,
                lazyLoading: document.getElementById('lazy-loading').checked
            }
        };

        // Guardar en localStorage con manejo de errores de cuota
        try {
            const configString = JSON.stringify(nuevaConfig);
            
            // Verificar tamaño antes de guardar
            if (configString.length > 5000000) { // 5MB aproximado
                throw new Error('Configuración demasiado grande');
            }
            
            localStorage.setItem('hexodus_config', configString);
            configuracionActual = nuevaConfig;
            cambiosPendientes = {};
            configuracionGuardada = true;
        } catch (quotaError) {
            if (quotaError.name === 'QuotaExceededError' || quotaError.message.includes('quota')) {
                // Intentar limpiar localStorage de datos antiguos
                limpiarDatosAntiguos();
                
                // Intentar guardar sin el logo si es muy grande
                const configSinLogo = { ...nuevaConfig };
                if (configSinLogo.apariencia && configSinLogo.apariencia.logoUrl) {
                    delete configSinLogo.apariencia.logoUrl;
                    try {
                        localStorage.setItem('hexodus_config', JSON.stringify(configSinLogo));
                        mostrarNotificacion('⚠️ Configuración guardada pero el logo fue omitido por exceder el límite', 'warning');
                    } catch (secondError) {
                        throw new Error('No se pudo guardar la configuración - Storage lleno');
                    }
                } else {
                    throw new Error('No se pudo guardar la configuración - Storage lleno');
                }
            } else {
                throw quotaError;
            }
        }

        // Aplicar configuración al sistema
        aplicarConfiguracionAlSistema();
        
        // Notificar cambio de configuración a otras vistas
        if (window.HexodusGlobalConfig) {
            window.HexodusGlobalConfig.notificarCambio();
        }
        
        // Forzar aplicación en la vista actual
        setTimeout(() => {
            if (window.HexodusGlobalConfig) {
                window.HexodusGlobalConfig.aplicar();
            }
        }, 100);

        // Actualizar KPIs y UI
        actualizarKPIsConfiguracion();
        actualizarEstadoGuardado();

        mostrarNotificacion('✅ Configuración guardada exitosamente', 'success');

        // Mostrar efecto visual en elementos guardados
        document.querySelectorAll('.tarjeta').forEach(tarjeta => {
            tarjeta.classList.add('config-saved');
            setTimeout(() => tarjeta.classList.remove('config-saved'), 2000);
        });

    } catch (error) {
        console.error('Error guardando configuración:', error);
        mostrarNotificacion('❌ Error al guardar la configuración', 'error');
    }
};

// Función para limpiar datos antiguos del localStorage
const limpiarDatosAntiguos = () => {
    try {
        console.log('Iniciando limpieza de localStorage...');
        
        // Eliminar configuraciones antiguas que puedan existir
        const clavesALimpiar = [
            'configuracionSistema',
            'hexodus_temp_config',
            'hexodus_backup_config',
            'hexodus_cache_data'
        ];
        
        clavesALimpiar.forEach(clave => {
            if (localStorage.getItem(clave)) {
                localStorage.removeItem(clave);
                console.log(`Eliminado ${clave} del localStorage`);
            }
        });
        
        // También limpiar elementos que empiecen con ciertos prefijos
        const todasLasClaves = Object.keys(localStorage);
        todasLasClaves.forEach(clave => {
            if (clave.startsWith('hexodus_old_') || clave.startsWith('temp_')) {
                localStorage.removeItem(clave);
                console.log(`Eliminado ${clave} del localStorage`);
            }
        });
        
        console.log('Limpieza de localStorage completada');
    } catch (error) {
        console.error('Error limpiando localStorage:', error);
    }
};

// Función para aplicar cambios inmediatamente a TODAS las ventanas abiertas
const aplicarCambiosInmediato = () => {
    try {
        console.log('🚀 APLICANDO CAMBIOS INMEDIATOS...');
        
        // 1. Obtener configuración actual del formulario
        const configFormulario = {
            sistema: {
                nombre: document.getElementById('nombre-sistema').value || 'HEXODUS'
            },
            apariencia: {
                colorPrincipal: document.getElementById('color-principal').value,
                colorSecundario: document.getElementById('color-secundario').value,
                modoTema: document.getElementById('modo-tema').value,
                logoUrl: configuracionActual.apariencia?.logoUrl
            }
        };
        
        // 2. Guardar temporalmente en localStorage
        const configActual = obtenerConfiguracionGlobal ? obtenerConfiguracionGlobal() : configuracionActual;
        const configCompleta = { ...configActual, ...configFormulario };
        
        try {
            localStorage.setItem('configuracionSistema', JSON.stringify(configCompleta));
        } catch (quotaError) {
            console.warn('Error guardando en localStorage, continuando sin persistencia:', quotaError);
        }
        
        // 3. Aplicar a la ventana actual múltiples veces
        console.log('Aplicando a ventana actual:', configCompleta);
        aplicarConfiguracionAlSistema(configCompleta);
        
        // Aplicar con diferentes métodos para asegurar que funcione
        setTimeout(() => aplicarConfiguracionAlSistema(configCompleta), 50);
        setTimeout(() => aplicarConfiguracionAlSistema(configCompleta), 200);
        setTimeout(() => aplicarConfiguracionAlSistema(configCompleta), 500);
        
        // 4. Forzar actualización del sistema global si existe
        if (window.HexodusGlobalConfig) {
            window.HexodusGlobalConfig.aplicar();
            setTimeout(() => window.HexodusGlobalConfig.aplicar(), 100);
        }
        
        // 5. Notificar a todas las otras ventanas/tabs abiertas
        window.dispatchEvent(new CustomEvent('configuracionCambiada', { 
            detail: configCompleta 
        }));
        
        // 6. Usar BroadcastChannel para comunicación entre tabs
        if (typeof BroadcastChannel !== 'undefined') {
            const canal = new BroadcastChannel('hexodus-config');
            canal.postMessage({
                tipo: 'aplicar-configuracion',
                configuracion: configCompleta,
                timestamp: Date.now()
            });
            canal.close();
        }
        
        // 7. Actualizar localStorage con el método global también
        if (typeof window.aplicarConfiguracionGlobal === 'function') {
            window.aplicarConfiguracionGlobal();
        }
        
        mostrarNotificacion('⚡ Cambios aplicados inmediatamente a todas las ventanas', 'success');
        
        // Efecto visual en el botón
        const btn = document.getElementById('btn-aplicar-inmediato');
        btn.style.transform = 'scale(0.95)';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            btn.style.backgroundColor = '';
        }, 200);
        
    } catch (error) {
        console.error('Error aplicando cambios inmediatos:', error);
        mostrarNotificacion('❌ Error al aplicar cambios inmediatos', 'error');
    }
};

const aplicarConfiguracionAlSistema = () => {
    console.log('Aplicando configuración al sistema local...', configuracionActual);
    
    // Aplicar colores personalizados
    document.documentElement.style.setProperty('--color-rojo-principal', configuracionActual.apariencia.colorPrincipal);
    document.documentElement.style.setProperty('--color-azul-acento', configuracionActual.apariencia.colorSecundario);

    // Aplicar tema
    document.documentElement.setAttribute('data-theme', configuracionActual.apariencia.modoTema);

    // Aplicar nombre del sistema con múltiples selectores
    const aplicarNombreSistema = () => {
        console.log('Aplicando nombre del sistema:', configuracionActual.apariencia.nombreSistema);
        
        // Buscar todos los elementos posibles
        const selectores = [
            '#sidebar-logo-text',
            '#preview-logo-text',
            '[data-system-name]'
        ];
        
        selectores.forEach(selector => {
            const elementos = document.querySelectorAll(selector);
            console.log(`Elementos encontrados con ${selector}:`, elementos.length);
            elementos.forEach(elemento => {
                console.log('Actualizando elemento:', elemento);
                elemento.textContent = configuracionActual.apariencia.nombreSistema;
            });
        });
    };

    // Aplicar logo con múltiples selectores
    const aplicarLogoSistema = () => {
        console.log('Aplicando logo del sistema:', configuracionActual.apariencia.logoUrl);
        
        const selectores = [
            '#sidebar-logo-img',
            '#preview-logo-img', 
            '[data-system-logo]'
        ];
        
        selectores.forEach(selector => {
            const elementos = document.querySelectorAll(selector);
            console.log(`Elementos encontrados con ${selector}:`, elementos.length);
            elementos.forEach(elemento => {
                console.log('Actualizando logo elemento:', elemento);
                elemento.src = configuracionActual.apariencia.logoUrl;
            });
        });
    };

    // Aplicar inmediatamente
    aplicarNombreSistema();
    aplicarLogoSistema();
    
    // También aplicar con delay para asegurar que se aplique
    setTimeout(aplicarNombreSistema, 100);
    setTimeout(aplicarLogoSistema, 100);

    // Simular aplicación de otros ajustes
    console.log('Configuración aplicada localmente:', configuracionActual);
};

const restablecerConfiguracion = () => {
    if (confirm('¿Está seguro de que desea restablecer toda la configuración a los valores por defecto? Esta acción no se puede deshacer.')) {
        configuracionActual = { ...configuracionPorDefecto };
        localStorage.removeItem('hexodus_config');
        cargarConfiguracionEnUI();
        mostrarNotificacion('🔄 Configuración restablecida a valores por defecto', 'info');
    }
};

// -----------------------------------------------------------
// FUNCIONES DE MANEJO DE EVENTOS
// -----------------------------------------------------------
const configurarEventListeners = () => {
    // Botones principales
    document.getElementById('btn-guardar-configuracion').addEventListener('click', guardarConfiguracion);
    document.getElementById('btn-restablecer-configuracion').addEventListener('click', restablecerConfiguracion);
    document.getElementById('btn-aplicar-inmediato').addEventListener('click', aplicarCambiosInmediato);

    // Colores - sincronización entre color picker y texto
    const colorPrincipal = document.getElementById('color-principal');
    const colorPrincipalHex = document.getElementById('color-principal-hex');
    const colorSecundario = document.getElementById('color-secundario');
    const colorSecundarioHex = document.getElementById('color-secundario-hex');

    colorPrincipal.addEventListener('input', (e) => {
        colorPrincipalHex.value = e.target.value;
        marcarCambiosPendientes('apariencia');
        previsualizarCambios();
    });

    colorPrincipalHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorPrincipal.value = e.target.value;
            marcarCambiosPendientes('apariencia');
            previsualizarCambios();
        }
    });

    colorSecundario.addEventListener('input', (e) => {
        colorSecundarioHex.value = e.target.value;
        marcarCambiosPendientes('apariencia');
        previsualizarCambios();
    });

    colorSecundarioHex.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorSecundario.value = e.target.value;
            marcarCambiosPendientes('apariencia');
            previsualizarCambios();
        }
    });

    // Modo tema
    document.getElementById('modo-tema').addEventListener('change', (e) => {
        marcarCambiosPendientes('apariencia');
        previsualizarCambios();
    });

    // Nombre del sistema - aplicar cambios en tiempo real
    document.getElementById('nombre-sistema').addEventListener('input', (e) => {
        marcarCambiosPendientes('apariencia');
        const nuevoNombre = e.target.value || 'HEXODUS';
        document.getElementById('preview-logo-text').textContent = nuevoNombre;
        
        // Aplicar inmediatamente al sistema global
        const config = typeof obtenerConfiguracionGlobal !== 'undefined' 
            ? obtenerConfiguracionGlobal() 
            : configuracionActual;
        if (!config.sistema) config.sistema = {};
        config.sistema.nombre = nuevoNombre;
        
        try {
            localStorage.setItem('configuracionSistema', JSON.stringify(config));
            aplicarConfiguracionAlSistema(config);
        } catch (error) {
            console.warn('Error guardando configuración temporal:', error);
        }
        
        // Notificar a otras ventanas/tabs si están abiertas
        window.dispatchEvent(new CustomEvent('configuracionCambiada', { detail: config }));
    });

    // Upload de logo
    document.getElementById('logo-upload').addEventListener('change', manejarSubidaLogo);

    // Todos los selects e inputs de configuración
    const elementosConfig = document.querySelectorAll(
        '#idioma-sistema, #zona-horaria, #formato-fecha, ' +
        '#notif-push, #notif-email, #notif-sounds, #notif-socios, #notif-vencimientos, #notif-ventas, #notif-inventario, ' +
        '#backup-auto, #backup-frecuencia, #cache-sistema, #compresion, #lazy-loading'
    );

    elementosConfig.forEach(elemento => {
        elemento.addEventListener('change', () => {
            marcarCambiosPendientes();
        });
    });

    // Botones avanzados
    document.getElementById('btn-exportar-config').addEventListener('click', exportarConfiguracion);
    document.getElementById('btn-importar-config').addEventListener('click', () => {
        document.getElementById('import-config-file').click();
    });
    document.getElementById('import-config-file').addEventListener('change', importarConfiguracion);
    document.getElementById('btn-limpiar-cache').addEventListener('click', limpiarCache);
    document.getElementById('btn-backup-manual').addEventListener('click', realizarBackupManual);
};

// -----------------------------------------------------------
// FUNCIONES AUXILIARES
// -----------------------------------------------------------

// Función para obtener configuración actual del formulario
const obtenerConfiguracion = () => {
    return {
        sistema: {
            nombre: document.getElementById('nombre-sistema')?.value || 'HEXODUS'
        },
        apariencia: {
            colorPrincipal: document.getElementById('color-principal')?.value || '#FF3B3B',
            colorSecundario: document.getElementById('color-secundario')?.value || '#00BFFF',
            modoTema: document.getElementById('modo-tema')?.value || 'dark',
            logoUrl: configuracionActual?.apariencia?.logoUrl || '../assets/images/icon.png'
        },
        idioma: {
            idiomaSistema: document.getElementById('idioma-sistema')?.value || 'es',
            zonaHoraria: document.getElementById('zona-horaria')?.value || 'America/Mexico_City',
            formatoFecha: document.getElementById('formato-fecha')?.value || 'dd/mm/yyyy'
        },
        notificaciones: {
            push: document.getElementById('notif-push')?.checked || false,
            email: document.getElementById('notif-email')?.checked || false,
            sounds: document.getElementById('notif-sounds')?.checked || false,
            tipos: {
                socios: document.getElementById('notif-socios')?.checked || false,
                vencimientos: document.getElementById('notif-vencimientos')?.checked || false,
                ventas: document.getElementById('notif-ventas')?.checked || false,
                inventario: document.getElementById('notif-inventario')?.checked || false
            }
        },
        avanzado: {
            backupAuto: document.getElementById('backup-auto')?.checked || false,
            backupFrecuencia: document.getElementById('backup-frecuencia')?.value || 'diaria',
            cacheSistema: document.getElementById('cache-sistema')?.checked || false,
            compresion: document.getElementById('compresion')?.checked || false,
            lazyLoading: document.getElementById('lazy-loading')?.checked || false
        }
    };
};

const marcarCambiosPendientes = (categoria = null) => {
    configuracionGuardada = false;
    if (categoria) {
        cambiosPendientes[categoria] = true;
    }
    actualizarEstadoGuardado();
};

const actualizarEstadoGuardado = () => {
    const btnGuardar = document.getElementById('btn-guardar-configuracion');
    if (configuracionGuardada) {
        btnGuardar.innerHTML = '<i data-lucide="check" class="w-5 h-5 mr-2"></i> Configuración Guardada';
        btnGuardar.classList.remove('btn-principal');
        btnGuardar.classList.add('btn-secundario');
    } else {
        btnGuardar.innerHTML = '<i data-lucide="save" class="w-5 h-5 mr-2"></i> Guardar Cambios';
        btnGuardar.classList.remove('btn-secundario');
        btnGuardar.classList.add('btn-principal');
    }
    lucide.createIcons();
};

const previsualizarCambios = () => {
    // Previsualizar colores en tiempo real
    const colorPrincipal = document.getElementById('color-principal').value;
    const colorSecundario = document.getElementById('color-secundario').value;
    
    document.documentElement.style.setProperty('--color-rojo-principal', colorPrincipal);
    document.documentElement.style.setProperty('--color-azul-acento', colorSecundario);
    
    // Previsualizar tema
    const tema = document.getElementById('modo-tema').value;
    document.documentElement.setAttribute('data-theme', tema);
    
    // Actualizar display del tema activo
    const temaDisplay = {
        'dark': 'Oscuro',
        'light': 'Claro', 
        'auto': 'Automático'
    };
    document.getElementById('tema-activo-display').textContent = temaDisplay[tema] || 'Oscuro';
};

const manejarSubidaLogo = (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
        mostrarNotificacion('❌ Formato de imagen no válido. Use JPG, PNG, GIF o WebP', 'error');
        return;
    }

    // Validar tamaño inicial (máximo 10MB antes de compresión)
    const tamañoMaximo = 10 * 1024 * 1024;
    if (archivo.size > tamañoMaximo) {
        mostrarNotificacion('❌ La imagen es demasiado grande. Máximo 10MB', 'error');
        return;
    }

    // Mostrar indicador de carga
    mostrarNotificacion('🔄 Procesando imagen...', 'info');
    
    comprimirYGuardarImagen(archivo)
        .then(logoComprimido => {
            // Actualizar configuración
            if (!configuracionActual.apariencia) {
                configuracionActual.apariencia = {};
            }
            configuracionActual.apariencia.logoUrl = logoComprimido;
            
            // Actualizar preview
            document.getElementById('preview-logo-img').src = logoComprimido;
            if (document.getElementById('sidebar-logo-img')) {
                document.getElementById('sidebar-logo-img').src = logoComprimido;
            }
            
            marcarCambiosPendientes('apariencia');
            previsualizarCambios();
            
            mostrarNotificacion('✅ Logo cargado y optimizado exitosamente', 'success');
        })
        .catch(error => {
            console.error('Error procesando imagen:', error);
            mostrarNotificacion('❌ Error al procesar la imagen: ' + error.message, 'error');
        });
};

// Función para comprimir imágenes antes de guardarlas
const comprimirYGuardarImagen = (archivo) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calcular nuevas dimensiones (máximo 200x200 para logos)
            const maxWidth = 200;
            const maxHeight = 200;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a Base64 con calidad reducida
            const logoComprimido = canvas.toDataURL('image/jpeg', 0.7);
            
            // Verificar que no exceda el límite de localStorage (aprox 1MB)
            const tamañoBase64 = logoComprimido.length;
            if (tamañoBase64 > 1000000) { // 1MB en caracteres
                // Intentar con menor calidad
                const logoMasComprimido = canvas.toDataURL('image/jpeg', 0.4);
                if (logoMasComprimido.length > 1000000) {
                    reject(new Error('Imagen demasiado grande incluso después de compresión'));
                    return;
                }
                resolve(logoMasComprimido);
            } else {
                resolve(logoComprimido);
            }
        };
        
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        
        // Crear URL temporal para la imagen
        const lector = new FileReader();
        lector.onload = (e) => {
            img.src = e.target.result;
        };
        lector.readAsDataURL(archivo);
    });
};

const actualizarKPIsConfiguracion = () => {
    // Contar configuraciones activas
    let configActivas = 0;
    configActivas += configuracionActual.notificaciones.push ? 1 : 0;
    configActivas += configuracionActual.notificaciones.email ? 1 : 0;
    configActivas += configuracionActual.avanzado.backupAuto ? 1 : 0;
    configActivas += configuracionActual.avanzado.cacheSistema ? 1 : 0;
    configActivas += configuracionActual.avanzado.compresion ? 1 : 0;
    configActivas += configuracionActual.avanzado.lazyLoading ? 1 : 0;
    configActivas += 2; // Siempre tema + idioma activos

    document.querySelector('.tarjeta-kpi:nth-child(1) .text-3xl').textContent = configActivas;

    // Actualizar idioma display
    const idiomaMap = {
        'es-MX': 'ES',
        'en-US': 'EN',
        'es-ES': 'ES',
        'pt-BR': 'PT',
        'fr-FR': 'FR'
    };
    
    const idiomaActual = configuracionActual.idioma.idiomaSistema;
    document.getElementById('idioma-activo-display').textContent = idiomaMap[idiomaActual] || 'ES';

    // Actualizar última configuración
    document.getElementById('ultima-config-display').textContent = 'Ahora';
};

// -----------------------------------------------------------
// FUNCIONES DE IMPORTAR/EXPORTAR
// -----------------------------------------------------------
const exportarConfiguracion = () => {
    try {
        const configExport = {
            ...configuracionActual,
            exportDate: new Date().toISOString(),
            version: '2.1.3'
        };

        const blob = new Blob([JSON.stringify(configExport, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hexodus_config_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarNotificacion('📁 Configuración exportada exitosamente', 'success');
    } catch (error) {
        console.error('Error exportando configuración:', error);
        mostrarNotificacion('❌ Error al exportar la configuración', 'error');
    }
};

const importarConfiguracion = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const configImportada = JSON.parse(e.target.result);
                
                // Validar estructura básica
                if (configImportada.apariencia && configImportada.idioma && configImportada.notificaciones) {
                    configuracionActual = fusionarConfiguracion(configuracionPorDefecto, configImportada);
                    cargarConfiguracionEnUI();
                    marcarCambiosPendientes();
                    
                    mostrarNotificacion('📥 Configuración importada exitosamente', 'success');
                } else {
                    throw new Error('Estructura de configuración inválida');
                }
                
            } catch (error) {
                console.error('Error importando configuración:', error);
                mostrarNotificacion('❌ Error al importar la configuración. Verifique el archivo.', 'error');
            }
        };
        reader.readAsText(file);
    }
};

// -----------------------------------------------------------
// FUNCIONES DE ACCIONES AVANZADAS
// -----------------------------------------------------------
const limpiarCache = () => {
    if (confirm('¿Está seguro de que desea limpiar el cache del sistema? Esto puede afectar temporalmente el rendimiento.')) {
        // Simular limpieza de cache
        const btnLimpiarCache = document.getElementById('btn-limpiar-cache');
        btnLimpiarCache.innerHTML = '<div class="loading-spinner"></div> Limpiando...';
        btnLimpiarCache.disabled = true;

        setTimeout(() => {
            // Llamar a la función de limpiar datos antiguos
            limpiarDatosAntiguos();
            
            // Limpiar localStorage de items no críticos adicionales
            const itemsAMantener = ['hexodus_config', 'configuracionSistema'];
            Object.keys(localStorage).forEach(key => {
                if (!itemsAMantener.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Limpiar cache del navegador si está disponible
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        if (cacheName.includes('hexodus') || cacheName.includes('temp')) {
                            caches.delete(cacheName);
                        }
                    });
                });
            }

            btnLimpiarCache.innerHTML = '<i data-lucide="trash-2" class="w-5 h-5 mr-2"></i> Cache Limpiado';
            btnLimpiarCache.disabled = false;
            
            setTimeout(() => {
                btnLimpiarCache.innerHTML = '<i data-lucide="trash-2" class="w-5 h-5 mr-2"></i> Limpiar Cache';
                lucide.createIcons();
            }, 2000);

            mostrarNotificacion('🗑️ Cache del sistema y datos antiguos limpiados exitosamente', 'success');
        }, 2000);
    }
};

const realizarBackupManual = () => {
    const btnBackup = document.getElementById('btn-backup-manual');
    btnBackup.innerHTML = '<div class="loading-spinner"></div> Realizando Backup...';
    btnBackup.disabled = true;

    // Simular backup
    setTimeout(() => {
        const backupData = {
            configuracion: configuracionActual,
            fecha: new Date().toISOString(),
            version: '2.1.3',
            usuario: 'admin'
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hexodus_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        btnBackup.innerHTML = '<i data-lucide="check" class="w-5 h-5 mr-2"></i> Backup Completado';
        btnBackup.disabled = false;

        setTimeout(() => {
            btnBackup.innerHTML = '<i data-lucide="database" class="w-5 h-5 mr-2"></i> Backup Manual';
            lucide.createIcons();
        }, 3000);

        mostrarNotificacion('💾 Backup realizado exitosamente', 'success');
    }, 3000);
};

// Sistema de notificaciones (reutilizado de otros módulos)
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => notificacion.classList.add('show'), 100);
    
    // Auto-remover después de 4 segundos (más tiempo para configuración)
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
};

// Lógica para toggle en móvil (reutilizada)
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

// Detectar cambios no guardados al salir
window.addEventListener('beforeunload', (event) => {
    if (!configuracionGuardada) {
        event.preventDefault();
        event.returnValue = 'Tiene cambios sin guardar. ¿Está seguro de que desea salir?';
    }
});

// -----------------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------------
const inicializarConfiguracion = () => {
    console.log('Inicializando configuración del sistema...');
    
    // Cargar configuración por defecto
    inicializarConfiguracionPorDefecto();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Cargar configuración en la UI
    cargarConfiguracionEnUI();
    
    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    console.log('Sistema de configuración inicializado correctamente');
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        mostrarNotificacion('⚙️ Panel de configuración cargado correctamente', 'info');
    }, 1000);
};

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarConfiguracion);
} else {
    inicializarConfiguracion();
}

// Exponer funciones globalmente para debugging
window.hexodusConfig = {
    guardar: guardarConfiguracion,
    restablecer: restablecerConfiguracion,
    exportar: exportarConfiguracion,
    obtenerConfig: () => configuracionActual,
    aplicarConfig: aplicarConfiguracionAlSistema
};