# 💰 Presupuesto del Proyecto - Sistema Hexodus

## 📊 Resumen Ejecutivo

**Presupuesto Total: $12,000 MXN**

Este documento detalla el desglose completo del presupuesto para la migración y mejora del Sistema de Gestión de Gimnasio Hexodus, incluyendo la transición de localStorage a Firebase, implementación de almacenamiento en la nube, y optimización de todos los módulos existentes.

---

## 🎯 Alcance del Proyecto

### Tecnologías Actuales → Tecnologías Propuestas

| Componente | Actual | Propuesto | Justificación |
|------------|--------|-----------|---------------|
| **Base de Datos** | localStorage | Firebase Firestore | Datos persistentes, sincronización en tiempo real, acceso multiplataforma |
| **Autenticación** | Sin sistema real | Firebase Authentication | Seguridad, recuperación de contraseña, gestión de sesiones |
| **Almacenamiento de Imágenes** | Base64 en localStorage | Cloudinary | Optimización de rendimiento, transformaciones de imagen, CDN global |
| **Hosting** | Local | Vercel (Gratuito) | Deploy automático, SSL, CDN global, dominio personalizado opcional |

---

## 📦 Desglose de Módulos y Costos

### 1. 🔐 Módulo de Autenticación y Seguridad
**Costo: $1,500 MXN** | **Tiempo estimado: 12-15 horas**

#### ✅ Incluye:
- [ ] Integración de Firebase Authentication
- [ ] Sistema de login con email/contraseña
- [ ] Recuperación de contraseña por email
- [ ] Verificación de email al registrarse
- [ ] Gestión de sesiones persistentes
- [ ] Middleware de protección de rutas
- [ ] Sistema de roles (Admin, Recepcionista, etc.)
- [ ] Cierre de sesión en todas las vistas

#### 🔧 Complejidad Técnica:
- **Alta** - Requiere reestructurar completamente el flujo de autenticación
- Migración de sistema simulado a autenticación real
- Implementación de guards de seguridad en cada vista
- Manejo de tokens y refresh tokens
- Gestión de estados de sesión

#### 💡 Beneficios para el Cliente:
- Seguridad real de datos
- Recuperación de contraseña automática
- Control de acceso por roles
- Sesiones persistentes en múltiples dispositivos

---

### 2. 👥 Módulo de Gestión de Socios
**Costo: $1,800 MXN** | **Tiempo estimado: 15-18 horas**

#### ✅ Incluye:
- [ ] Migración de localStorage a Firestore
- [ ] CRUD completo de socios con Firebase
- [ ] Integración con Cloudinary para fotos de perfil
- [ ] Sistema de búsqueda en tiempo real
- [ ] Filtros avanzados (estado, membresía, fecha)
- [ ] Paginación optimizada con Firestore
- [ ] Exportación a CSV/Excel
- [ ] Historial de cambios de membresía
- [ ] Validación de datos con reglas de Firestore
- [ ] Optimización de imágenes automática

#### 🎨 Funcionalidades Actuales a Migrar:
```javascript
// Antes (localStorage)
localStorage.setItem('hexodus_socios', JSON.stringify(socios));

// Después (Firebase)
await db.collection('socios').doc(socioId).set(socioData);
```

#### 📊 Colecciones Firestore:
- `socios/` - Datos principales
- `socios/{id}/membresias/` - Historial de membresías (subcollection)
- `socios/{id}/pagos/` - Historial de pagos (subcollection)

#### 🔧 Complejidad Técnica:
- **Media-Alta** - Reestructuración de almacenamiento
- Queries complejos para filtros múltiples
- Paginación con cursores de Firestore
- Manejo de relaciones entre colecciones
- Integración con API de Cloudinary

---

### 3. 🔐 Módulo de Reconocimiento Facial + Control de Acceso
**Costo: $2,500 MXN** | **Tiempo estimado: 20-25 horas**

#### ✅ Incluye:
- [ ] Migración del sistema de reconocimiento facial
- [ ] Almacenamiento de descriptores faciales en Firestore
- [ ] Imágenes faciales en Cloudinary (optimizadas)
- [ ] Sistema de registro de accesos en tiempo real
- [ ] Dashboard de estadísticas en vivo
- [ ] Validación de membresías con Firestore
- [ ] Sincronización entre ventana admin y cliente
- [ ] Historial de accesos con paginación
- [ ] Exportación de reportes de asistencia
- [ ] Configuración global persistente

#### 🎯 Arquitectura Propuesta:
```
┌─────────────────────┐
│  Panel Admin        │
│  (registro.html)    │
│  - Ver estadísticas │
│  - Configurar       │
│  - Exportar datos   │
└──────────┬──────────┘
           │
           │ Firebase Realtime Updates
           ↓
┌─────────────────────┐
│  Pantalla Cliente   │
│  (registro-cliente) │
│  - Escaneo facial   │
│  - Validación real  │
│  - Auto-reset       │
└─────────────────────┘
```

#### 🗄️ Estructura de Datos:
```javascript
// Colección: registros_acceso
{
  socioId: "ABC123",
  nombreSocio: "Juan Pérez",
  timestamp: Timestamp,
  tipo: "permitido" | "denegado",
  motivo: "Acceso permitido",
  confianza: 95.3,
  fotoCaptura: "cloudinary_url", // URL optimizada
  ubicacion: "Entrada Principal"
}

// Colección: configuracion_registro
{
  gimnasioId: "gym_001",
  sonidoHabilitado: true,
  deteccionAutomatica: true,
  umbralConfianza: 0.5,
  tiempoReset: 10
}
```

#### 🔧 Complejidad Técnica:
- **Muy Alta** - Sistema complejo de IA + sincronización en tiempo real
- Integración de face-api.js con Firebase
- Manejo de arrays grandes (descriptores de 128 dimensiones)
- Optimización de imágenes para web y comparación
- Comunicación bidireccional entre ventanas
- Validación en tiempo real de membresías
- Manejo de estados de conexión

#### 💡 Mejoras vs Versión Actual:
- ✅ Datos persistentes entre sesiones
- ✅ Acceso desde múltiples dispositivos
- ✅ Estadísticas en tiempo real
- ✅ Backup automático en la nube
- ✅ Imágenes optimizadas (carga 80% más rápida)

---

### 4. 💳 Módulo de Membresías y Pagos
**Costo: $1,200 MXN** | **Tiempo estimado: 10-12 horas**

#### ✅ Incluye:
- [ ] Migración de tipos de membresías a Firestore
- [ ] Sistema de pagos y estado de cuenta
- [ ] Cálculo automático de vencimientos
- [ ] Alertas de membresías por vencer
- [ ] Historial completo de pagos
- [ ] Generación de recibos en PDF
- [ ] Dashboard de ingresos
- [ ] Estadísticas de conversión
- [ ] Filtros por tipo y estado

#### 📊 Colecciones Firestore:
```javascript
// Colección: membresias_tipos
{
  id: "mensual-premium",
  nombre: "Mensual Premium",
  precio: 500,
  duracion: 30,
  unidad: "días",
  descripcion: "...",
  beneficios: [],
  activa: true
}

// Colección: pagos
{
  socioId: "ABC123",
  membresiaId: "mem_123",
  monto: 500,
  metodoPago: "efectivo",
  fecha: Timestamp,
  folio: "F-001234",
  recibo: "cloudinary_url"
}
```

#### 🔧 Complejidad Técnica:
- **Media** - Lógica de negocio para cálculos
- Triggers para actualizar estados automáticamente
- Queries agregados para estadísticas

---

### 5. 📦 Módulo de Inventario
**Costo: $1,000 MXN** | **Tiempo estimado: 8-10 horas**

#### ✅ Incluye:
- [ ] Migración de productos a Firestore
- [ ] CRUD completo de inventario
- [ ] Control de stock en tiempo real
- [ ] Alertas de stock bajo
- [ ] Categorías y subcategorías
- [ ] Imágenes de productos en Cloudinary
- [ ] Historial de movimientos
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de inventario

#### 📦 Funcionalidades Opcionales (+$300):
- [ ] Código de barras/QR
- [ ] Sistema de proveedores
- [ ] Órdenes de compra automatizadas

---

### 6. 💰 Módulo de Ventas
**Costo: $1,000 MXN** | **Tiempo estimado: 8-10 horas**

#### ✅ Incluye:
- [ ] Migración de ventas a Firestore
- [ ] Sistema de punto de venta (POS)
- [ ] Registro de transacciones
- [ ] Cálculo automático de totales
- [ ] Vinculación con inventario (descuento automático)
- [ ] Historial de ventas
- [ ] Búsqueda por fecha/cliente
- [ ] Reporte de ventas diarias/mensuales
- [ ] Exportación de datos

---

### 7. 👨‍💼 Módulo de Usuarios del Sistema
**Costo: $800 MXN** | **Tiempo estimado: 6-8 horas**

#### ✅ Incluye:
- [ ] Migración a Firebase Authentication + Firestore
- [ ] Gestión de roles y permisos
- [ ] CRUD de usuarios administradores
- [ ] Control de acceso por módulo
- [ ] Registro de actividad de usuarios
- [ ] Perfiles personalizables
- [ ] Fotos de perfil en Cloudinary

#### 🔐 Roles Propuestos:
- **Super Admin** - Acceso total
- **Admin** - Gestión general
- **Recepcionista** - Solo acceso y socios
- **Contador** - Solo ventas y reportes

---

### 8. 📊 Módulo de Reportes y Analytics
**Costo: $700 MXN** | **Tiempo estimado: 6-8 horas**

#### ✅ Incluye:
- [ ] Reportes dinámicos con datos de Firestore
- [ ] Gráficos interactivos (Chart.js)
- [ ] Exportación a PDF/Excel
- [ ] Dashboard de métricas clave
- [ ] Filtros por fecha y categoría
- [ ] Reportes programados (opcional)
- [ ] Comparativas mensuales/anuales

---

### 9. ⚙️ Módulo de Configuración Global
**Costo: $1,500 MXN** | **Tiempo estimado: 12-15 horas**

#### ✅ Incluye:
- [ ] Migración de configuración a Firestore
- [ ] Sincronización en tiempo real entre ventanas
- [ ] Personalización de marca (logo, colores)
- [ ] Configuración de notificaciones
- [ ] Backup y restauración de datos
- [ ] Gestión de licencia/suscripción
- [ ] Configuración de impresoras
- [ ] Preferencias de usuario
- [ ] Configuración de emails

#### 🔧 Complejidad Técnica:
- **Alta** - Sistema transversal que afecta todo
- Broadcasting de cambios a todas las ventanas activas
- Validación de permisos para cambios
- Cache inteligente para optimizar rendimiento

---

## 🚀 Servicios Adicionales Incluidos

### Hosting y Deploy (Sin costo adicional)
#### ✅ Incluye:
- Configuración de Vercel
- Deploy automático desde GitHub
- SSL gratuito
- CDN global
- Dominio de Vercel (hexodus.vercel.app)

### ⭐ Dominio Personalizado (Opcional)
**Costo adicional: $800 MXN/año**
- Registro de dominio (.com, .mx, .fit, etc.)
- Configuración DNS
- Certificado SSL automático
- Email corporativo básico

---

## 💳 Costos de Servicios Externos

### Firebase (Google)
**Plan Spark (Gratuito)** - Suficiente para iniciar
- **Firestore:** 1 GB almacenamiento + 50K lecturas/día
- **Authentication:** Usuarios ilimitados
- **Storage:** 5 GB de archivos

**Plan Blaze (Pago por uso)** - Para crecimiento
- **Costo estimado:** $5-15 USD/mes según uso
- Facturado directamente por Google
- El cliente paga directamente a Google

### Cloudinary
**Plan Gratuito** - Incluido en desarrollo
- 25 GB almacenamiento
- 25 GB ancho de banda/mes
- Transformaciones de imágenes

**Plan Plus (Recomendado)** - $89 USD/mes
- Optimización automática
- CDN premium
- Soporte prioritario
- El cliente paga directamente a Cloudinary

---

## 📊 Tabla de Selección de Módulos

### ✅ Módulos Incluidos en $12,000 MXN

| # | Módulo | Costo | Prioridad | Selección Cliente |
|---|--------|-------|-----------|-------------------|
| 1 | 🔐 Autenticación y Seguridad | $1,500 | 🔴 CRÍTICO | ☑️ Obligatorio |
| 2 | 👥 Gestión de Socios | $1,800 | 🔴 CRÍTICO | ☑️ Obligatorio |
| 3 | 🔐 Reconocimiento Facial | $2,500 | 🟡 ALTO | ⬜ Opcional |
| 4 | 💳 Membresías y Pagos | $1,200 | 🔴 CRÍTICO | ☑️ Obligatorio |
| 5 | 📦 Inventario | $1,000 | 🟡 ALTO | ⬜ Opcional |
| 6 | 💰 Ventas | $1,000 | 🟡 ALTO | ⬜ Opcional |
| 7 | 👨‍💼 Usuarios del Sistema | $800 | 🟢 MEDIO | ⬜ Opcional |
| 8 | 📊 Reportes y Analytics | $700 | 🟢 MEDIO | ⬜ Opcional |
| 9 | ⚙️ Configuración Global | $1,500 | 🔴 CRÍTICO | ☑️ Obligatorio |
| | **TOTAL BASE** | **$12,000** | | |

### 🎁 Opciones de Paquetes

#### Paquete 1: Esencial ($6,000 MXN)
**Ideal para gimnasios pequeños que inician**
- ✅ Autenticación y Seguridad
- ✅ Gestión de Socios (básica)
- ✅ Membresías y Pagos
- ✅ Configuración Global (básica)

#### Paquete 2: Profesional ($9,000 MXN)
**Recomendado para gimnasios en crecimiento**
- ✅ Todo el Paquete Esencial
- ✅ Reconocimiento Facial
- ✅ Usuarios del Sistema
- ✅ Reportes Básicos

#### Paquete 3: Completo ($12,000 MXN) ⭐ RECOMENDADO
**Sistema completo con todas las funcionalidades**
- ✅ Todos los módulos incluidos
- ✅ Integración completa Firebase + Cloudinary
- ✅ Optimización de rendimiento
- ✅ 2 meses de soporte técnico
- ✅ Capacitación del personal (2 sesiones)

---

## 🔧 Extras Opcionales (No incluidos en $12,000)

| Extra | Descripción | Costo Adicional |
|-------|-------------|-----------------|
| 📱 App Móvil | App nativa iOS/Android | $8,000 MXN |
| 💳 Pasarela de Pagos | Stripe/PayPal/Conekta | $1,500 MXN |
| 📧 Email Marketing | Integración con Mailchimp | $800 MXN |
| 📲 WhatsApp Business | API de notificaciones | $1,200 MXN |
| 🖨️ Impresión de Credenciales | Sistema de impresión | $600 MXN |
| 📊 Dashboard Avanzado | Métricas BI y predicciones | $2,000 MXN |
| 🌐 Sitio Web Público | Landing page del gimnasio | $3,000 MXN |
| 🎓 Capacitación Extra | Sesiones adicionales | $500 MXN/sesión |

---

## ⏱️ Cronograma de Desarrollo

### Fase 1: Fundamentos (Semana 1-2)
- Configuración de Firebase
- Migración de autenticación
- Estructura base de Firestore

### Fase 2: Módulos Core (Semana 3-4)
- Gestión de Socios
- Membresías y Pagos
- Configuración Global

### Fase 3: Módulos Avanzados (Semana 5-6)
- Reconocimiento Facial
- Inventario y Ventas
- Usuarios del Sistema

### Fase 4: Finalización (Semana 7-8)
- Reportes y Analytics
- Testing completo
- Deploy a producción
- Capacitación

**Tiempo total estimado:** 8 semanas (2 meses)

---

## 🎯 Justificación del Presupuesto de $12,000 MXN

### Comparación con Tarifas del Mercado

| Concepto | Tarifa Mercado México | Horas Proyecto | Subtotal Mercado |
|----------|----------------------|----------------|------------------|
| Desarrollo Frontend | $300-500/hora | 60 horas | $18,000-30,000 |
| Integración Backend | $400-600/hora | 40 horas | $16,000-24,000 |
| UI/UX Design | $350-500/hora | 15 horas | $5,250-7,500 |
| Testing y QA | $250-400/hora | 10 horas | $2,500-4,000 |
| Deploy y Config | $500-800/hora | 5 horas | $2,500-4,000 |
| **TOTAL MERCADO** | | **130 horas** | **$44,250-69,500** |

### 💰 Tu Precio: $12,000 MXN
**Descuento de 73-83% respecto al mercado**

### ¿Por qué este precio?
1. **Base ya existente:** El sistema actual funciona, solo requiere migración
2. **Stack moderno:** Firebase y Cloudinary simplifican el desarrollo
3. **Código reutilizable:** Muchos componentes ya están desarrollados
4. **Sin costos de servidor:** Vercel gratuito y Firebase tiene plan free
5. **Relación comercial:** Precio especial para proyecto inicial

---

## 💎 Valor Agregado Incluido

### ✅ Sin costo adicional:
- 📝 Documentación técnica completa
- 🎓 2 sesiones de capacitación (2 horas c/u)
- 🐛 3 meses de soporte técnico
- 🔄 Updates de seguridad (2 meses)
- 📱 Sistema responsive (móvil + desktop)
- 🌐 Deploy y configuración de hosting
- 🔒 Implementación de mejores prácticas de seguridad
- ⚡ Optimización de rendimiento
- 📊 Google Analytics integrado
- 🎨 Personalización de marca (logo + colores)

**Valor estimado de extras:** $4,500 MXN adicionales

---

## 📋 Entregables del Proyecto

### Documentación
- [ ] Manual de usuario (PDF + Online)
- [ ] Documentación técnica
- [ ] Guía de administración
- [ ] Diagramas de arquitectura
- [ ] Diccionario de datos

### Código
- [ ] Repositorio GitHub privado
- [ ] Código fuente completo
- [ ] Archivos de configuración
- [ ] Scripts de deploy

### Accesos
- [ ] Credenciales Firebase
- [ ] Dashboard de Cloudinary
- [ ] Panel de Vercel
- [ ] Acceso a repositorio

### Capacitación
- [ ] Sesión 1: Uso del sistema (usuarios finales)
- [ ] Sesión 2: Administración y configuración
- [ ] Videos tutoriales grabados
- [ ] Soporte vía WhatsApp (2 meses)

---

## 🔐 Garantías

### ✅ Garantía de Funcionalidad
- **30 días** para reportar bugs sin costo
- Corrección de errores de programación
- Garantía de funcionamiento según especificaciones

### ✅ Garantía de Soporte
- **2 meses** de soporte técnico incluido
- Respuesta en máximo 24 horas hábiles
- Soporte vía WhatsApp y email

### ✅ NO Incluye (después de 30 días):
- Cambios en funcionalidades
- Nuevas características
- Modificaciones de diseño
- Soporte después de 2 meses
- Capacitaciones adicionales

---

## 💳 Formas de Pago

### Opción 1: Pago Único
**$12,000 MXN** al inicio del proyecto
- ✅ Sin intereses
- ✅ Inicio inmediato
- ✅ Prioridad máxima

### Opción 2: 50/50
- **$6,000 MXN** al inicio (firma de contrato)
- **$6,000 MXN** al entregar producto terminado
- Recargo: $0 (sin costo adicional)

### Opción 3: 3 Pagos
- **$4,000 MXN** al inicio
- **$4,000 MXN** a la mitad (semana 4)
- **$4,000 MXN** al entregar
- Recargo: $0 (sin costo adicional)

### Métodos de Pago Aceptados
- 💳 Transferencia bancaria
- 💵 Efectivo
- 🏦 Depósito bancario
- 📱 Mercado Pago
- 💳 Stripe

---

## 📞 Siguiente Paso

### Para Contratar el Proyecto:

1. **Revisar este documento** y seleccionar módulos deseados
2. **Marcar las casillas** en la tabla de selección
3. **Contactar para aclarar dudas**
4. **Firma de contrato** con alcance definido
5. **Primer pago** según opción elegida
6. **¡Inicio del desarrollo!**

### Contacto
- 📧 Email: [jarbs.solutions@gmail.com]
- 📱 WhatsApp: [9812438166]

---

## 🎯 Preguntas Frecuentes

### ¿Puedo agregar módulos después?
✅ Sí, cada módulo tiene precio individual. Se pueden agregar posteriormente.

### ¿Qué pasa si necesito cambios después de la entrega?
Después del periodo de garantía (30 días), los cambios se cotizan por separado.

### ¿El precio incluye los costos de Firebase y Cloudinary?
No, el cliente paga directamente a estos proveedores. Estimado: $5-15 USD/mes.

### ¿Puedo cancelar el proyecto?
Sí, pero no hay devolución del anticipo ya que se invierte tiempo en desarrollo.

### ¿Incluye app móvil?
No, la app móvil es un extra de $8,000 MXN dependiendo las funcionalidades. El sistema web es responsive.

### ¿Puedo pagar en dólares?
Sí, al tipo de cambio del día según [sitio oficial].

### ¿Ofrecen mantenimiento mensual?
Sí, después de 2 meses: $800 MXN/mes (soporte + updates).

---

## 📊 Resumen Visual del Presupuesto

```
┌─────────────────────────────────────────────┐
│  PRESUPUESTO TOTAL: $12,000 MXN             │
├─────────────────────────────────────────────┤
│                                             │
│  🔐 Autenticación ........... $1,500 (12%)  │
│  👥 Gestión Socios .......... $1,800 (15%)  │
│  🔐 Reconocimiento Facial ... $2,500 (21%)  │
│  💳 Membresías y Pagos ...... $1,200 (10%)  │
│  📦 Inventario .............. $1,000  (8%)  │
│  💰 Ventas .................. $1,000  (8%)  │
│  👨‍💼 Usuarios ................ $800   (7%)   │
│  📊 Reportes ................ $700   (6%)   │
│  ⚙️ Configuración ........... $1,500 (13%)  │
│                                             │
│  ✅ Total ......... .......... $12,000       │
│                                             │
│  + Valor agregado .......... $4,500 GRATIS  │
│  + Capacitación ............ $2,000 GRATIS  │
│  + Soporte 2 meses ......... $1,600 GRATIS  │
│                                             │
│  = VALOR REAL .............. $20,100        │
└─────────────────────────────────────────────┘
```

---

## ✍️ Espacio para Aprobación del Cliente

**Nombre del Cliente:** ___________________________________

**Gimnasio/Empresa:** ___________________________________

**Fecha:** ___________________________________

**Módulos Seleccionados:**
- [ ] Paquete Completo ($12,000)
- [ ] Paquete Profesional ($9,000)
- [ ] Paquete Esencial ($6,000)
- [ ] Personalizado: _________________________________

**Forma de Pago:**
- [ ] Pago único
- [ ] 50/50
- [ ] 3 pagos

**Extras Solicitados:**
- [ ] Dominio personalizado (+$800/año)
- [ ] _________________________________
- [ ] _________________________________

**Firma:** ___________________________________

---

<div align="center">

**Gracias por su confianza en JARB'S SOLTIONS**

*Sistema de Gestión de Gimnasio - Hecho en México 🇲🇽*

</div>
