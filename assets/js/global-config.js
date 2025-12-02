// ================================================
// GLOBAL-CONFIG.JS - CONFIGURACIÓN GLOBAL DEL SISTEMA
// Sistema para aplicar configuración guardada a todas las vistas
// ================================================

/**
 * Sistema de configuración global para Hexodus
 * Este archivo debe ser cargado en todas las vistas antes que sus JS específicos
 */

// Obtener configuración actual del localStorage
const obtenerConfiguracionGlobal = () => {
    const configPorDefecto = {
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
        }
    };

    try {
        const configGuardada = localStorage.getItem('hexodus_config');
        if (configGuardada) {
            const config = JSON.parse(configGuardada);
            // Fusionar con defaults para asegurar que existan todas las propiedades
            return {
                apariencia: { ...configPorDefecto.apariencia, ...config.apariencia },
                idioma: { ...configPorDefecto.idioma, ...config.idioma },
                notificaciones: config.notificaciones || {},
                avanzado: config.avanzado || {}
            };
        }
    } catch (error) {
        console.warn('Error cargando configuración global:', error);
    }
    
    return configPorDefecto;
};

// Aplicar configuración global al sistema
const aplicarConfiguracionGlobal = () => {
    const config = obtenerConfiguracionGlobal();
    
    console.log('Aplicando configuración global:', config);
    
    // Aplicar colores personalizados
    if (config.apariencia) {
        if (config.apariencia.colorPrincipal) {
            document.documentElement.style.setProperty('--color-rojo-principal', config.apariencia.colorPrincipal);
        }
        if (config.apariencia.colorSecundario) {
            document.documentElement.style.setProperty('--color-azul-acento', config.apariencia.colorSecundario);
        }
        
        // Aplicar tema
        if (config.apariencia.modoTema) {
            document.documentElement.setAttribute('data-theme', config.apariencia.modoTema);
        }
        
        // Aplicar nombre del sistema con múltiples intentos
        if (config.apariencia.nombreSistema) {
            const aplicarNombre = () => {
                console.log('Aplicando nombre del sistema:', config.apariencia.nombreSistema);
                
                // Buscar elementos con atributo data-system-name
                const elementosTexto = document.querySelectorAll('[data-system-name]');
                console.log('Elementos encontrados con data-system-name:', elementosTexto.length);
                elementosTexto.forEach(elemento => {
                    console.log('Actualizando elemento:', elemento);
                    elemento.textContent = config.apariencia.nombreSistema;
                });
                
                // También buscar por ID específicos comunes
                const elementosSidebar = document.querySelectorAll('#sidebar-logo-text');
                console.log('Elementos encontrados con #sidebar-logo-text:', elementosSidebar.length);
                elementosSidebar.forEach(elemento => {
                    console.log('Actualizando elemento sidebar:', elemento);
                    elemento.textContent = config.apariencia.nombreSistema;
                });
                
                // Buscar elementos en la vista previa de settings
                const elementosPreview = document.querySelectorAll('#preview-logo-text');
                console.log('Elementos encontrados con #preview-logo-text:', elementosPreview.length);
                elementosPreview.forEach(elemento => {
                    console.log('Actualizando elemento preview:', elemento);
                    elemento.textContent = config.apariencia.nombreSistema;
                });
            };
            
            // Aplicar inmediatamente si el DOM está listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', aplicarNombre);
            } else {
                aplicarNombre();
            }
            
            // También aplicar después de un breve delay para asegurar que todos los elementos estén cargados
            setTimeout(aplicarNombre, 100);
            setTimeout(aplicarNombre, 500);
        }
        
        // Aplicar logo con múltiples intentos
        if (config.apariencia.logoUrl) {
            const aplicarLogo = () => {
                console.log('Aplicando logo:', config.apariencia.logoUrl);
                
                const elementosLogo = document.querySelectorAll('[data-system-logo]');
                console.log('Elementos encontrados con data-system-logo:', elementosLogo.length);
                elementosLogo.forEach(elemento => {
                    console.log('Actualizando logo elemento:', elemento);
                    elemento.src = config.apariencia.logoUrl;
                });
                
                // También buscar por ID específicos comunes
                const elementosSidebarLogo = document.querySelectorAll('#sidebar-logo-img');
                console.log('Elementos encontrados con #sidebar-logo-img:', elementosSidebarLogo.length);
                elementosSidebarLogo.forEach(elemento => {
                    console.log('Actualizando logo sidebar:', elemento);
                    elemento.src = config.apariencia.logoUrl;
                });
                
                // Buscar elementos en la vista previa de settings
                const elementosPreviewLogo = document.querySelectorAll('#preview-logo-img');
                console.log('Elementos encontrados con #preview-logo-img:', elementosPreviewLogo.length);
                elementosPreviewLogo.forEach(elemento => {
                    console.log('Actualizando logo preview:', elemento);
                    elemento.src = config.apariencia.logoUrl;
                });
            };
            
            // Aplicar inmediatamente si el DOM está listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', aplicarLogo);
            } else {
                aplicarLogo();
            }
            
            // También aplicar después de un breve delay
            setTimeout(aplicarLogo, 100);
            setTimeout(aplicarLogo, 500);
        }
    }
};

// Función para observar cambios en localStorage y aplicar automáticamente
const observarCambiosConfiguracion = () => {
    // Escuchar cambios en localStorage (cuando se guarda desde otra pestaña)
    window.addEventListener('storage', (e) => {
        if (e.key === 'hexodus_config') {
            aplicarConfiguracionGlobal();
        }
    });
    
    // Escuchar evento personalizado para cambios locales
    window.addEventListener('hexodus-config-updated', () => {
        aplicarConfiguracionGlobal();
    });
};

// Función para notificar cambios en la configuración
const notificarCambioConfiguracion = () => {
    window.dispatchEvent(new CustomEvent('hexodus-config-updated'));
};

// Aplicar configuración inmediatamente al cargar el script
aplicarConfiguracionGlobal();

// Configurar observadores cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observarCambiosConfiguracion();
        aplicarConfiguracionGlobal(); // Aplicar nuevamente cuando DOM esté listo
    });
} else {
    observarCambiosConfiguracion();
    aplicarConfiguracionGlobal(); // Aplicar nuevamente si ya está listo
}

// También aplicar cuando la ventana termine de cargar completamente
window.addEventListener('load', () => {
    setTimeout(aplicarConfiguracionGlobal, 100);
});

// Escuchar cambios de configuración desde otras ventanas/tabs
if (typeof BroadcastChannel !== 'undefined') {
    const canalConfig = new BroadcastChannel('hexodus-config');
    canalConfig.addEventListener('message', (event) => {
        console.log('📡 Mensaje recibido en BroadcastChannel:', event.data);
        if (event.data.tipo === 'aplicar-configuracion') {
            console.log('🔄 Aplicando configuración desde otro tab...');
            // Aplicar la configuración recibida múltiples veces para asegurar que funcione
            aplicarConfiguracionGlobal();
            setTimeout(aplicarConfiguracionGlobal, 50);
            setTimeout(aplicarConfiguracionGlobal, 200);
            setTimeout(aplicarConfiguracionGlobal, 500);
        }
    });
}

// Escuchar eventos personalizados de cambio de configuración
window.addEventListener('configuracionCambiada', (event) => {
    console.log('🔄 Configuración cambiada, reaplicando...', event.detail);
    aplicarConfiguracionGlobal();
    setTimeout(aplicarConfiguracionGlobal, 100);
});

// Exportar funciones para uso global
window.HexodusGlobalConfig = {
    obtener: obtenerConfiguracionGlobal,
    aplicar: aplicarConfiguracionGlobal,
    notificarCambio: notificarCambioConfiguracion
};