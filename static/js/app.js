// Lab Capacity Model - JavaScript Frontend
// Handles all UI interactions and API calls

class LabCapacityApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.charts = {};
        this.methods = [];
        this.realtimeCapacity = {};
        this.updateInterval = null;
        this.init();
    }

    async init() {
        // Set up initial date
        document.getElementById('schedule-date').valueAsDate = new Date();
        
        // Load method data for demand form first
        await this.loadMethods();
        this.loadRealtimeData();
        
        // Load initial data
        this.loadDashboard();
        this.loadResources();
        this.loadSchedule();
        this.loadDemand();
        this.loadOptimization();
        this.loadReports();
        
        // Set up auto-refresh
        this.updateInterval = setInterval(() => {
            this.refreshCurrentTab();
            this.loadRealtimeData(); // Refresh real-time data more frequently
        }, 30000); // 30 seconds
        
        console.log('Lab Capacity Model initialized');
    }

    // Tab management
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        
        // Add active class to selected nav link
        event.target.classList.add('active');
        
        this.currentTab = tabName;
        this.refreshCurrentTab();
    }

    refreshCurrentTab() {
        switch(this.currentTab) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'schedule':
                this.loadSchedule();
                break;
            case 'resources':
                this.loadResources();
                break;
            case 'demand':
                this.loadDemand();
                break;
            case 'optimization':
                this.loadOptimization();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // API calls
    async apiCall(endpoint) {
        try {
            const response = await fetch(`/api/${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            return null;
        }
    }

    // Dashboard functions
    async loadDashboard() {
        const data = await this.apiCall('dashboard');
        if (data) {
            this.updateKPIs(data);
        }
        
        // Load charts
        this.loadPersonnelChart();
        this.loadInstrumentChart();
        this.loadTimelineChart();
    }

    updateKPIs(data) {
        document.getElementById('personnel-kpi').textContent = 
            `${data.personnel.available}/${data.personnel.total}`;
        document.getElementById('personnel-util').textContent = 
            `Avg Utilization: ${data.personnel.avg_utilization}%`;
        
        document.getElementById('instruments-kpi').textContent = 
            `${data.instruments.available}/${data.instruments.total}`;
        document.getElementById('instruments-util').textContent = 
            `Avg Utilization: ${data.instruments.avg_utilization}%`;
        
        document.getElementById('projects-kpi').textContent = data.projects.active;
        document.getElementById('projects-total').textContent = 
            `Total Projects: ${data.projects.total}`;
        
        document.getElementById('capacity-kpi').textContent = `${data.overall_capacity}%`;
    }

    async loadPersonnelChart() {
        const data = await this.apiCall('personnel/utilization');
        if (!data) return;

        const ctx = document.getElementById('personnelChart').getContext('2d');
        
        if (this.charts.personnel) {
            this.charts.personnel.destroy();
        }
        
        // Professional gradient colors
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        
        this.charts.personnel = new Chart(ctx, {
            type: 'bar',
            data: {
                ...data,
                datasets: [{
                    ...data.datasets[0],
                    backgroundColor: gradient,
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
                    hoverBorderColor: '#1d4ed8',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Utilization: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            lineWidth: 1
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Utilization Percentage',
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        border: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 11
                            },
                            maxRotation: 45
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    async loadInstrumentChart() {
        const data = await this.apiCall('instruments/status');
        if (!data) return;

        const ctx = document.getElementById('instrumentChart').getContext('2d');
        
        if (this.charts.instrument) {
            this.charts.instrument.destroy();
        }
        
        // Professional color palette
        const professionalColors = [
            '#10b981', // Emerald - Available
            '#f59e0b', // Amber - In Use  
            '#ef4444', // Red - Maintenance
            '#6b7280'  // Gray - Other
        ];
        
        this.charts.instrument = new Chart(ctx, {
            type: 'doughnut',
            data: {
                ...data,
                datasets: [{
                    ...data.datasets[0],
                    backgroundColor: professionalColors,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverBackgroundColor: professionalColors.map(color => color + 'dd'),
                    hoverBorderColor: '#ffffff',
                    hoverBorderWidth: 4,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 13,
                                weight: '500'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    async loadTimelineChart() {
        const data = await this.apiCall('capacity/timeline');
        if (!data) return;

        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        if (this.charts.timeline) {
            this.charts.timeline.destroy();
        }
        
        // Create subtle gradients for area fills
        const personnelGradient = ctx.createLinearGradient(0, 0, 0, 180);
        personnelGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
        personnelGradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
        
        const instrumentGradient = ctx.createLinearGradient(0, 0, 0, 180);
        instrumentGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        instrumentGradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
        
        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                ...data,
                datasets: data.datasets.map((dataset, index) => ({
                    ...dataset,
                    borderColor: index === 0 ? '#3b82f6' : '#10b981',
                    backgroundColor: index === 0 ? personnelGradient : instrumentGradient,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: index === 0 ? '#3b82f6' : '#10b981',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: index === 0 ? '#3b82f6' : '#10b981',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2,
                    tension: 0.3,
                    fill: true
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12,
                                weight: '500'
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 8,
                            boxHeight: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#f9fafb',
                        bodyColor: '#f9fafb',
                        borderColor: '#374151',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            title: function(context) {
                                const date = new Date(context[0].label);
                                return date.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                });
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(156, 163, 175, 0.2)',
                            lineWidth: 1,
                            drawBorder: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 11
                            },
                            padding: 8,
                            maxTicksLimit: 6,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Utilization %',
                            color: '#4b5563',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12,
                                weight: '600'
                            },
                            padding: 12
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(156, 163, 175, 0.15)',
                            lineWidth: 1,
                            drawBorder: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 10
                            },
                            padding: 8,
                            maxTicksLimit: 7,
                            callback: function(value, index, values) {
                                const date = new Date(this.getLabelForValue(value));
                                return date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        capBezierPoints: false
                    }
                },
                animation: {
                    duration: 1800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Schedule functions
    async loadSchedule() {
        this.loadGanttChart();
        this.loadAssignments();
    }

    async loadGanttChart() {
        const data = await this.apiCall('schedule/gantt');
        if (!data) return;

        const ganttContainer = document.getElementById('gantt-chart');
        ganttContainer.innerHTML = '';

        // Create header
        const header = document.createElement('div');
        header.className = 'gantt-row';
        header.style.borderBottom = '2px solid #dee2e6';
        header.style.fontWeight = 'bold';
        header.innerHTML = `
            <div class="gantt-label">Resource</div>
            <div class="gantt-timeline" style="text-align: center; background: #f8f9fa;">
                Timeline (${new Date().toLocaleDateString()})
            </div>
        `;
        ganttContainer.appendChild(header);

        // Create rows for each task
        data.forEach(task => {
            const row = document.createElement('div');
            row.className = 'gantt-row';
            
            const startTime = new Date(task.start);
            const endTime = new Date(task.end);
            const duration = (endTime - startTime) / (1000 * 60 * 60); // hours
            
            // Calculate position (assuming 8 hour workday from 9 AM to 5 PM)
            const startHour = startTime.getHours() + startTime.getMinutes() / 60;
            const left = ((startHour - 9) / 8) * 100; // percentage
            const width = (duration / 8) * 100; // percentage
            
            row.innerHTML = `
                <div class="gantt-label">${task.resource}</div>
                <div class="gantt-timeline">
                    <div class="gantt-task" 
                         style="left: ${left}%; width: ${width}%; background-color: ${task.color};"
                         title="${task.name} (${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()})">
                        ${task.name}
                    </div>
                </div>
            `;
            
            ganttContainer.appendChild(row);
        });
    }

    async loadAssignments() {
        const data = await this.apiCall('assignments/today');
        if (!data) return;

        const tbody = document.querySelector('#assignments-table tbody');
        tbody.innerHTML = '';

        data.forEach(assignment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${assignment.time}</td>
                <td>${assignment.personnel}</td>
                <td>${assignment.instrument}</td>
                <td>${assignment.task}</td>
                <td><span class="status-${assignment.status.toLowerCase().replace(' ', '-')}">${assignment.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Resources functions
    async loadResources() {
        this.loadPersonnelTable();
        this.loadInstrumentsTable();
    }

    async loadPersonnelTable() {
        const data = await this.apiCall('personnel');
        if (!data) return;

        const tbody = document.querySelector('#personnel-table tbody');
        tbody.innerHTML = '';

        data.forEach(person => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${person.name}</td>
                <td>${person.role}</td>
                <td>${person.department}</td>
                <td><span class="status-${person.status.toLowerCase().replace(' ', '-')}">${person.status}</span></td>
                <td>${person.utilization}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadInstrumentsTable() {
        const data = await this.apiCall('instruments');
        if (!data) return;

        const tbody = document.querySelector('#instruments-table tbody');
        tbody.innerHTML = '';

        data.forEach(instrument => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${instrument.name}</td>
                <td>${instrument.type}</td>
                <td>${instrument.location}</td>
                <td><span class="status-${instrument.status.toLowerCase().replace(' ', '-')}">${instrument.status}</span></td>
                <td>${instrument.utilization}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Demand functions
    async loadDemand() {
        this.loadDemandChart();
        this.loadDemandQueue();
        this.loadDemandByInstrument();
        this.loadDemandCapacityGap();
    }

    async loadDemandChart() {
        const data = await this.apiCall('demand/forecast');
        if (!data) return;

        const ctx = document.getElementById('demandChart').getContext('2d');
        
        if (this.charts.demand) {
            this.charts.demand.destroy();
        }
        
        // Store demand items for table integration
        this.demandItems = data.demand_items || [];
        
        // Store data reference for tooltip access
        const chartData = data;
        
        this.charts.demand = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 13,
                                weight: '500'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                const date = new Date(context[0].label);
                                return date.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} samples`;
                            },
                            afterBody: function(context) {
                                const date = context[0].label;
                                const demandItems = chartData.demand_items.filter(item => item.date === date);
                                if (demandItems.length > 0) {
                                    let tooltipLines = [''];
                                    demandItems.forEach(item => {
                                        tooltipLines.push(`📊 ${item.method_name}: ${item.sample_count} samples`);
                                        tooltipLines.push(`👤 Client: ${item.client}`);
                                        tooltipLines.push(`📋 Project: ${item.project}`);
                                        tooltipLines.push(`⚡ Priority: ${item.priority.toUpperCase()}`);
                                        tooltipLines.push(`📅 Status: ${item.status}`);
                                        
                                        if (item.assay_breakdown && item.assay_breakdown.length > 0) {
                                            tooltipLines.push('🔬 Assay Breakdown:');
                                            item.assay_breakdown.forEach(assay => {
                                                tooltipLines.push(`• ${assay.name}: ${assay.samples} samples (${assay.batches} batches)`);
                                            });
                                        }
                                        tooltipLines.push('');
                                    });
                                    return tooltipLines;
                                }
                                return [];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            lineWidth: 1
                        },
                        border: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 11
                            },
                            maxTicksLimit: 10,
                            callback: function(value, index, values) {
                                const date = new Date(this.getLabelForValue(value));
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            lineWidth: 1
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12
                            },
                            callback: function(value) {
                                return value + ' samples';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Daily Sample Count',
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 14,
                                weight: '600'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const element = elements[0];
                        const dataIndex = element.index;
                        const date = data.labels[dataIndex];
                        this.highlightDemandTableRow(date);
                    }
                }
            }
        });
    }

    highlightChartBar(date) {
        if (!this.charts.demand) return;
        
        // Remove previous highlights
        document.querySelectorAll('.demand-row').forEach(row => {
            row.classList.remove('table-active');
        });
        
        // Highlight the corresponding table row
        const tableRow = document.querySelector(`tr[data-date="${date}"]`);
        if (tableRow) {
            tableRow.classList.add('table-active');
        }
        
        // Highlight the chart bar (simplified - Chart.js doesn't have built-in highlighting)
        // We could implement custom highlighting by redrawing the chart with different colors
        console.log(`Highlighting chart bar for date: ${date}`);
    }

    highlightDemandTableRow(date) {
        // Remove previous highlights
        document.querySelectorAll('.demand-row').forEach(row => {
            row.classList.remove('table-active');
        });
        
        // Highlight the corresponding table row
        const tableRow = document.querySelector(`tr[data-date="${date}"]`);
        if (tableRow) {
            tableRow.classList.add('table-active');
            tableRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    async loadDemandQueue() {
        // Get demand queue data with proper method/assay structure
        const data = await this.apiCall('demand/queue');
        if (!data) return;

        const tbody = document.querySelector('#demand-queue-table tbody');
        tbody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-date', item.start_date);
            row.className = 'demand-row';
            
            // Create assay breakdown display
            let assayBreakdownHTML = '';
            if (item.assay_breakdown && item.assay_breakdown.length > 0) {
                assayBreakdownHTML = item.assay_breakdown.map(assay => 
                    `<div><strong>${assay.name}:</strong> ${assay.samples} samples (${assay.batches} batches) - ${assay.category}</div>`
                ).join('');
            } else {
                assayBreakdownHTML = '<div>No assay breakdown available</div>';
            }
            
            row.innerHTML = `
                <td><span class="badge bg-primary">${item.id}</span></td>
                <td>
                    <div>${item.client}</div>
                    <small class="text-muted">${item.project_name}</small>
                </td>
                <td>
                    <div>${item.method_name || item.method}</div>
                    <small class="text-muted">${item.method}</small>
                </td>
                <td>
                    <div><strong>${item.sample_count}</strong></div>
                    <small class="text-muted">samples</small>
                </td>
                <td>
                    <div class="small">${assayBreakdownHTML}</div>
                </td>
                <td>${this.formatDate(item.start_date)}</td>
                <td><span class="priority-${item.priority.toLowerCase()}">${item.priority}</span></td>
                <td><span class="status-${item.status.toLowerCase()}">${item.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editDemand('${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="scheduleDemand('${item.id}')" title="Schedule">
                        <i class="fas fa-calendar-plus"></i>
                    </button>
                </td>
            `;
            
            // Add click handler for highlighting chart
            row.addEventListener('click', () => {
                this.highlightChartBar(item.start_date);
            });
            
            tbody.appendChild(row);
        });

        // Update batch planning metrics based on assay breakdowns
        const totalSamples = data.reduce((sum, item) => sum + item.sample_count, 0);
        const totalBatches = data.reduce((sum, item) => {
            return sum + (item.assay_breakdown ? item.assay_breakdown.reduce((batchSum, assay) => batchSum + assay.batches, 0) : 0);
        }, 0);
        const avgBatchSize = totalBatches > 0 ? Math.round(totalSamples / totalBatches) : 0;
        const totalHours = data.reduce((sum, item) => {
            // Estimate based on assay complexity
            const assayHours = item.assay_breakdown ? item.assay_breakdown.reduce((hourSum, assay) => {
                const timePerBatch = assay.category === 'LC-MS' ? 6 : assay.category === 'SEC' ? 8 : 4;
                return hourSum + (assay.batches * timePerBatch);
            }, 0) : item.sample_count * 2;
            return sum + assayHours;
        }, 0);

        document.getElementById('total-samples').textContent = totalSamples.toLocaleString();
        document.getElementById('total-batches').textContent = totalBatches.toLocaleString();
        document.getElementById('avg-batch-size').textContent = avgBatchSize;
        document.getElementById('total-hours').textContent = totalHours.toLocaleString();
    }

    async loadDemandByInstrument() {
        const data = await this.apiCall('demand/by-instrument');
        if (!data) return;

        const ctx = document.getElementById('demandByInstrumentChart').getContext('2d');
        
        if (this.charts.demandByInstrument) {
            this.charts.demandByInstrument.destroy();
        }
        
        this.charts.demandByInstrument = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12,
                                weight: '500'
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed}% (${percentage}% of total)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1500
                }
            }
        });
    }

    async loadDemandCapacityGap() {
        const data = await this.apiCall('demand/capacity-gap');
        if (!data) return;

        const ctx = document.getElementById('demandCapacityGapChart').getContext('2d');
        
        if (this.charts.demandCapacityGap) {
            this.charts.demandCapacityGap.destroy();
        }
        
        this.charts.demandCapacityGap = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12,
                                weight: '500'
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} hours`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(156, 163, 175, 0.2)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                return value + 'h';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Hours per Week',
                            color: '#4b5563',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Optimization functions
    async loadOptimization() {
        this.loadCapacityOverview();
        this.loadOptimizedSchedule();
    }

    async loadCapacityOverview() {
        const data = await this.apiCall('capacity/overview');
        if (!data) return;

        const tbody = document.querySelector('#capacity-overview-table tbody');
        tbody.innerHTML = '';

        data.by_method.forEach(method => {
            const row = document.createElement('tr');
            
            // Determine bottleneck styling
            const bottleneckClass = method.bottleneck_factor === 'instrument' ? 'text-danger' :
                                  method.bottleneck_factor === 'personnel' ? 'text-warning' : 'text-success';
            
            // Utilization color coding
            const utilizationClass = method.current_utilization > 90 ? 'text-danger' :
                                   method.current_utilization > 75 ? 'text-warning' : 'text-success';
            
            row.innerHTML = `
                <td>
                    <div>${method.method_name}</div>
                    <small class="text-muted">${method.method_id}</small>
                </td>
                <td><strong>${method.daily_capacity}</strong> samples</td>
                <td><strong>${method.weekly_capacity}</strong> samples</td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar ${utilizationClass.replace('text-', 'bg-')}" 
                             style="width: ${method.current_utilization}%;">
                            ${method.current_utilization}%
                        </div>
                    </div>
                </td>
                <td><span class="text-success">${method.available_capacity}%</span></td>
                <td>${method.qualified_operators}</td>
                <td>${method.available_instruments}</td>
                <td><span class="${bottleneckClass}">${method.bottleneck_factor.toUpperCase()}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadOptimizedSchedule() {
        // For now, use current demand queue for optimization
        const demandData = await this.apiCall('demand/queue');
        if (!demandData) return;

        // Call optimization API
        const optimizationRequest = {
            sample_requests: demandData.map(demand => ({
                id: demand.id,
                method: demand.method || 'hplc-potency',
                sample_count: demand.sample_count,
                priority: demand.priority,
                required_by_date: demand.start_date
            }))
        };

        try {
            const response = await fetch('/api/scheduling/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(optimizationRequest)
            });

            const result = await response.json();
            
            if (result) {
                this.displayOptimizedSchedule(result);
                this.displayOptimizationInsights(result);
            }
        } catch (error) {
            console.error('Error optimizing schedule:', error);
        }
    }

    displayOptimizedSchedule(optimizationResult) {
        const ganttContainer = document.getElementById('optimized-schedule-gantt');
        ganttContainer.innerHTML = '';

        // Update efficiency badge
        document.getElementById('scheduleEfficiency').textContent = optimizationResult.schedule_efficiency;

        // Create header
        const header = document.createElement('div');
        header.className = 'gantt-row';
        header.style.borderBottom = '2px solid #dee2e6';
        header.style.fontWeight = 'bold';
        header.innerHTML = `
            <div class="gantt-label" style="width: 250px;">Operator → Instrument</div>
            <div class="gantt-timeline" style="text-align: center; background: #f8f9fa;">
                Optimized Schedule Timeline
            </div>
        `;
        ganttContainer.appendChild(header);

        // Group by operator for cleaner display
        const scheduleByOperator = {};
        optimizationResult.optimized_schedule.forEach(batch => {
            if (!scheduleByOperator[batch.operator]) {
                scheduleByOperator[batch.operator] = [];
            }
            scheduleByOperator[batch.operator].push(batch);
        });

        // Create rows for each operator
        Object.entries(scheduleByOperator).forEach(([operator, batches]) => {
            const row = document.createElement('div');
            row.className = 'gantt-row';
            
            let tasksHtml = '';
            batches.forEach(batch => {
                const startTime = new Date(batch.start_time);
                const endTime = new Date(batch.end_time);
                const duration = (endTime - startTime) / (1000 * 60 * 60); // hours
                
                // Calculate position (assuming 8 hour workday from 8 AM to 4 PM)
                const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                const left = ((startHour - 8) / 8) * 100; // percentage
                const width = (duration / 8) * 100; // percentage
                
                const priorityColor = batch.priority === 'critical' ? '#dc3545' :
                                    batch.priority === 'high' ? '#fd7e14' :
                                    batch.priority === 'medium' ? '#20c997' : '#6c757d';
                
                tasksHtml += `
                    <div class="gantt-task" 
                         style="left: ${left}%; width: ${width}%; background-color: ${priorityColor};"
                         title="${batch.batch_id}: ${batch.method} on ${batch.instrument} (${batch.samples_in_batch} samples)">
                        ${batch.batch_id}
                    </div>
                `;
            });
            
            row.innerHTML = `
                <div class="gantt-label" style="width: 250px;">
                    <div><strong>${operator}</strong></div>
                    <small class="text-muted">${batches.length} batches assigned</small>
                </div>
                <div class="gantt-timeline">
                    ${tasksHtml}
                </div>
            `;
            
            ganttContainer.appendChild(row);
        });
    }

    displayOptimizationInsights(optimizationResult) {
        // Display bottlenecks
        const bottlenecksList = document.getElementById('bottlenecksList');
        bottlenecksList.innerHTML = '';
        
        optimizationResult.bottlenecks.forEach(bottleneck => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                    <span>${bottleneck}</span>
                </div>
            `;
            bottlenecksList.appendChild(li);
        });

        // Display recommendations
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';
        
        optimizationResult.recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-lightbulb text-info me-2"></i>
                    <span>${recommendation}</span>
                </div>
            `;
            recommendationsList.appendChild(li);
        });
    }

    // Reports functions
    async loadReports() {
        this.loadTrendChart();
        this.loadProjectsTable();
    }

    async loadTrendChart() {
        const data = await this.apiCall('utilization/trend');
        if (!data) return;

        const ctx = document.getElementById('trendChart').getContext('2d');
        
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }
        
        // Create professional gradients
        const personnelGradient = ctx.createLinearGradient(0, 0, 0, 300);
        personnelGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        personnelGradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
        
        const instrumentGradient = ctx.createLinearGradient(0, 0, 0, 300);
        instrumentGradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        instrumentGradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                ...data,
                datasets: data.datasets.map((dataset, index) => ({
                    ...dataset,
                    borderColor: index === 0 ? '#3b82f6' : '#10b981',
                    backgroundColor: index === 0 ? personnelGradient : instrumentGradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: index === 0 ? '#3b82f6' : '#10b981',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: index === 0 ? '#3b82f6' : '#10b981',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3,
                    tension: 0.4,
                    fill: true
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 13,
                                weight: '500'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return new Date(context[0].label).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            lineWidth: 1
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 12
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: '30-Day Utilization Trend',
                            color: '#374151',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            lineWidth: 1
                        },
                        border: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: "'Segoe UI', system-ui, sans-serif",
                                size: 11
                            },
                            maxTicksLimit: 10,
                            callback: function(value, index, values) {
                                const date = new Date(this.getLabelForValue(value));
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        capBezierPoints: false
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    async loadProjectsTable() {
        const data = await this.apiCall('projects');
        if (!data) return;

        const tbody = document.querySelector('#projects-table tbody');
        tbody.innerHTML = '';

        data.forEach(project => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${project.name}</td>
                <td>${project.status}</td>
                <td><span class="priority-${project.priority.toLowerCase()}">${project.priority}</span></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${project.progress}%;" 
                             aria-valuenow="${project.progress}" 
                             aria-valuemin="0" aria-valuemax="100">
                            ${project.progress}%
                        </div>
                    </div>
                </td>
                <td>${project.due_date || 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Event handlers
    updateSchedule() {
        this.loadGanttChart();
    }

    addTask() {
        alert('Add Task functionality - to be implemented');
    }

    exportExcel() {
        alert('Excel export functionality - to be implemented');
    }

    // Demand functionality
    async submitDemand() {
        const formData = {
            project_name: document.getElementById('demandProjectName').value,
            client: document.getElementById('demandClient').value,
            method: document.getElementById('demandMethod').value,
            sample_count: parseInt(document.getElementById('demandSampleCount').value) || 0,
            start_date: document.getElementById('demandStartDate').value,
            priority: document.getElementById('demandPriority').value,
            status: document.getElementById('demandStatus').value,
            requirements: document.getElementById('demandRequirements').value
        };

        // Get required by date for validation
        const requiredByDate = document.getElementById('demandRequiredByDate').value;

        // Validation
        if (!formData.project_name || !formData.client || !formData.method || !requiredByDate) {
            alert('Please fill in all required fields:\n- Project Name\n- Client\n- Method/Assay\n- Required By Date');
            return;
        }

        if (formData.sample_count <= 0) {
            alert('Sample count must be greater than 0');
            return;
        }

        // Get method details for display
        let methodName = formData.method;
        if (this.methods && this.methods.length > 0) {
            const method = this.methods.find(m => m.id === formData.method);
            methodName = method ? method.name : formData.method;
        }

        try {
            const response = await fetch('/api/demand/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                const requiredBy = this.formatDate(requiredByDate);
                const startDate = this.formatDate(formData.start_date);
                
                // Create assay breakdown text for display
                let assayBreakdownText = '';
                if (result.data.assay_breakdown && result.data.assay_breakdown.length > 0) {
                    assayBreakdownText = '\n\nAssay Breakdown:\n' + 
                        result.data.assay_breakdown.map(assay => 
                            `- ${assay.name}: ${assay.samples} samples (${assay.batches} batches) - ${assay.category}`
                        ).join('\n');
                }
                
                alert(`Sample request ${result.id} added successfully!\n\nDetails:\n- Client: ${formData.client}\n- Project: ${formData.project_name}\n- Method: ${result.data.method_name || methodName}\n- Sample Count: ${formData.sample_count}\n- Priority: ${formData.priority.toUpperCase()}\n- Status: ${formData.status}\n- Required by: ${requiredBy}\n- Start date: ${startDate}${assayBreakdownText}`);
                
                // Reset form
                document.getElementById('demandForm').reset();
                document.getElementById('methodDetails').style.display = 'none';
                document.getElementById('sampleBreakdown').style.display = 'none';
                this.updateSampleCalculations(); // Reset the calculated values
                
                // Refresh demand queue and forecast
                this.loadDemandQueue();
                this.loadDemandChart();
            } else {
                alert(`Error adding sample request: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error submitting demand:', error);
            alert('Error submitting sample request');
        }
    }

    // Update sample calculations and breakdown
    updateSampleCalculations() {
        const sampleCount = parseInt(document.getElementById('demandSampleCount').value) || 0;
        
        // Update total samples display
        document.getElementById('demandTotalSamples').textContent = sampleCount;
        
        // Calculate estimated time (2 hours per sample as estimate)
        const estimatedTime = sampleCount * 2;
        document.getElementById('demandEstimatedTime').textContent = `${estimatedTime} hours`;
        
        // Calculate priority based on total samples
        let priority = 'low';
        if (sampleCount > 50) priority = 'high';
        else if (sampleCount > 30) priority = 'medium';
        
        document.getElementById('demandCalculatedPriority').textContent = priority;
        document.getElementById('demandCalculatedPriority').className = `text-${priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'success'}`;
        
        // Update priority dropdown to match calculated priority
        document.getElementById('demandPriority').value = priority;

        // Update sample breakdown if method is selected
        const methodId = document.getElementById('demandMethod').value;
        if (methodId && this.methods) {
            const method = this.methods.find(m => m.id === methodId);
            if (method) {
                this.updateSampleBreakdown(method);
            }
        }
    }

    addDemandForecast() {
        alert('Add Demand Forecast functionality - to be implemented');
    }

    importDemand() {
        alert('Import Demand Data functionality - to be implemented');
    }

    editDemand(id) {
        alert(`Edit demand ${id} functionality - to be implemented`);
    }

    scheduleDemand(id) {
        alert(`Schedule demand ${id} functionality - to be implemented`);
    }

    // Method management
    async loadMethods() {
        try {
            const data = await this.apiCall('admin/methods');
            if (!data) return;

            this.methodsMap = new Map();

            const tbody = document.querySelector('#methods-table tbody');
            tbody.innerHTML = '';
            
            data.forEach(method => {
                this.methodsMap.set(method.id, method);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="badge bg-primary">${method.id}</span></td>
                    <td>${method.name}</td>
                    <td><span class="badge bg-secondary">${method.category}</span></td>
                    <td>${method.lead_time_days} days</td>
                    <td><span class="badge ${method.is_active ? 'bg-success' : 'bg-danger'}">${method.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editMethod('${method.id}')" title="Edit Method">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMethod('${method.id}')" title="Delete Method">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading methods:', error);
        }
    }

    updateMethodDetails() {
        const methodId = document.getElementById('demandMethod').value;
        const methodDetails = document.getElementById('methodDetails');
        const sampleBreakdown = document.getElementById('sampleBreakdown');
        
        if (!methodId) {
            methodDetails.style.display = 'none';
            sampleBreakdown.style.display = 'none';
            return;
        }

        // Ensure methods are loaded
        if (!this.methods || this.methods.length === 0) {
            console.warn('Methods not loaded yet, loading now...');
            this.loadMethods().then(() => {
                // Retry after methods are loaded
                if (this.methods && this.methods.length > 0) {
                    this.updateMethodDetails();
                }
            });
            return;
        }

        const method = this.methods.find(m => m.id === methodId);
        if (!method) {
            methodDetails.style.display = 'none';
            sampleBreakdown.style.display = 'none';
            return;
        }

        // Get all instrument categories and personnel from assays
        const instrumentCategories = [...new Set(method.assays?.map(a => a.instrument_category) || [])];
        const allPersonnel = [...new Set(method.assays?.flatMap(a => a.qualified_personnel) || [])];
        
        // Calculate overall batch info
        const avgBatchSize = method.assays?.length ? Math.round(method.assays.reduce((sum, a) => sum + a.batch_size, 0) / method.assays.length) : 0;
        const totalTime = method.assays?.reduce((sum, a) => sum + a.time_per_batch, 0) || 0;

        // Update method details display
        document.getElementById('methodInstruments').textContent = instrumentCategories.join(', ');
        document.getElementById('methodPersonnel').textContent = allPersonnel.join(', ');
        document.getElementById('methodBatchSize').textContent = avgBatchSize;
        document.getElementById('methodTimePerBatch').textContent = totalTime;
        document.getElementById('methodLeadTime').textContent = method.lead_time_days;
        document.getElementById('methodDescription').textContent = method.description || 'No description available';

        // Show method details
        methodDetails.style.display = 'block';

        // Update sample breakdown based on method
        this.updateSampleBreakdown(method);

        // Update calculations if sample count is already entered
        this.updateSampleCalculations();
        
        // Calculate start date if required by date is already set
        this.calculateStartDate();
        
        // Load real-time status for this instrument type
        this.loadRealtimeStatusForMethod(method);
    }

    updateSampleBreakdown(method) {
        const sampleBreakdown = document.getElementById('sampleBreakdown');
        const instrumentBreakdown = document.getElementById('instrumentBreakdown');
        
        if (!method.assays || method.assays.length === 0) {
            sampleBreakdown.style.display = 'none';
            return;
        }

        const sampleCount = parseInt(document.getElementById('demandSampleCount').value) || 0;
        if (sampleCount === 0) {
            sampleBreakdown.style.display = 'none';
            return;
        }

        // Create breakdown display for each assay
        let breakdownHTML = '';
        method.assays.forEach(assay => {
            const batches = Math.ceil(sampleCount / assay.batch_size);
            const totalTime = batches * assay.time_per_batch;
            
            breakdownHTML += `
                <div class="col-md-6 mb-3">
                    <div class="border rounded p-3">
                        <div class="fw-bold text-primary">${assay.name}</div>
                        <div class="small text-muted mb-2">${assay.instrument_category}</div>
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="fw-bold">${sampleCount}</div>
                                <div class="small text-muted">samples</div>
                            </div>
                            <div class="col-4">
                                <div class="fw-bold">${batches}</div>
                                <div class="small text-muted">batches</div>
                            </div>
                            <div class="col-4">
                                <div class="fw-bold">${totalTime}</div>
                                <div class="small text-muted">hours</div>
                            </div>
                        </div>
                        <div class="small text-muted mt-2">
                            Instruments: ${assay.instrument_types.join(', ')}
                        </div>
                    </div>
                </div>
            `;
        });

        instrumentBreakdown.innerHTML = breakdownHTML;
        sampleBreakdown.style.display = 'block';
    }

    getInstrumentCategoriesForMethod(method) {
        // This would typically come from the method-instrument compatibility matrix
        // For now, we'll simulate based on method type
        const sampleCount = parseInt(document.getElementById('demandSampleCount').value) || 0;
        
        if (sampleCount === 0) return [];

        // Realistic instrument breakdown based on analytical method
        const breakdowns = {
            'METABOLITE-PANEL': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 8) },
                { name: 'HPLC-UV', samples: sampleCount, batches: Math.ceil(sampleCount / 24) }
            ],
            'LIPID-PANEL': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 8) },
                { name: 'GC-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 12) }
            ],
            'PURITY-ANALYSIS': [
                { name: 'HPLC-UV', samples: sampleCount, batches: Math.ceil(sampleCount / 24) },
                { name: 'HPLC-CAD', samples: sampleCount, batches: Math.ceil(sampleCount / 24) }
            ],
            'STABILITY-STUDY': [
                { name: 'HPLC-UV', samples: sampleCount, batches: Math.ceil(sampleCount / 24) },
                { name: 'LC-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 16) }
            ],
            'IMPURITY-PROFILE': [
                { name: 'HPLC-UV', samples: sampleCount, batches: Math.ceil(sampleCount / 24) },
                { name: 'LC-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 16) },
                { name: 'GC-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 12) }
            ],
            'RESIDUAL-SOLVENTS': [
                { name: 'GC-FID', samples: sampleCount, batches: Math.ceil(sampleCount / 12) },
                { name: 'GC-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 12) }
            ],
            'ELEMENTAL-ANALYSIS': [
                { name: 'ICP-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 16) },
                { name: 'ICP-OES', samples: sampleCount, batches: Math.ceil(sampleCount / 20) }
            ],
            'BIOANALYTICAL-ASSAY': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 8) },
                { name: 'HPLC-UV', samples: sampleCount, batches: Math.ceil(sampleCount / 24) }
            ],
            'PHARMACOKINETICS': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 8) }
            ],
            'TOXICOKINETICS': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 8) },
                { name: 'GC-MS', samples: sampleCount, batches: Math.ceil(sampleCount / 12) }
            ],
            'BIOMARKER-ANALYSIS': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 8) },
                { name: 'HPLC-UV', samples: sampleCount, batches: Math.ceil(sampleCount / 24) }
            ],
            'PROTEOMICS': [
                { name: 'LC-MS/MS', samples: sampleCount, batches: Math.ceil(sampleCount / 6) },
                { name: 'MALDI-TOF', samples: sampleCount, batches: Math.ceil(sampleCount / 20) }
            ],
            'GENOMICS': [
                { name: 'qPCR', samples: sampleCount, batches: Math.ceil(sampleCount / 96) },
                { name: 'NGS', samples: sampleCount, batches: Math.ceil(sampleCount / 24) }
            ]
        };

        return breakdowns[method.id] || [];
    }

    getInstrumentBreakdownForMethod(methodId, sampleCount) {
        // Find the method and return breakdown based on its assays
        if (!methodId || !sampleCount || !this.methods) return 'No breakdown available';

        const method = this.methods.find(m => m.id === methodId);
        if (!method || !method.assays) return `Method ${methodId}: ${sampleCount} samples`;

        // Create breakdown from assays
        const breakdownParts = method.assays.map(assay => {
            const batches = Math.ceil(sampleCount / assay.batch_size);
            return `${assay.name}: ${sampleCount} samples (${batches} batches)`;
        });

        return breakdownParts.join(', ');
    }

    updateBatchCalculations() {
        const sampleCount = parseInt(document.getElementById('demandSampleCount').value) || 0;
        const batchSize = parseInt(document.getElementById('demandBatchSize').value) || 0;
        const methodId = document.getElementById('demandMethod').value;

        if (!sampleCount || !batchSize || !methodId || !this.methods) {
            document.getElementById('demandBatchesRequired').value = '';
            document.getElementById('demandEstimatedTime').value = '';
            return;
        }

        const method = this.methods.find(m => m.id === methodId);
        if (!method) return;

        const batchesRequired = Math.ceil(sampleCount / batchSize);
        const totalHours = batchesRequired * method.time_per_batch;

        document.getElementById('demandBatchesRequired').value = batchesRequired;
        document.getElementById('demandEstimatedTime').value = `${totalHours} hours`;
    }

    calculateStartDate() {
        const requiredByDate = document.getElementById('demandRequiredByDate').value;
        const methodId = document.getElementById('demandMethod').value;

        if (!requiredByDate || !methodId || !this.methods) {
            document.getElementById('demandStartDate').value = '';
            return;
        }

        const method = this.methods.find(m => m.id === methodId);
        if (!method || !method.lead_time_days) {
            document.getElementById('demandStartDate').value = '';
            return;
        }

        // Calculate start date by subtracting lead time from required by date
        const requiredDate = new Date(requiredByDate);
        const startDate = new Date(requiredDate);
        startDate.setDate(requiredDate.getDate() - method.lead_time_days);

        // Format date for input field (YYYY-MM-DD)
        const formattedStartDate = startDate.toISOString().split('T')[0];
        document.getElementById('demandStartDate').value = formattedStartDate;

        // Check if start date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            // Show warning for past start date
            const daysInPast = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
            document.getElementById('demandStartDate').style.borderColor = '#dc3545';
            document.getElementById('demandStartDate').title = `Warning: Start date is ${daysInPast} days in the past. Consider adjusting the required by date.`;
        } else {
            document.getElementById('demandStartDate').style.borderColor = '';
            document.getElementById('demandStartDate').title = '';
        }
    }

    // Real-time data management
    async loadRealtimeData() {
        const instrumentData = await this.apiCall('eln/instruments/status');
        const personnelData = await this.apiCall('eln/personnel/availability');
        const capacityData = await this.apiCall('capacity/realtime');
        
        if (instrumentData) this.instrumentStatus = instrumentData;
        if (personnelData) this.personnelAvailability = personnelData;
        if (capacityData) this.realtimeCapacity = capacityData;
    }

    loadRealtimeStatusForMethod(method) {
        if (!this.realtimeCapacity || !method) {
            document.getElementById('realtimeStatus').style.display = 'none';
            return;
        }

        const instrumentType = method.instrument_type;
        const capacity = this.realtimeCapacity[instrumentType];
        
        if (!capacity) {
            document.getElementById('realtimeStatus').style.display = 'none';
            return;
        }

        // Update real-time status display
        document.getElementById('availableNow').textContent = `${capacity.available_now}/${capacity.total_instruments}`;
        document.getElementById('queueDepth').textContent = capacity.queue_depth;
        document.getElementById('earliestSlot').textContent = this.formatDateTime(capacity.earliest_slot);
        document.getElementById('avgWaitTime').textContent = capacity.avg_wait_time_hours;

        // Show detailed instrument status
        this.updateInstrumentDetails(instrumentType);

        // Show real-time status
        document.getElementById('realtimeStatus').style.display = 'block';
    }

    updateInstrumentDetails(instrumentType) {
        if (!this.instrumentStatus) return;

        const instruments = this.instrumentStatus.filter(inst => inst.type === instrumentType);
        const detailsContainer = document.getElementById('instrumentDetails');
        
        let detailsHtml = '';
        instruments.forEach(instrument => {
            const statusClass = instrument.status === 'available' ? 'text-success' : 
                              instrument.status === 'running' ? 'text-primary' : 
                              instrument.status === 'maintenance' ? 'text-danger' : 'text-warning';
            
            detailsHtml += `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span><strong>${instrument.instrument_name}</strong> (${instrument.location})</span>
                    <span class="${statusClass}">${instrument.status.toUpperCase()}</span>
                </div>
            `;
            
            if (instrument.status === 'running') {
                const progress = Math.round(((instrument.total_samples_in_batch - instrument.samples_remaining) / instrument.total_samples_in_batch) * 100);
                detailsHtml += `
                    <div class="small text-muted mb-2">
                        Running: ${instrument.current_sample_batch} (${instrument.current_method})<br>
                        Operator: ${instrument.operator} | Progress: ${progress}% | Available: ${this.formatTime(instrument.next_available)}
                    </div>
                `;
            } else if (instrument.status === 'available') {
                detailsHtml += `
                    <div class="small text-success mb-2">
                        ✅ Available now | Next slot: ${this.formatTime(instrument.next_available)}
                    </div>
                `;
            } else if (instrument.status === 'maintenance') {
                detailsHtml += `
                    <div class="small text-danger mb-2">
                        🔧 Under maintenance until ${this.formatDateTime(instrument.maintenance_until)}
                    </div>
                `;
            }
        });
        
        detailsContainer.innerHTML = detailsHtml;
    }

    // Enhanced start date calculation with real-time data
    calculateStartDate() {
        const requiredByDate = document.getElementById('demandRequiredByDate').value;
        const methodId = document.getElementById('demandMethod').value;

        if (!requiredByDate || !methodId || !this.methods) {
            document.getElementById('demandStartDate').value = '';
            return;
        }

        const method = this.methods.find(m => m.id === methodId);
        if (!method || !method.lead_time_days) {
            document.getElementById('demandStartDate').value = '';
            return;
        }

        // Get real-time capacity data for more accurate start date
        let adjustedLeadTime = method.lead_time_days;
        
        if (this.realtimeCapacity && this.realtimeCapacity[method.instrument_type]) {
            const capacity = this.realtimeCapacity[method.instrument_type];
            // Add queue wait time to lead time
            const queueWaitDays = Math.ceil(capacity.avg_wait_time_hours / 24);
            adjustedLeadTime += queueWaitDays;
        }

        // Calculate start date by subtracting adjusted lead time from required by date
        const requiredDate = new Date(requiredByDate);
        const startDate = new Date(requiredDate);
        startDate.setDate(requiredDate.getDate() - adjustedLeadTime);

        // Format date for input field (YYYY-MM-DD)
        const formattedStartDate = startDate.toISOString().split('T')[0];
        document.getElementById('demandStartDate').value = formattedStartDate;

        // Check if start date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            // Show warning for past start date
            const daysInPast = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
            document.getElementById('demandStartDate').style.borderColor = '#dc3545';
            document.getElementById('demandStartDate').title = `Warning: Start date is ${daysInPast} days in the past. Queue delay: ${adjustedLeadTime - method.lead_time_days} days. Consider adjusting the required by date.`;
        } else {
            document.getElementById('demandStartDate').style.borderColor = '#28a745';
            document.getElementById('demandStartDate').title = `Start date includes ${adjustedLeadTime - method.lead_time_days} days queue time`;
        }
    }

    // Utility functions
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    async loadAdmin() {
        this.loadMethods();
        this.loadMethodInstrumentMatrix();
        this.loadOperatorSkills();
        this.loadOperatorHolidays();
        this.loadInstrumentsAdmin();
    }

    async loadMethodInstrumentMatrix() {
        const data = await this.apiCall('admin/method-instrument-matrix');
        if (!data) return;

        const tbody = document.querySelector('#method-instrument-table tbody');
        tbody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.method_name}</td>
                <td><span class="badge bg-info">${item.instrument_category}</span></td>
                <td>${item.instrument_name}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="form-check form-switch me-2">
                            <input class="form-check-input" type="checkbox" ${item.is_compatible ? 'checked' : ''} 
                                   ${item.instrument_status !== 'active' ? 'disabled' : ''}
                                   ${item.instrument_status !== 'active' ? `title="Cannot modify compatibility - Instrument status is '${item.instrument_status}'"` : ''}
                                   onchange="toggleCompatibility('${item.method_id}', '${item.instrument_id}', this.checked)">
                        </div>
                        <span class="badge ${item.instrument_status === 'active' ? 'bg-success' : item.instrument_status === 'maintenance' ? 'bg-warning' : 'bg-danger'} ms-1">
                            ${item.instrument_status}
                        </span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editMethodInstrument('${item.method_id}', '${item.instrument_id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMethodInstrument('${item.method_id}', '${item.instrument_id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadOperatorSkills() {
        const data = await this.apiCall('admin/operator-skills');
        if (!data) return;

        const tbody = document.querySelector('#operator-skills-table tbody');
        tbody.innerHTML = '';
        
        data.forEach(skill => {
            const row = document.createElement('tr');
            const proficiencyClass = skill.proficiency_level === 'Expert' ? 'bg-success' : 
                                   skill.proficiency_level === 'Advanced' ? 'bg-info' : 
                                   skill.proficiency_level === 'Intermediate' ? 'bg-warning' : 'bg-secondary';
            
            row.innerHTML = `
                <td>${skill.operator_name}</td>
                <td>${skill.method_name}</td>
                <td><span class="badge ${proficiencyClass}">${skill.proficiency_level}</span></td>
                <td>${this.formatDate(skill.certification_date)}</td>
                <td>${this.formatDate(skill.last_training)}</td>
                <td><span class="badge ${skill.can_train_others ? 'bg-success' : 'bg-secondary'}">${skill.can_train_others ? 'Yes' : 'No'}</span></td>
                <td>${skill.max_batch_size}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="editOperatorSkill('${skill.operator_id}', '${skill.method_id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteOperatorSkill('${skill.operator_id}', '${skill.method_id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadOperatorHolidays() {
        const data = await this.apiCall('admin/operator-holidays');
        if (!data) return;

        const tbody = document.querySelector('#holidays-table tbody');
        tbody.innerHTML = '';
        
        data.forEach(holiday => {
            const row = document.createElement('tr');
            const statusClass = holiday.status === 'Approved' ? 'bg-success' : 
                              holiday.status === 'Pending' ? 'bg-warning' : 'bg-danger';
            
            row.innerHTML = `
                <td>${holiday.operator_name}</td>
                <td><span class="badge bg-info">${holiday.holiday_type}</span></td>
                <td>${this.formatDate(holiday.start_date)}</td>
                <td>${this.formatDate(holiday.end_date)}</td>
                <td><span class="badge ${statusClass}">${holiday.status}</span></td>
                <td>${this.formatDate(holiday.requested_date)}</td>
                <td>${holiday.approved_by || 'N/A'}</td>
                <td>${holiday.notes}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning" onclick="editHoliday('${holiday.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteHoliday('${holiday.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadInstrumentsAdmin() {
        const data = await this.apiCall('admin/instruments');
        if (!data) return;

        // Store instruments in the app object for access by other functions
        this.instruments = data;

        const tbody = document.querySelector('#instruments-admin-table tbody');
        tbody.innerHTML = '';
        
        data.forEach(instrument => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="badge bg-secondary">${instrument.id}</span></td>
                <td>${instrument.name}</td>
                <td><span class="badge bg-primary">${instrument.category}</span></td>
                <td>${instrument.location}</td>
                <td>
                    <select class="form-select form-select-sm" style="min-width: 120px;" 
                            onchange="updateInstrumentStatus('${instrument.id}', this.value)">
                        <option value="active" ${instrument.status === 'active' ? 'selected' : ''}>🟢 Active</option>
                        <option value="maintenance" ${instrument.status === 'maintenance' ? 'selected' : ''}>🟡 Maintenance</option>
                        <option value="inactive" ${instrument.status === 'inactive' ? 'selected' : ''}>🔴 Inactive</option>
                        <option value="repair" ${instrument.status === 'repair' ? 'selected' : ''}>🔧 Repair</option>
                    </select>
                </td>
                <td>${instrument.max_batch_size}</td>
                <td>${instrument.avg_batch_size || Math.round(instrument.max_batch_size * 0.8)}</td>
                <td>${instrument.run_time_per_sample_min ? (instrument.run_time_per_sample_min / 60).toFixed(2) : 'N/A'}</td>
                <td>
                    <span class="badge ${instrument.failure_rate_percent ? 
                        (instrument.failure_rate_percent <= 2 ? 'bg-success' : 
                         instrument.failure_rate_percent <= 3.5 ? 'bg-warning' : 'bg-danger') : 'bg-secondary'}" 
                        title="${instrument.failure_rate_percent ? 
                            (instrument.failure_rate_percent <= 2 ? 'Excellent reliability (≤2%)' : 
                             instrument.failure_rate_percent <= 3.5 ? 'Good reliability (2-3.5%)' : 'Needs attention (>3.5%)') : 'No data available'}">
                        ${instrument.failure_rate_percent ? instrument.failure_rate_percent.toFixed(1) : 'N/A'}%
                    </span>
                </td>
                <td>${instrument.setup_time_hours}</td>
                <td>${instrument.cleanup_time_hours}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="editInstrument('${instrument.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteInstrument('${instrument.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Global functions for HTML onclick events
function showTab(tabName) {
    window.app.showTab(tabName);
    if (tabName === 'admin') {
        window.app.loadAdmin();
    }
}

function updateSampleCalculations() {
    window.app.updateSampleCalculations();
}

function updateSchedule() {
    window.app.updateSchedule();
}

function addTask() {
    window.app.addTask();
}

function exportExcel() {
    window.app.exportExcel();
}

function submitDemand() {
    window.app.submitDemand();
}

function addDemandForecast() {
    window.app.addDemandForecast();
}

function importDemand() {
    window.app.importDemand();
}

function editDemand(id) {
    window.app.editDemand(id);
}

function scheduleDemand(id) {
    window.app.scheduleDemand(id);
}

function updateMethodDetails() {
    window.app.updateMethodDetails();
}

function updateBatchCalculations() {
    window.app.updateBatchCalculations();
}

function calculateStartDate() {
    window.app.calculateStartDate();
}

function optimizeSchedule() {
    window.app.loadOptimizedSchedule();
}

function exportSchedule() {
    alert('Export Schedule functionality - to be implemented');
}

// Admin action functions (placeholder implementations)
function addMethod() {
    if (document.getElementById('addMethodModal')) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade show d-block';
    modal.id = 'addMethodModal';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Method</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body">
                    <form id="addMethodForm">
                        <div class="mb-3">
                            <label for="methodIdInput" class="form-label">Method ID *</label>
                            <input type="text" class="form-control" id="methodIdInput" placeholder="e.g. HPLC-003" required>
                        </div>
                        <div class="mb-3">
                            <label for="methodNameInput" class="form-label">Method Name *</label>
                            <input type="text" class="form-control" id="methodNameInput" placeholder="e.g. HPLC Method C" required>
                        </div>
                        <div class="mb-3">
                            <label for="methodCategoryInput" class="form-label">Category *</label>
                            <select class="form-select" id="methodCategoryInput" required>
                                <option value="">Select Category</option>
                                <option value="HPLC">HPLC</option>
                                <option value="GC">GC</option>
                                <option value="LC-MS">LC-MS</option>
                                <option value="ICP">ICP</option>
                                <option value="NMR">NMR</option>
                                <option value="SEC">SEC</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="methodDescriptionInput" class="form-label">Description *</label>
                            <textarea class="form-control" id="methodDescriptionInput" rows="3" placeholder="Method description and purpose" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="methodLeadTimeInput" class="form-label">Lead Time (days) *</label>
                            <input type="number" class="form-control" id="methodLeadTimeInput" min="1" max="30" value="3" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitNewMethod()">Add Method</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function submitNewMethod() {
    const modalEl = document.getElementById('addMethodModal');
    if (!modalEl) {
        alert('Add method form is not available.');
        return;
    }

    const methodIdEl = modalEl.querySelector('#methodIdInput');
    const methodNameEl = modalEl.querySelector('#methodNameInput');
    const methodCategoryEl = modalEl.querySelector('#methodCategoryInput');
    const methodDescriptionEl = modalEl.querySelector('#methodDescriptionInput');
    const methodLeadTimeEl = modalEl.querySelector('#methodLeadTimeInput');
    
    if (!methodIdEl || !methodNameEl || !methodCategoryEl || !methodDescriptionEl || !methodLeadTimeEl) {
        alert('Form elements not found. Please try again.');
        return;
    }
    
    const methodData = {
        id: methodIdEl.value ? methodIdEl.value.trim() : '',
        name: methodNameEl.value ? methodNameEl.value.trim() : '',
        category: methodCategoryEl.value || '',
        description: methodDescriptionEl.value ? methodDescriptionEl.value.trim() : '',
        lead_time_days: parseInt(methodLeadTimeEl.value) || 3
    };
    
    // Debug logging to see what values we got
    console.log('Method data for validation:', methodData);
    
    // More detailed validation with specific error messages
    if (!methodData.id || methodData.id === '') {
        alert('Method ID is required');
        return;
    }
    
    if (!methodData.name || methodData.name === '') {
        alert('Method Name is required');
        return;
    }
    
    if (!methodData.category || methodData.category === '') {
        alert('Category must be selected');
        return;
    }
    
    if (!methodData.description || methodData.description === '') {
        alert('Description is required');
        return;
    }
    
    if (!/^[A-Z]+-\d{3}$/.test(methodData.id)) {
        alert('Method ID must follow format: CATEGORY-###  (e.g., HPLC-003)');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(methodData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Method "${methodData.name}" added successfully!\n\nAuto-created entries:\n- Method-Instrument compatibility for ${methodData.category} instruments\n- Available in demand form\n- Added to operator skills options`);
            
            // Close modal and refresh data
            document.querySelector('.modal').remove();
            window.app.loadMethods();
            window.app.loadMethodInstrumentMatrix();
        } else {
            alert(`Error adding method: ${result.message}`);
        }
    } catch (error) {
        console.error('Error adding method:', error);
        alert('Error adding method');
    }
}

function editMethod(methodId) {
    // Get the method data from the methodsMap
    const method = window.app.methodsMap.get(methodId);
    if (!method) {
        alert('Method not found');
        return;
    }

    // Create edit modal with unique ID
    const modalId = `editMethodModal_${methodId}`;
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-edit text-primary"></i> Edit Method: ${method.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editMethodForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editMethodId" class="form-label">Method ID <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="editMethodId" value="${method.id}" readonly>
                                    <div class="form-text">Method ID cannot be changed</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editMethodName" class="form-label">Method Name <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="editMethodName" value="${method.name}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editMethodCategory" class="form-label">Category <span class="text-danger">*</span></label>
                                    <select class="form-select" id="editMethodCategory" required>
                                        <option value="HPLC" ${method.category === 'HPLC' ? 'selected' : ''}>HPLC</option>
                                        <option value="GC" ${method.category === 'GC' ? 'selected' : ''}>GC</option>
                                        <option value="MS" ${method.category === 'MS' ? 'selected' : ''}>MS</option>
                                        <option value="ICP" ${method.category === 'ICP' ? 'selected' : ''}>ICP</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editMethodLeadTime" class="form-label">Lead Time (Days) <span class="text-danger">*</span></label>
                                    <input type="number" class="form-control" id="editMethodLeadTime" value="${method.lead_time_days}" min="1" max="30" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="editMethodDescription" class="form-label">Description <span class="text-danger">*</span></label>
                            <textarea class="form-control" id="editMethodDescription" rows="3" required>${method.description}</textarea>
                        </div>
                        
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="editMethodActive" ${method.is_active ? 'checked' : ''}>
                                <label class="form-check-label" for="editMethodActive">
                                    Active Method
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitEditMethod('${methodId}', '${modalId}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Store the modal instance globally for cleanup
    window.currentEditModal = bootstrapModal;
    window.currentEditModalElement = modal;
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
        window.currentEditModal = null;
        window.currentEditModalElement = null;
    });
}

async function submitEditMethod(methodId, modalId) {
    const methodIdEl = document.getElementById('editMethodId');
    const methodNameEl = document.getElementById('editMethodName');
    const methodCategoryEl = document.getElementById('editMethodCategory');
    const methodDescriptionEl = document.getElementById('editMethodDescription');
    const methodLeadTimeEl = document.getElementById('editMethodLeadTime');
    const methodActiveEl = document.getElementById('editMethodActive');
    
    if (!methodIdEl || !methodNameEl || !methodCategoryEl || !methodDescriptionEl || !methodLeadTimeEl || !methodActiveEl) {
        alert('Form elements not found. Please try again.');
        return;
    }
    
    const methodData = {
        id: methodIdEl.value.trim(),
        name: methodNameEl.value.trim(),
        category: methodCategoryEl.value,
        description: methodDescriptionEl.value.trim(),
        lead_time_days: parseInt(methodLeadTimeEl.value) || 1,
        is_active: methodActiveEl.checked
    };
    
    // Validation
    if (!methodData.name || methodData.name === '') {
        alert('Method Name is required');
        return;
    }
    
    if (!methodData.category || methodData.category === '') {
        alert('Category must be selected');
        return;
    }
    
    if (!methodData.description || methodData.description === '') {
        alert('Description is required');
        return;
    }
    
    if (methodData.lead_time_days < 1 || methodData.lead_time_days > 30) {
        alert('Lead time must be between 1 and 30 days');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/methods', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(methodData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Method "${methodData.name}" updated successfully!`);
            
            // Close modal using Bootstrap API
            if (window.currentEditModal) {
                window.currentEditModal.hide();
            } else if (modalId) {
                // Fallback: try to find and close the modal by ID
                const modalElement = document.getElementById(modalId);
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            }
            
            // Refresh data
            window.app.loadMethods();
            window.app.loadMethodInstrumentMatrix();
        } else {
            alert(`Error updating method: ${result.message}`);
        }
    } catch (error) {
        console.error('Error updating method:', error);
        alert('Error updating method');
    }
}

async function deleteMethod(methodId) {
    // Show impact assessment first
    const confirmMessage = `⚠️ WARNING: Deleting method ${methodId} will:\n\n` +
        `• Remove ALL demand items using this method\n` +
        `• Remove ALL method-instrument compatibility entries\n` +
        `• Remove method from ALL operator skill sets\n` +
        `• Cancel ANY active schedules using this method\n\n` +
        `This action cannot be undone. Continue?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/methods', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method_id: methodId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Method ${methodId} deleted successfully!\n\nImpact Summary:\n` +
                  `• Demand items removed: ${result.impact.demand_items_removed}\n` +
                  `• ${result.impact.matrix_entries_removed}\n` +
                  `• ${result.impact.operator_skills_updated}`);
            
            // Refresh all related data
            window.app.loadMethods();
            window.app.loadMethodInstrumentMatrix();
            window.app.loadOperatorSkills();
            window.app.loadDemandQueue();
            window.app.loadDemandChart();
        } else {
            alert(`Error deleting method: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting method:', error);
        alert('Error deleting method');
    }
}

function addMethodInstrument() {
    alert('Add Method-Instrument compatibility - to be implemented');
}

function editMethodInstrument(methodId, instrumentId) {
    alert(`Edit Method-Instrument ${methodId}-${instrumentId} - to be implemented`);
}

function deleteMethodInstrument(methodId, instrumentId) {
    if (confirm(`Are you sure you want to delete this method-instrument compatibility?`)) {
        alert(`Delete Method-Instrument ${methodId}-${instrumentId} - to be implemented`);
    }
}

function addOperatorSkill() {
    alert('Add Operator Skill - to be implemented');
}

function editOperatorSkill(operatorId, methodId) {
    alert(`Edit Operator Skill ${operatorId}-${methodId} - to be implemented`);
}

function deleteOperatorSkill(operatorId, methodId) {
    if (confirm(`Are you sure you want to delete this operator skill?`)) {
        alert(`Delete Operator Skill ${operatorId}-${methodId} - to be implemented`);
    }
}

function addHoliday() {
    alert('Add Holiday - to be implemented');
}

function editHoliday(holidayId) {
    alert(`Edit Holiday ${holidayId} - to be implemented`);
}

function deleteHoliday(holidayId) {
    if (confirm(`Are you sure you want to delete this holiday?`)) {
        alert(`Delete Holiday ${holidayId} - to be implemented`);
    }
}

function addInstrument() {
    // Create add instrument modal
    const modal = document.createElement('div');
    modal.id = 'addInstrumentModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-plus text-success"></i> Add New Instrument
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addInstrumentForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentId" class="form-label">Instrument ID <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="instrumentId" placeholder="e.g., HPLC-04" required>
                                    <div class="form-text">Unique identifier for the instrument</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentName" class="form-label">Instrument Name <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="instrumentName" placeholder="e.g., Agilent 1290 HPLC" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentCategory" class="form-label">Category <span class="text-danger">*</span></label>
                                    <select class="form-select" id="instrumentCategory" required>
                                        <option value="">Select Category</option>
                                        <option value="HPLC">HPLC</option>
                                        <option value="GC">GC</option>
                                        <option value="LC-MS">LC-MS</option>
                                        <option value="ICP">ICP</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentLocation" class="form-label">Location <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="instrumentLocation" placeholder="e.g., Lab A-104" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentStatus" class="form-label">Initial Status</label>
                                    <select class="form-select" id="instrumentStatus">
                                        <option value="active">🟢 Active</option>
                                        <option value="maintenance">🟡 Maintenance</option>
                                        <option value="inactive">🔴 Inactive</option>
                                        <option value="repair">🔧 Repair</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentMaxBatch" class="form-label">Max Batch Size</label>
                                    <input type="number" class="form-control" id="instrumentMaxBatch" value="48" min="1" max="200">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentAvgBatch" class="form-label">Avg Batch Size</label>
                                    <input type="number" class="form-control" id="instrumentAvgBatch" value="38" min="1" max="200">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentRunTime" class="form-label">Run Time (minutes)</label>
                                    <input type="number" class="form-control" id="instrumentRunTime" value="20" min="1" max="300">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentFailureRate" class="form-label">Failure Rate (%)</label>
                                    <input type="number" class="form-control" id="instrumentFailureRate" value="2.5" min="0" max="20" step="0.1">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentSetupTime" class="form-label">Setup Time (hours)</label>
                                    <input type="number" class="form-control" id="instrumentSetupTime" value="1.0" min="0" max="24" step="0.1">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentCleanupTime" class="form-label">Cleanup Time (hours)</label>
                                    <input type="number" class="form-control" id="instrumentCleanupTime" value="0.5" min="0" max="12" step="0.1">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentThroughput" class="form-label">Throughput (samples/day)</label>
                                    <input type="number" class="form-control" id="instrumentThroughput" value="96" min="1" max="1000">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentEfficiency" class="form-label">Efficiency Factor</label>
                                    <input type="number" class="form-control" id="instrumentEfficiency" value="1.0" min="0.1" max="2.0" step="0.1">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentMaintenance" class="form-label">Maintenance Schedule</label>
                                    <select class="form-select" id="instrumentMaintenance">
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly" selected>Weekly</option>
                                        <option value="Bi-weekly">Bi-weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentLastCalibration" class="form-label">Last Calibration</label>
                                    <input type="date" class="form-control" id="instrumentLastCalibration" value="2024-01-01">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="instrumentNextCalibration" class="form-label">Next Calibration</label>
                                    <input type="date" class="form-control" id="instrumentNextCalibration" value="2024-02-01">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" onclick="submitNewInstrument()">
                        <i class="fas fa-plus"></i> Add Instrument
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    });
}

async function submitNewInstrument() {
    const instrumentIdEl = document.getElementById('instrumentId');
    const instrumentNameEl = document.getElementById('instrumentName');
    const instrumentCategoryEl = document.getElementById('instrumentCategory');
    const instrumentLocationEl = document.getElementById('instrumentLocation');
    const instrumentStatusEl = document.getElementById('instrumentStatus');
    const instrumentMaxBatchEl = document.getElementById('instrumentMaxBatch');
    const instrumentAvgBatchEl = document.getElementById('instrumentAvgBatch');
    const instrumentRunTimeEl = document.getElementById('instrumentRunTime');
    const instrumentFailureRateEl = document.getElementById('instrumentFailureRate');
    const instrumentSetupTimeEl = document.getElementById('instrumentSetupTime');
    const instrumentCleanupTimeEl = document.getElementById('instrumentCleanupTime');
    const instrumentThroughputEl = document.getElementById('instrumentThroughput');
    const instrumentEfficiencyEl = document.getElementById('instrumentEfficiency');
    const instrumentMaintenanceEl = document.getElementById('instrumentMaintenance');
    const instrumentLastCalibrationEl = document.getElementById('instrumentLastCalibration');
    const instrumentNextCalibrationEl = document.getElementById('instrumentNextCalibration');
    
    if (!instrumentIdEl || !instrumentNameEl || !instrumentCategoryEl || !instrumentLocationEl) {
        alert('Form elements not found. Please try again.');
        return;
    }
    
    const instrumentData = {
        id: instrumentIdEl.value.trim().toUpperCase(),
        name: instrumentNameEl.value.trim(),
        category: instrumentCategoryEl.value,
        location: instrumentLocationEl.value.trim(),
        status: instrumentStatusEl ? instrumentStatusEl.value : 'active',
        max_batch_size: instrumentMaxBatchEl ? parseInt(instrumentMaxBatchEl.value) || 48 : 48,
        avg_batch_size: instrumentAvgBatchEl ? parseInt(instrumentAvgBatchEl.value) || 38 : 38,
        run_time_per_sample_min: instrumentRunTimeEl ? parseInt(instrumentRunTimeEl.value) || 20 : 20,
        failure_rate_percent: instrumentFailureRateEl ? parseFloat(instrumentFailureRateEl.value) || 2.5 : 2.5,
        setup_time_hours: instrumentSetupTimeEl ? parseFloat(instrumentSetupTimeEl.value) || 1.0 : 1.0,
        cleanup_time_hours: instrumentCleanupTimeEl ? parseFloat(instrumentCleanupTimeEl.value) || 0.5 : 0.5,
        throughput_samples_per_day: instrumentThroughputEl ? parseInt(instrumentThroughputEl.value) || 96 : 96,
        efficiency_factor: instrumentEfficiencyEl ? parseFloat(instrumentEfficiencyEl.value) || 1.0 : 1.0,
        maintenance_schedule: instrumentMaintenanceEl ? instrumentMaintenanceEl.value : 'Weekly',
        last_calibration: instrumentLastCalibrationEl ? instrumentLastCalibrationEl.value : '2024-01-01',
        next_calibration: instrumentNextCalibrationEl ? instrumentNextCalibrationEl.value : '2024-02-01'
    };
    
    // Validation
    if (!instrumentData.id || instrumentData.id === '') {
        alert('Instrument ID is required');
        return;
    }
    
    if (!instrumentData.name || instrumentData.name === '') {
        alert('Instrument Name is required');
        return;
    }
    
    if (!instrumentData.category || instrumentData.category === '') {
        alert('Category must be selected');
        return;
    }
    
    if (!instrumentData.location || instrumentData.location === '') {
        alert('Location is required');
        return;
    }
    
    // Validate ID format (should be like HPLC-01, GC-02, etc.)
    const idPattern = /^[A-Z]+-\d+$/;
    if (!idPattern.test(instrumentData.id)) {
        alert('Instrument ID must be in format like HPLC-01, GC-02, MS-01, etc.');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/instruments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(instrumentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Instrument "${instrumentData.name}" added successfully!`);
            
            // Close modal
            const modal = document.getElementById('addInstrumentModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
            // Refresh the instruments table
            if (window.app) {
                window.app.loadInstrumentsAdmin();
                window.app.loadMethodInstrumentMatrix(); // Refresh matrix to include new instrument
            }
        } else {
            alert(`Error adding instrument: ${result.message}`);
        }
    } catch (error) {
        console.error('Error adding instrument:', error);
        alert('Error adding instrument. Please try again.');
    }
}

async function editInstrument(instrumentId) {
    // Ensure app is available
    if (!window.app) {
        alert('Application not initialized. Please refresh the page.');
        return;
    }
    
    // Ensure instruments are loaded
    if (!window.app.instruments || window.app.instruments.length === 0) {
        await window.app.loadInstrumentsAdmin();
    }
    
    // Get the instrument data from the current instruments list
    const instruments = window.app.instruments || [];
    const instrument = instruments.find(inst => inst.id === instrumentId);
    
    if (!instrument) {
        alert('Instrument not found');
        return;
    }
    
    // All instruments can be edited
    
    // Create edit instrument modal
    const modal = document.createElement('div');
    modal.id = `editInstrumentModal_${instrumentId}`;
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-edit text-primary"></i> Edit Instrument: ${instrument.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editInstrumentForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentId" class="form-label">Instrument ID <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="editInstrumentId" value="${instrument.id}" readonly>
                                    <div class="form-text">Instrument ID cannot be changed</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentName" class="form-label">Instrument Name <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="editInstrumentName" value="${instrument.name}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentCategory" class="form-label">Category <span class="text-danger">*</span></label>
                                    <select class="form-select" id="editInstrumentCategory" required>
                                        <option value="HPLC" ${instrument.category === 'HPLC' ? 'selected' : ''}>HPLC</option>
                                        <option value="GC" ${instrument.category === 'GC' ? 'selected' : ''}>GC</option>
                                        <option value="LC-MS" ${instrument.category === 'LC-MS' ? 'selected' : ''}>LC-MS</option>
                                        <option value="ICP" ${instrument.category === 'ICP' ? 'selected' : ''}>ICP</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentLocation" class="form-label">Location <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="editInstrumentLocation" value="${instrument.location}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentStatus" class="form-label">Status</label>
                                    <select class="form-select" id="editInstrumentStatus">
                                        <option value="active" ${instrument.status === 'active' ? 'selected' : ''}>🟢 Active</option>
                                        <option value="maintenance" ${instrument.status === 'maintenance' ? 'selected' : ''}>🟡 Maintenance</option>
                                        <option value="inactive" ${instrument.status === 'inactive' ? 'selected' : ''}>🔴 Inactive</option>
                                        <option value="repair" ${instrument.status === 'repair' ? 'selected' : ''}>🔧 Repair</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentMaxBatch" class="form-label">Max Batch Size</label>
                                    <input type="number" class="form-control" id="editInstrumentMaxBatch" value="${instrument.max_batch_size}" min="1" max="200">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentAvgBatch" class="form-label">Avg Batch Size</label>
                                    <input type="number" class="form-control" id="editInstrumentAvgBatch" value="${instrument.avg_batch_size}" min="1" max="200">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentRunTime" class="form-label">Run Time (minutes)</label>
                                    <input type="number" class="form-control" id="editInstrumentRunTime" value="${instrument.run_time_per_sample_min}" min="1" max="300">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentFailureRate" class="form-label">Failure Rate (%)</label>
                                    <input type="number" class="form-control" id="editInstrumentFailureRate" value="${instrument.failure_rate_percent}" min="0" max="20" step="0.1">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentSetupTime" class="form-label">Setup Time (hours)</label>
                                    <input type="number" class="form-control" id="editInstrumentSetupTime" value="${instrument.setup_time_hours}" min="0" max="24" step="0.1">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentCleanupTime" class="form-label">Cleanup Time (hours)</label>
                                    <input type="number" class="form-control" id="editInstrumentCleanupTime" value="${instrument.cleanup_time_hours}" min="0" max="12" step="0.1">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentThroughput" class="form-label">Throughput (samples/day)</label>
                                    <input type="number" class="form-control" id="editInstrumentThroughput" value="${instrument.throughput_samples_per_day}" min="1" max="1000">
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentEfficiency" class="form-label">Efficiency Factor</label>
                                    <input type="number" class="form-control" id="editInstrumentEfficiency" value="${instrument.efficiency_factor}" min="0.1" max="2.0" step="0.1">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentMaintenance" class="form-label">Maintenance Schedule</label>
                                    <select class="form-select" id="editInstrumentMaintenance">
                                        <option value="Daily" ${instrument.maintenance_schedule === 'Daily' ? 'selected' : ''}>Daily</option>
                                        <option value="Weekly" ${instrument.maintenance_schedule === 'Weekly' ? 'selected' : ''}>Weekly</option>
                                        <option value="Bi-weekly" ${instrument.maintenance_schedule === 'Bi-weekly' ? 'selected' : ''}>Bi-weekly</option>
                                        <option value="Monthly" ${instrument.maintenance_schedule === 'Monthly' ? 'selected' : ''}>Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentLastCalibration" class="form-label">Last Calibration</label>
                                    <input type="date" class="form-control" id="editInstrumentLastCalibration" value="${instrument.last_calibration}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editInstrumentNextCalibration" class="form-label">Next Calibration</label>
                                    <input type="date" class="form-control" id="editInstrumentNextCalibration" value="${instrument.next_calibration}">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitEditInstrument('${instrumentId}', '${modal.id}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Store the modal instance globally for cleanup
    window.currentEditInstrumentModal = bootstrapModal;
    window.currentEditInstrumentModalElement = modal;
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
        window.currentEditInstrumentModal = null;
        window.currentEditInstrumentModalElement = null;
    });
}

async function submitEditInstrument(instrumentId, modalId) {
    const instrumentIdEl = document.getElementById('editInstrumentId');
    const instrumentNameEl = document.getElementById('editInstrumentName');
    const instrumentCategoryEl = document.getElementById('editInstrumentCategory');
    const instrumentLocationEl = document.getElementById('editInstrumentLocation');
    const instrumentStatusEl = document.getElementById('editInstrumentStatus');
    const instrumentMaxBatchEl = document.getElementById('editInstrumentMaxBatch');
    const instrumentAvgBatchEl = document.getElementById('editInstrumentAvgBatch');
    const instrumentRunTimeEl = document.getElementById('editInstrumentRunTime');
    const instrumentFailureRateEl = document.getElementById('editInstrumentFailureRate');
    const instrumentSetupTimeEl = document.getElementById('editInstrumentSetupTime');
    const instrumentCleanupTimeEl = document.getElementById('editInstrumentCleanupTime');
    const instrumentThroughputEl = document.getElementById('editInstrumentThroughput');
    const instrumentEfficiencyEl = document.getElementById('editInstrumentEfficiency');
    const instrumentMaintenanceEl = document.getElementById('editInstrumentMaintenance');
    const instrumentLastCalibrationEl = document.getElementById('editInstrumentLastCalibration');
    const instrumentNextCalibrationEl = document.getElementById('editInstrumentNextCalibration');
    
    if (!instrumentIdEl || !instrumentNameEl || !instrumentCategoryEl || !instrumentLocationEl) {
        alert('Form elements not found. Please try again.');
        return;
    }
    
    const instrumentData = {
        id: instrumentIdEl.value.trim(),
        name: instrumentNameEl.value.trim(),
        category: instrumentCategoryEl.value,
        location: instrumentLocationEl.value.trim(),
        status: instrumentStatusEl ? instrumentStatusEl.value : 'active',
        max_batch_size: instrumentMaxBatchEl ? parseInt(instrumentMaxBatchEl.value) || 48 : 48,
        avg_batch_size: instrumentAvgBatchEl ? parseInt(instrumentAvgBatchEl.value) || 38 : 38,
        run_time_per_sample_min: instrumentRunTimeEl ? parseInt(instrumentRunTimeEl.value) || 20 : 20,
        failure_rate_percent: instrumentFailureRateEl ? parseFloat(instrumentFailureRateEl.value) || 2.5 : 2.5,
        setup_time_hours: instrumentSetupTimeEl ? parseFloat(instrumentSetupTimeEl.value) || 1.0 : 1.0,
        cleanup_time_hours: instrumentCleanupTimeEl ? parseFloat(instrumentCleanupTimeEl.value) || 0.5 : 0.5,
        throughput_samples_per_day: instrumentThroughputEl ? parseInt(instrumentThroughputEl.value) || 96 : 96,
        efficiency_factor: instrumentEfficiencyEl ? parseFloat(instrumentEfficiencyEl.value) || 1.0 : 1.0,
        maintenance_schedule: instrumentMaintenanceEl ? instrumentMaintenanceEl.value : 'Weekly',
        last_calibration: instrumentLastCalibrationEl ? instrumentLastCalibrationEl.value : '2024-01-01',
        next_calibration: instrumentNextCalibrationEl ? instrumentNextCalibrationEl.value : '2024-02-01'
    };
    
    // Validation
    if (!instrumentData.name || instrumentData.name === '') {
        alert('Instrument Name is required');
        return;
    }
    
    if (!instrumentData.category || instrumentData.category === '') {
        alert('Category must be selected');
        return;
    }
    
    if (!instrumentData.location || instrumentData.location === '') {
        alert('Location is required');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/instruments', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(instrumentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Instrument "${instrumentData.name}" updated successfully!`);
            
            // Close modal using Bootstrap API
            if (window.currentEditInstrumentModal) {
                window.currentEditInstrumentModal.hide();
            } else if (modalId) {
                // Fallback: try to find and close the modal by ID
                const modalElement = document.getElementById(modalId);
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            }
            
            // Refresh data
            if (window.app) {
                window.app.loadInstrumentsAdmin();
                window.app.loadMethodInstrumentMatrix();
            }
        } else {
            alert(`Error updating instrument: ${result.message}`);
        }
    } catch (error) {
        console.error('Error updating instrument:', error);
        alert('Error updating instrument. Please try again.');
    }
}

function deleteInstrument(instrumentId) {
    if (confirm(`Are you sure you want to delete instrument ${instrumentId}?`)) {
        alert(`Delete Instrument ${instrumentId} - to be implemented`);
    }
}

async function updateInstrumentStatus(instrumentId, newStatus) {
    try {
        const response = await fetch('/api/admin/instruments/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instrument_id: instrumentId,
                status: newStatus
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Show success message briefly
            const statusElement = document.querySelector(`select[onchange*="${instrumentId}"]`);
            if (statusElement) {
                const originalBackground = statusElement.style.backgroundColor;
                statusElement.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    statusElement.style.backgroundColor = originalBackground;
                }, 1000);
            }
            
            // Refresh the method-instrument matrix to sync compatibility status
            if (window.app) {
                window.app.loadMethodInstrumentMatrix();
            }
        } else {
            alert(`Error updating instrument status: ${result.message}`);
            // Revert the dropdown to original value
            window.app.loadInstrumentsAdmin();
        }
    } catch (error) {
        console.error('Error updating instrument status:', error);
        alert('Error updating instrument status');
        // Revert the dropdown to original value
        window.app.loadInstrumentsAdmin();
    }
}

function toggleCompatibility(methodId, instrumentId, isCompatible) {
    // Check if the toggle is disabled
    const toggleElement = document.querySelector(`input[onchange*="${methodId}"][onchange*="${instrumentId}"]`);
    if (toggleElement && toggleElement.disabled) {
        console.log(`Cannot modify compatibility - Instrument ${instrumentId} is not active`);
        return;
    }
    
    // Show loading state
    if (toggleElement) {
        toggleElement.disabled = true;
        toggleElement.style.opacity = '0.6';
    }
    
    // Update method-instrument compatibility
    console.log(`Method ${methodId} compatibility with instrument ${instrumentId} set to ${isCompatible}`);
    
    // API call to save the change
    fetch('/api/admin/method-instrument-matrix', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            method_id: methodId,
            instrument_id: instrumentId,
            is_compatible: isCompatible
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Compatibility updated:', data);
            
            // Show success feedback
            if (toggleElement) {
                toggleElement.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    toggleElement.style.backgroundColor = '';
                }, 1000);
            }
            
            // Refresh the matrix to show updated state
            if (window.app) {
                window.app.loadMethodInstrumentMatrix();
            }
        } else {
            console.error('Failed to update compatibility:', data.message);
            alert(`Error updating compatibility: ${data.message}`);
            
            // Revert the toggle state
            if (toggleElement) {
                toggleElement.checked = !isCompatible;
            }
        }
    })
    .catch(error => {
        console.error('Error updating compatibility:', error);
        alert('Error updating compatibility. Please try again.');
        
        // Revert the toggle state
        if (toggleElement) {
            toggleElement.checked = !isCompatible;
        }
    })
    .finally(() => {
        // Re-enable the toggle
        if (toggleElement) {
            toggleElement.disabled = false;
            toggleElement.style.opacity = '';
        }
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new LabCapacityApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.app && window.app.updateInterval) {
        clearInterval(window.app.updateInterval);
    }
});
