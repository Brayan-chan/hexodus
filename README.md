# 🏋️ Hexodus - Sistema de Gestión de Gimnasio

<div align="center">
    <img src="assets/images/icon.png" alt="Hexodus Logo" width="100">
</div>

## 📋 Descripción

**Hexodus** es un sistema integral de gestión para gimnasios desarrollado con tecnologías web modernas. Ofrece una interfaz de usuario elegante con tema oscuro y elementos neón que proporciona funcionalidades completas para la administración de socios, inventario, ventas, usuarios, reportes y configuración del sistema.

## ✨ Características Principales

- 🎨 **Interfaz Moderna**: Diseño oscuro con elementos neón (rojo y azul) siguiendo la identidad visual de Hexodus
- 📱 **Diseño Responsivo**: Compatible con dispositivos móviles y de escritorio
- 🔐 **Sistema de Autenticación**: Pantalla de login con recuperación de contraseña
- 👥 **Gestión de Socios**: Administración completa de membresías y estados
- 📦 **Control de Inventario**: Gestión de productos, stock y categorías
- 💰 **Módulo de Ventas**: Registro y seguimiento de transacciones
- 👨‍💼 **Gestión de Usuarios**: Control de acceso con diferentes roles
- 📊 **Reportes y Analytics**: Generación de informes detallados
- ⚙️ **Configuración Global**: Sistema personalizable con múltiples opciones

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados con variables CSS
- **JavaScript (ES6+)** - Lógica de aplicación
- **Tailwind CSS** - Framework de utilidades CSS
- **Chart.js** - Gráficos y visualizaciones
- **Lucide Icons** - Librería de iconos moderna

### Diseño y UX
- **Tema Oscuro** - Interfaz profesional y moderna
- **Efectos Neón** - Elementos interactivos con glow effects
- **Animaciones CSS** - Transiciones suaves y micro-interacciones
- **Grid Layout** - Diseño flexible y responsivo

## 📁 Estructura del Proyecto

```
hexodus/
├── index.html                  # Página de login principal
├── README.md                   # Documentación del proyecto
├── .gitignore                  # Archivos ignorados por Git
├── assets/                     # Recursos estáticos
│   ├── css/                    # Hojas de estilo
│   │   ├── dashboard.css       # Estilos del dashboard principal
│   │   ├── login.css          # Estilos de la página de login
│   │   ├── socios.css         # Estilos del módulo de socios
│   │   ├── inventario.css     # Estilos del módulo de inventario
│   │   ├── ventas.css         # Estilos del módulo de ventas
│   │   ├── usuarios.css       # Estilos del módulo de usuarios
│   │   ├── reportes.css       # Estilos del módulo de reportes
│   │   └── settings.css       # Estilos del módulo de configuración
│   ├── js/                    # Scripts JavaScript
│   │   ├── global-config.js   # Configuración global del sistema
│   │   ├── dashboard.js       # Lógica del dashboard y gráficos
│   │   ├── socios.js         # Gestión de socios y membresías
│   │   ├── inventario.js     # Control de inventario y productos
│   │   ├── ventas.js         # Módulo de ventas y transacciones
│   │   ├── usuarios.js       # Gestión de usuarios del sistema
│   │   ├── reportes.js       # Generación de reportes
│   │   └── settings.js       # Configuración del sistema
│   └── images/               # Recursos gráficos
│       ├── icon.png          # Logo principal (PNG)
│       └── icon.ico          # Favicon (ICO)
└── views/                    # Páginas de la aplicación
    ├── dashboard.html        # Panel principal con KPIs
    ├── socios.html          # Gestión de socios
    ├── inventario.html      # Control de inventario
    ├── ventas.html          # Módulo de ventas
    ├── usuarios.html        # Gestión de usuarios
    ├── reportes.html        # Reportes y analytics
    └── settings.html        # Configuración del sistema
```

## 🎨 Sistema de Diseño

### Paleta de Colores
```css
:root {
    --color-rojo-principal: #FF3B3B;      /* Rojo vibrante del logo */
    --color-azul-acento: #00BFFF;         /* Azul neón para acentos */
    --color-fondo-oscuro: #101014;        /* Fondo oscuro principal */
    --color-tarjeta-fondo: #1C1C20;       /* Color de tarjeta */
    --color-texto-claro: #E0E0E0;         /* Texto principal */
    --color-texto-gris: #A0A0A0;          /* Texto secundario */
}
```

### Tipografía
- **Fuente Principal**: Inter (Google Fonts)
- **Pesos**: 100-900
- **Uso**: Interface moderna y legible

### Componentes Reutilizables
- **Tarjetas**: `.tarjeta`, `.tarjeta-kpi`
- **Botones**: `.btn-principal`, `.btn-secundario`
- **Inputs**: `.input-neon`
- **Iconos**: `.icon-alerta-*`
- **Navegación**: `.nav-link`, `.nav-activo`

## 🚀 Instalación y Configuración

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional para desarrollo)

### Instalación
1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Brayan-chan/hexodus.git
   cd hexodus
   ```

2. **Configurar servidor local** (opcional)
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Abrir en navegador**
   - Abrir `index.html` directamente, o
   - Acceder a `http://localhost:8000`

## 📖 Guía de Uso

### Navegación Principal
El sistema cuenta con una barra lateral fija que incluye:
- **Dashboard**: Panel principal con KPIs y gráficos
- **Socios**: Gestión de membresías y estados
- **Inventario**: Control de productos y stock
- **Ventas**: Registro de transacciones
- **Usuarios**: Administración de accesos
- **Reportes**: Analytics y reportes
- **Configuración**: Ajustes del sistema

### Funcionalidades por Módulo

#### 🏠 Dashboard
- KPIs en tiempo real
- Gráficos de ventas (Chart.js)
- Alertas y notificaciones
- Resumen de actividad

#### 👥 Socios
- Registro de nuevos socios
- Gestión de membresías
- Control de estados (activo, adeudo, vencimiento)
- Búsqueda y filtros avanzados
- Paginación de resultados

#### 📦 Inventario
- Gestión de productos
- Control de stock
- Categorización
- Alertas de stock bajo
- Búsqueda por múltiples criterios
- **Registro de compras para reabastecimiento**
- **Control de proveedores y tipos de pago**
- **Actualización automática de stock**

#### 💰 Ventas
- Registro de transacciones
- Selección de productos
- Cálculo automático
- Historial de ventas
- Reportes de ingresos

#### 👨‍💼 Usuarios
- Gestión de cuentas
- Asignación de roles
- Control de permisos
- Estados de usuario

#### 📊 Reportes
- Generación automática
- Múltiples formatos
- Filtros por fecha
- Exportación de datos

#### ⚙️ Configuración
- Personalización de tema
- Configuración de empresa
- Ajustes de sistema
- Backup y restauración

## 🔧 Configuración Global

El sistema incluye un archivo `global-config.js` que permite:
- Configuración de tema y colores
- Ajustes de paginación
- Configuración de empresa
- Preferencias de usuario
- Sincronización entre ventanas

### Ejemplo de Configuración
```javascript
const configuracion = {
    empresa: {
        nombre: "Hexodus Gym",
        direccion: "Calle Principal 123",
        telefono: "+52 123 456 7890"
    },
    sistema: {
        registrosPorPagina: 25,
        formatoFecha: "DD/MM/YYYY",
        moneda: "MXN"
    },
    tema: {
        colorPrimario: "#FF3B3B",
        colorSecundario: "#00BFFF"
    }
};
```

## 🎯 Funcionalidades Técnicas

### Responsive Design
- Breakpoints para móvil, tablet y desktop
- Sidebar colapsible en dispositivos móviles
- Grid system adaptativo
- Touch-friendly interface

### Manejo de Estado
- LocalStorage para persistencia
- Configuración global sincronizada
- Estados de paginación
- Filtros dinámicos

### Validaciones
- Validación de formularios en tiempo real
- Mensajes de error contextuales
- Prevención de envíos duplicados
- Sanitización de datos

### Performance
- Carga lazy de componentes
- Optimización de imágenes
- Minificación de CSS/JS
- Cache de configuración

## 🤝 Contribución

### Estructura de Archivos
- **HTML**: Estructura semántica y accesible
- **CSS**: Variables CSS y metodología BEM
- **JavaScript**: ES6+ con funciones modulares
- **Comentarios**: Documentación inline completa

### Estándares de Código
- Nombres de variables en español
- Funciones autoexplicativas
- Consistencia en nomenclatura
- Reutilización de componentes

### Git Workflow
```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Realizar commits descriptivos
git commit -m "feat: agregar funcionalidad de backup automático"

# Crear pull request
git push origin feature/nueva-funcionalidad
```

## 📊 Datos de Prueba

El sistema incluye datos simulados para testing:
- **345 socios** con diferentes estados
- **347 productos** en varias categorías  
- **1247 ventas** con historial
- **24 usuarios** con diferentes roles
- **127 reportes** generados

## 🔒 Seguridad

### Consideraciones de Seguridad
- Validación de entrada en frontend
- Sanitización de datos
- Control de acceso por roles
- Sesiones con timeout

### Recomendaciones para Producción
- Implementar backend seguro
- Usar HTTPS
- Validación en servidor
- Autenticación robusta
- Logs de auditoría

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Características Modernas Utilizadas
- CSS Grid y Flexbox
- ES6+ JavaScript
- CSS Variables
- Local Storage API
- Chart.js para visualizaciones

## 🚀 Próximas Funcionalidades

### En Desarrollo
- [ ] Sistema de notificaciones push
- [ ] Integración con API de pagos
- [ ] Modo offline con sincronización
- [ ] Aplicación móvil (PWA)

### Roadmap
- [ ] Dashboard personalizable
- [ ] Reportes avanzados con IA
- [ ] Integración con wearables
- [ ] Sistema de reservas
- [ ] App móvil nativa

## 📄 Licencia

Este proyecto es propiedad de **JARB'S SOLUTIONS** y está destinado para uso interno del gimnasio Hexodus.

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: jarbs.solutions@gmail.com
- **Teléfono**: +52 981 243 8166
- **Horario**: Lunes a Viernes, 9:00 - 18:00 hrs

---

<div align="center">
  <img src="assets/images/icon.png" alt="Hexodus Logo" width="50">
  <br>
  <strong>Desarrollado con ❤️ para Hexodus Gym</strong>
  <br>
  <em>Sistema de Gestión Integral v1.0</em>
</div>