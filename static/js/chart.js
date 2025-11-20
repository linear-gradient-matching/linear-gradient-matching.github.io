const data = {
    models: ['CLIP', 'DINO-v2', 'EVA-02', 'MoCo-v3'],
    methods: ['Distilled (Ours)', 'Neighbors', 'Centroids', 'Random'],
    imagenet100: {
        'Distilled (Ours)': [84.9, 91.5, 89.0, 83.4],
        'Neighbors': [67.8, 86.0, 78.8, 77.1],
        'Centroids': [77.1, 86.9, 80.9, 77.7],
        'Random': [56.6, 74.8, 64.5, 61.4]
    },
    imagenet1k: {
        'Distilled (Ours)': [63.0, 75.0, 70.3, 63.2],
        'Neighbors': [38.8, 67.7, 49.9, 56.4],
        'Centroids': [53.9, 69.5, 58.1, 57.4],
        'Random': [31.7, 50.3, 37.7, 38.8]
    }
};

// const colors = {
//     'Distilled (Ours)': 'rgba(46, 204, 113, 0.8)',
//     'Neighbors': 'rgba(52, 152, 219, 0.8)',
//     'Centroids': 'rgba(155, 89, 182, 0.8)',
//     'Random': 'rgba(231, 76, 60, 0.8)'
// };
//
// const borderColors = {
//     'Distilled (Ours)': 'rgba(46, 204, 113, 1)',
//     'Neighbors': 'rgba(52, 152, 219, 1)',
//     'Centroids': 'rgba(155, 89, 182, 1)',
//     'Random': 'rgba(231, 76, 60, 1)'
// };

const colors = {
    'Distilled (Ours)': 'rgba(117, 0, 20, 0.8)',
    'Neighbors': 'rgba(32, 0, 107, 0.8)',
    'Centroids': 'rgba(0, 40, 150, 0.8)',
    'Random': 'rgba(0, 77, 26, 0.8)'
};

const borderColors = {
    'Distilled (Ours)': 'rgba(117, 0, 20, 1)',
    'Neighbors': 'rgba(32, 0, 107, 1)',
    'Centroids': 'rgba(0, 40, 150, 1)',
    'Random': 'rgba(0, 77, 26, 1)'
};

// Set global Chart.js defaults for much larger fonts
Chart.defaults.font.size = 18;
Chart.defaults.font.family = "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.font.weight = '600';

function createChart(canvasId, dataset, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('Canvas element not found:', canvasId);
        return;
    }

    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;

    const datasets = data.methods.map(method => ({
        label: method,
        data: dataset[method],
        backgroundColor: colors[method],
        borderColor: borderColors[method],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
    }));

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.models,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 2, // Fix blurry text
            animation: {
                duration: 2000,
                easing: 'easeOutQuart',
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default') {
                        delay = context.dataIndex * 150 + context.datasetIndex * 50;
                    }
                    return delay;
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: isSmallMobile ? 13 : (isMobile ? 16 : 20),  // Much larger: 20px desktop
                            weight: '700',  // Extra bold
                            family: "'Inter', sans-serif",

                        },
                        color: '#212326',
                        padding: isMobile ? 15 : 25,
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        boxWidth: isMobile ? 12 : 15,
                        boxHeight: isMobile ? 12 : 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 16,
                    titleFont: {
                        size: isSmallMobile ? 15 : (isMobile ? 17 : 20),  // Larger tooltips
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: isSmallMobile ? 14 : (isMobile ? 16 : 18),
                        family: "'Inter', sans-serif"
                    },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: isSmallMobile ? 12 : (isMobile ? 15 : 19),  // Much larger: 19px desktop
                            weight: '700',  // Extra bold
                            family: "'Inter', sans-serif"
                        },
                        // color: '#333',
                        color: '#212326',
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0,
                        padding: isMobile ? 5 : 10
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 80,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        lineWidth: 1
                    },
                    ticks: {
                        font: {
                            size: isSmallMobile ? 13 : (isMobile ? 15 : 18),  // Much larger: 18px desktop
                            weight: '600',
                            family: "'Inter', sans-serif"
                        },
                        // color: '#666',
                        color: '#212326',
                        padding: 8,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    return chart;
}

// Track which charts have been drawn
const chartsDrawn = {
    chart100: false,
    chart1k: false
};

// Initialize Intersection Observer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChartObservers);
} else {
    initChartObservers();
}

function initChartObservers() {
    // Create Intersection Observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the chart is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const canvasId = entry.target.id;

                // Draw the chart if it hasn't been drawn yet
                if (canvasId === 'chart100' && !chartsDrawn.chart100) {
                    createChart('chart100', data.imagenet100, 'ImageNet-100');
                    console.log('Chart100 drawn on scroll');
                    chartsDrawn.chart100 = true;
                    observer.unobserve(entry.target);
                } else if (canvasId === 'chart1k' && !chartsDrawn.chart1k) {
                    createChart('chart1k', data.imagenet1k, 'ImageNet-1k');
                    console.log('Chart1k drawn on scroll');
                    chartsDrawn.chart1k = true;
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    // Start observing the chart canvases
    const chart100 = document.getElementById('chart100');
    const chart1k = document.getElementById('chart1k');

    if (chart100) {
        observer.observe(chart100);
    }
    if (chart1k) {
        observer.observe(chart1k);
    }
}

// Handle window resize to update font sizes
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Charts will automatically update on resize thanks to Chart.js responsive mode
        console.log('Window resized, charts updating...');
    }, 250);
});