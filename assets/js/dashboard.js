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
