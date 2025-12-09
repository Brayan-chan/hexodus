// Script para inicializar Chart.js y la lógica del dashboard

// Inicializa los íconos de Lucide
lucide.createIcons();

// -----------------------------------------------------------
// 1. Lógica de Navegación Móvil
// -----------------------------------------------------------
document.getElementById('menu-toggle').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('backdrop');
    sidebar.classList.toggle('-translate-x-full');
    backdrop.classList.toggle('hidden');
});

document.getElementById('backdrop').addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('backdrop');
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
});

// -----------------------------------------------------------
// 2. Lógica de Fecha y Hora
// -----------------------------------------------------------
const actualizarFechaHora = () => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
    document.getElementById('fecha-hora').textContent = `${fecha} | ${hora}`;
};
setInterval(actualizarFechaHora, 60000); // Actualizar cada minuto
actualizarFechaHora(); // Llamar al inicio

// -----------------------------------------------------------
// 3. Lógica de Gráficos (RF20)
// -----------------------------------------------------------

// Colores del tema Hexodus
const colorRojo = 'rgba(255, 59, 59, 1)';
const colorAzul = 'rgba(0, 191, 255, 1)';
const colorGris = 'rgba(160, 160, 160, 1)';

// 3.1 Gráfico de Ventas vs. Mes Anterior (Barras)
const ctxVentas = document.getElementById('graficoVentas').getContext('2d');
new Chart(ctxVentas, {
    type: 'bar',
    data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
            label: 'Ventas Actuales',
            data: [1200, 1900, 3000, 500, 2000, 3000, 2500],
            backgroundColor: colorRojo,
            borderRadius: 4,
        }, {
            label: 'Mes Anterior',
            data: [900, 1500, 2500, 1000, 1800, 2800, 2000],
            backgroundColor: colorGris,
            borderRadius: 4,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: 'white' } }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    }
});

// 3.2 Gráfico de Membresías Activas (Anillo/Torta)
const ctxMembresias = document.getElementById('graficoMembresias').getContext('2d');
new Chart(ctxMembresias, {
    type: 'doughnut',
    data: {
        labels: ['Mensual', 'Trimestral', 'Semestral', 'Anual'],
        datasets: [{
            data: [180, 80, 50, 35], // Socios Activos por Tipo
            backgroundColor: [
                colorRojo,
                colorAzul,
                '#FF9900', // Naranja para contraste
                '#6600CC'  // Púrpura para contraste
            ],
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: 'white', usePointStyle: true }
            }
        }
    }
});

// 3.3 Gráfico de Concurrencia (Barras Horizontales)
const ctxConcurrencia = document.getElementById('graficoConcurrencia').getContext('2d');
new Chart(ctxConcurrencia, {
    type: 'bar',
    data: {
        labels: ['07:00', '13:00', '18:00', '20:00'],
        datasets: [{
            label: 'Personas',
            data: [45, 60, 95, 80],
            backgroundColor: [colorAzul, colorAzul, colorRojo, colorAzul],
            borderRadius: 4,
        }]
    },
    options: {
        indexAxis: 'y', // Hace las barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    }
});

// -----------------------------------------------------------
// 4. Lógica de Visitantes del Día
// -----------------------------------------------------------

// Función para obtener registros de acceso desde localStorage
const obtenerRegistrosAcceso = () => {
    const registrosJSON = localStorage.getItem('registros_acceso');
    return registrosJSON ? JSON.parse(registrosJSON) : [];
};

// Función para obtener socios desde localStorage
const obtenerSocios = () => {
    const sociosJSON = localStorage.getItem('hexodus_socios');
    return sociosJSON ? JSON.parse(sociosJSON) : [];
};

// Función para cargar y mostrar visitantes del día
const cargarVisitantesDelDia = () => {
    const registros = obtenerRegistrosAcceso();
    const socios = obtenerSocios();
    const container = document.getElementById('lista-visitantes');
    const contador = document.getElementById('total-visitantes-hoy');
    
    // Filtrar registros del día actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const registrosHoy = registros.filter(r => {
        const fecha = new Date(r.timestamp);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime() && r.tipo === 'permitido';
    });
    
    // Agrupar por socioId para evitar duplicados
    const visitantesUnicos = new Map();
    registrosHoy.forEach(registro => {
        if (!visitantesUnicos.has(registro.socioId)) {
            visitantesUnicos.set(registro.socioId, {
                socioId: registro.socioId,
                nombreSocio: registro.nombreSocio,
                primeraEntrada: new Date(registro.timestamp),
                ultimaEntrada: new Date(registro.timestamp),
                totalVisitas: 1
            });
        } else {
            const visitante = visitantesUnicos.get(registro.socioId);
            visitante.ultimaEntrada = new Date(registro.timestamp);
            visitante.totalVisitas++;
        }
    });
    
    // Convertir a array y ordenar por hora de última entrada (más recientes primero)
    const visitantesArray = Array.from(visitantesUnicos.values())
        .sort((a, b) => b.ultimaEntrada - a.ultimaEntrada);
    
    // Actualizar contador
    contador.textContent = `${visitantesArray.length} asistencias`;
    
    // Renderizar lista
    if (visitantesArray.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-8">No hay visitantes registrados hoy</p>';
        return;
    }
    
    let html = '<div class="space-y-3">';
    
    visitantesArray.forEach((visitante, index) => {
        // Buscar información completa del socio
        const socio = socios.find(s => s.id === visitante.socioId);
        const nombreCompleto = socio ? `${socio.nombre} ${socio.apellido}` : visitante.nombreSocio;
        const membresia = socio ? socio.membresiaInfo?.nombre || 'Sin membresía' : 'Sin membresía';
        
        const horaEntrada = visitante.primeraEntrada.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const horaUltima = visitante.ultimaEntrada.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Calcular tiempo transcurrido desde última entrada
        const tiempoTranscurrido = Math.floor((new Date() - visitante.ultimaEntrada) / (1000 * 60)); // en minutos
        let estadoPresencia = '';
        let colorEstado = '';
        
        if (tiempoTranscurrido < 120) { // Menos de 2 horas
            estadoPresencia = '🟢 En el gimnasio';
            colorEstado = 'text-green-400';
        } else if (tiempoTranscurrido < 240) { // Entre 2 y 4 horas
            estadoPresencia = '🟡 Posiblemente salió';
            colorEstado = 'text-yellow-400';
        } else {
            estadoPresencia = '⚪ Salió';
            colorEstado = 'text-gray-400';
        }
        
        html += `
            <div class="flex items-center justify-between p-4 rounded-lg bg-gray-800 hover:bg-gray-750 transition duration-200">
                <div class="flex items-center gap-4">
                    <!-- Avatar con número -->
                    <div class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center" 
                         style="background-color: rgba(0, 191, 255, 0.2);">
                        <span class="text-sm font-bold" style="color: var(--color-azul-acento);">#${visitante.socioId}</span>
                    </div>
                    
                    <!-- Información del visitante -->
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-white">${nombreCompleto}</span>
                            ${visitante.totalVisitas > 1 ? `
                                <span class="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                                    ${visitante.totalVisitas} entradas
                                </span>
                            ` : ''}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            <span>💳 ${membresia}</span>
                            <span class="mx-2">•</span>
                            <span>🕐 Primera entrada: ${horaEntrada}</span>
                            ${visitante.totalVisitas > 1 ? `
                                <span class="mx-2">•</span>
                                <span>Última: ${horaUltima}</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Estado de presencia -->
                <div class="text-right">
                    <p class="text-xs font-semibold ${colorEstado}">${estadoPresencia}</p>
                    <p class="text-xs text-gray-500 mt-1">
                        Hace ${tiempoTranscurrido < 60 ? tiempoTranscurrido + 'm' : Math.floor(tiempoTranscurrido / 60) + 'h'}
                    </p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Reinicializar iconos de Lucide
    lucide.createIcons();
};

// Botón para refrescar visitantes
document.getElementById('refrescar-visitantes').addEventListener('click', () => {
    cargarVisitantesDelDia();
});

// Cargar visitantes al inicio
cargarVisitantesDelDia();

// Actualizar visitantes cada 30 segundos
setInterval(cargarVisitantesDelDia, 30000);
