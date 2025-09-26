"""
Lab Capacity Model - Flask API Server
Serves data via REST API, frontend rendered with JavaScript
"""

from flask import Flask, jsonify, render_template, request
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, date
import json

# Initialize Flask app
app = Flask(__name__)

# In-memory storage for added demand items (in production, this would be a database)
added_demand_items = []

# Sample data for MVP
def get_sample_data():
    """Generate sample data for the MVP demo"""
    
    # Personnel data
    personnel_data = {
        'id': range(1, 11),
        'name': ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 
                'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor',
                'Iris Chen', 'Jack Anderson'],
        'role': ['Senior Scientist', 'Associate Scientist', 'Technician', 'Senior Scientist',
                'Associate Scientist', 'Technician', 'Lab Manager', 'Associate Scientist',
                'Technician', 'Senior Scientist'],
        'department': ['Analytical', 'Analytical', 'Analytical', 'QC',
                      'QC', 'QC', 'Operations', 'R&D',
                      'R&D', 'R&D'],
        'utilization': [85, 92, 78, 88, 75, 82, 65, 90, 87, 79],
        'status': ['Available', 'Busy', 'Available', 'Available',
                  'On Leave', 'Available', 'Available', 'Busy',
                  'Available', 'Available']
    }
    
    # Instruments data
    instruments_data = {
        'id': range(1, 8),
        'name': ['HPLC-01', 'LCMS-02', 'GC-03', 'HPLC-04', 'LCMS-05', 'NMR-01', 'DSC-01'],
        'type': ['HPLC', 'LC-MS', 'GC', 'HPLC', 'LC-MS', 'NMR', 'DSC'],
        'location': ['Lab A', 'Lab A', 'Lab B', 'Lab A', 'Lab B', 'Lab C', 'Lab C'],
        'status': ['Available', 'In Use', 'Maintenance', 'Available', 'In Use', 'Available', 'Available'],
        'utilization': [78, 95, 0, 65, 88, 45, 32],
        'next_maintenance': ['2024-02-15', '2024-01-30', '2024-01-25', '2024-02-20', 
                           '2024-02-10', '2024-03-01', '2024-02-28']
    }
    
    # Projects data
    projects_data = {
        'id': range(1, 8),
        'name': ['Method Validation A', 'Stability Study B', 'Impurity Analysis C',
                'Release Testing D', 'Development E', 'Cleaning Validation F', 'Bioanalytical G'],
        'status': ['Active', 'Active', 'Planning', 'Active', 'On Hold', 'Active', 'Planning'],
        'priority': ['High', 'Medium', 'High', 'Critical', 'Low', 'Medium', 'High'],
        'progress': [65, 80, 15, 90, 30, 45, 10],
        'due_date': ['2024-02-28', '2024-03-15', '2024-02-20', '2024-01-31',
                    '2024-04-15', '2024-03-01', '2024-03-30']
    }
    
    return pd.DataFrame(personnel_data), pd.DataFrame(instruments_data), pd.DataFrame(projects_data)

# Get sample data
df_personnel, df_instruments, df_projects = get_sample_data()

# Routes

@app.route('/')
def index():
    """Serve the main application page"""
    return render_template('index.html')

@app.route('/api/dashboard')
def api_dashboard():
    """Get dashboard summary data"""
    total_personnel = len(df_personnel)
    available_personnel = len(df_personnel[df_personnel['status'] == 'Available'])
    avg_personnel_util = df_personnel['utilization'].mean()
    
    total_instruments = len(df_instruments)
    available_instruments = len(df_instruments[df_instruments['status'] == 'Available'])
    avg_instrument_util = df_instruments['utilization'].mean()
    
    active_projects = len(df_projects[df_projects['status'] == 'Active'])
    
    return jsonify({
        'personnel': {
            'total': total_personnel,
            'available': available_personnel,
            'avg_utilization': round(avg_personnel_util, 1)
        },
        'instruments': {
            'total': total_instruments,
            'available': available_instruments,
            'avg_utilization': round(avg_instrument_util, 1)
        },
        'projects': {
            'active': active_projects,
            'total': len(df_projects)
        },
        'overall_capacity': 78
    })

@app.route('/api/personnel')
def api_personnel():
    """Get personnel data"""
    return jsonify(df_personnel.to_dict('records'))

@app.route('/api/instruments')
def api_instruments():
    """Get instruments data"""
    return jsonify(df_instruments.to_dict('records'))

@app.route('/api/projects')
def api_projects():
    """Get projects data"""
    return jsonify(df_projects.to_dict('records'))

@app.route('/api/personnel/utilization')
def api_personnel_utilization():
    """Get personnel utilization chart data"""
    chart_data = {
        'labels': df_personnel['name'].tolist(),
        'datasets': [{
            'label': 'Utilization %',
            'data': df_personnel['utilization'].tolist(),
            'backgroundColor': [
                '#1f77b4' if role == 'Senior Scientist' else
                '#ff7f0e' if role == 'Associate Scientist' else
                '#2ca02c' if role == 'Technician' else '#d62728'
                for role in df_personnel['role']
            ],
            'borderColor': '#ffffff',
            'borderWidth': 1
        }]
    }
    return jsonify(chart_data)

@app.route('/api/instruments/status')
def api_instrument_status():
    """Get instrument status chart data"""
    status_counts = df_instruments['status'].value_counts()
    chart_data = {
        'labels': status_counts.index.tolist(),
        'datasets': [{
            'data': status_counts.values.tolist(),
            'backgroundColor': ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
            'borderColor': '#ffffff',
            'borderWidth': 2
        }]
    }
    return jsonify(chart_data)

@app.route('/api/capacity/timeline')
def api_capacity_timeline():
    """Get capacity timeline data"""
    # Generate sample timeline data
    dates = pd.date_range(start=datetime.now(), periods=14, freq='D')
    personnel_capacity = np.random.randint(70, 95, 14)
    instrument_capacity = np.random.randint(60, 90, 14)
    
    chart_data = {
        'labels': [d.strftime('%Y-%m-%d') for d in dates],
        'datasets': [
            {
                'label': 'Personnel Capacity',
                'data': personnel_capacity.tolist(),
                'borderColor': '#1f77b4',
                'backgroundColor': 'rgba(31, 119, 180, 0.1)',
                'fill': True,
                'tension': 0.4
            },
            {
                'label': 'Instrument Capacity',
                'data': instrument_capacity.tolist(),
                'borderColor': '#ff7f0e',
                'backgroundColor': 'rgba(255, 127, 14, 0.1)',
                'fill': True,
                'tension': 0.4
            }
        ]
    }
    return jsonify(chart_data)

@app.route('/api/schedule/gantt')
def api_schedule_gantt():
    """Get Gantt chart data"""
    # Sample Gantt chart data
    tasks_data = [
        {
            'id': 1,
            'name': 'Method Validation A',
            'resource': 'Alice (HPLC-01)',
            'start': '2024-01-25T09:00:00',
            'end': '2024-01-25T12:00:00',
            'progress': 65,
            'color': '#1f77b4'
        },
        {
            'id': 2,
            'name': 'Stability Study B',
            'resource': 'Bob (LCMS-02)',
            'start': '2024-01-25T10:00:00',
            'end': '2024-01-25T14:00:00',
            'progress': 80,
            'color': '#ff7f0e'
        },
        {
            'id': 3,
            'name': 'Release Testing C',
            'resource': 'Carol (HPLC-04)',
            'start': '2024-01-25T13:00:00',
            'end': '2024-01-25T17:00:00',
            'progress': 90,
            'color': '#2ca02c'
        }
    ]
    return jsonify(tasks_data)

@app.route('/api/assignments/today')
def api_assignments_today():
    """Get today's assignments"""
    assignments = [
        {
            'time': '09:00-12:00',
            'personnel': 'Alice Johnson',
            'instrument': 'HPLC-01',
            'task': 'Method Validation',
            'status': 'In Progress'
        },
        {
            'time': '10:00-14:00',
            'personnel': 'Bob Smith',
            'instrument': 'LCMS-02',
            'task': 'Stability Analysis',
            'status': 'Scheduled'
        }
    ]
    return jsonify(assignments)

@app.route('/api/utilization/trend')
def api_utilization_trend():
    """Get utilization trend data"""
    # Generate sample trend data
    dates = pd.date_range(start=datetime.now() - timedelta(days=30), periods=30, freq='D')
    personnel_util = np.random.randint(70, 95, 30)
    instrument_util = np.random.randint(60, 90, 30)
    
    chart_data = {
        'labels': [d.strftime('%Y-%m-%d') for d in dates],
        'datasets': [
            {
                'label': 'Personnel Utilization',
                'data': personnel_util.tolist(),
                'borderColor': '#1f77b4',
                'backgroundColor': 'rgba(31, 119, 180, 0.1)',
                'fill': False,
                'tension': 0.4
            },
            {
                'label': 'Instrument Utilization',
                'data': instrument_util.tolist(),
                'borderColor': '#ff7f0e',
                'backgroundColor': 'rgba(255, 127, 14, 0.1)',
                'fill': False,
                'tension': 0.4
            }
        ]
    }
    return jsonify(chart_data)

@app.route('/api/demand/forecast')
def api_demand_forecast():
    """Get demand forecast data for stacked bar chart with proper method/panel structure"""
    # Generate sample demand forecast data by method/panel type
    dates = pd.date_range(start=datetime.now(), periods=30, freq='D')
    
    # Use fixed seed for consistent data generation
    np.random.seed(42)
    
    # Sample data for different methods/panels
    metabolite_samples = np.random.randint(8, 25, 30)
    stability_samples = np.random.randint(12, 30, 30)
    purity_samples = np.random.randint(6, 18, 30)
    
    # Create demand items for table integration
    clients = ['PharmaCorp', 'BioTech Inc', 'ChemLabs', 'Research Corp', 'Analytics Ltd']
    projects = ['Q4 Validation', 'Method Development', 'Routine Testing', 'Research Study', 'Quality Control']
    methods = ['METABOLITE-PANEL', 'STABILITY-STUDY', 'PURITY-ANALYSIS']
    
    demand_items = []
    for i, date in enumerate(dates):
        # Create multiple demand items per day for different methods
        for j, method in enumerate(methods):
            if j == 0:  # Metabolite Panel
                sample_count = metabolite_samples[i]
            elif j == 1:  # Stability Study  
                sample_count = stability_samples[i]
            else:  # Purity Analysis
                sample_count = purity_samples[i]
                
            if sample_count > 0:
                # Determine priority based on sample count and method type
                priority = 'high' if sample_count > 20 else 'medium' if sample_count > 12 else 'low'
                
                # Determine status based on date
                days_from_now = (date.date() - datetime.now().date()).days
                if days_from_now < 0:
                    status = 'completed'
                elif days_from_now < 3:
                    status = 'in-progress'
                elif days_from_now < 7:
                    status = 'scheduled'
                else:
                    status = 'pending'
                
                demand_items.append({
                    'id': f'DEM-{i+1:03d}-{j+1}',
                    'date': date.strftime('%Y-%m-%d'),
                    'method': method,
                    'method_name': method.replace('-', ' ').title(),
                    'sample_count': int(sample_count),
                    'priority': priority,
                    'client': clients[(i + j) % len(clients)],
                    'project': f'{projects[(i + j) % len(projects)]} - {i+1}-{j+1}',
                    'status': status,
                    'assay_breakdown': get_assay_breakdown_for_method(method, int(sample_count))
                })
    
    # Add newly created demand items
    demand_items.extend(added_demand_items)
    
    # Aggregate samples by method for chart display (including added items)
    chart_labels = [d.strftime('%Y-%m-%d') for d in dates]
    
    # Initialize chart data arrays
    metabolite_chart_data = metabolite_samples.tolist()
    stability_chart_data = stability_samples.tolist()
    purity_chart_data = purity_samples.tolist()
    
    # Add samples from newly added demand items to chart data
    for item in added_demand_items:
        item_date = item['date']
        if item_date in chart_labels:
            date_index = chart_labels.index(item_date)
            if item['method'] == 'METABOLITE-PANEL':
                metabolite_chart_data[date_index] += item['sample_count']
            elif item['method'] == 'STABILITY-STUDY':
                stability_chart_data[date_index] += item['sample_count']
            elif item['method'] == 'PURITY-ANALYSIS':
                purity_chart_data[date_index] += item['sample_count']
        else:
            # If the date is outside our 30-day forecast, add it as a new data point
            chart_labels.append(item_date)
            # Add zero for existing methods
            metabolite_chart_data.append(0)
            stability_chart_data.append(0)
            purity_chart_data.append(0)
            # Add the sample count for the appropriate method
            if item['method'] == 'METABOLITE-PANEL':
                metabolite_chart_data[-1] = item['sample_count']
            elif item['method'] == 'STABILITY-STUDY':
                stability_chart_data[-1] = item['sample_count']
            elif item['method'] == 'PURITY-ANALYSIS':
                purity_chart_data[-1] = item['sample_count']
    
    chart_data = {
        'labels': chart_labels,
        'datasets': [
            {
                'label': 'Metabolite Panel',
                'data': metabolite_chart_data,
                'backgroundColor': '#3b82f6',
                'borderColor': '#1d4ed8',
                'borderWidth': 1
            },
            {
                'label': 'Stability Study',
                'data': stability_chart_data,
                'backgroundColor': '#10b981',
                'borderColor': '#059669',
                'borderWidth': 1
            },
            {
                'label': 'Purity Analysis',
                'data': purity_chart_data,
                'backgroundColor': '#f59e0b',
                'borderColor': '#d97706',
                'borderWidth': 1
            }
        ],
        'demand_items': demand_items
    }
    return jsonify(chart_data)

def get_assay_breakdown_for_method(method_id, sample_count):
    """Get assay breakdown for a specific method and sample count"""
    # Ensure sample_count is a Python int
    sample_count = int(sample_count)
    
    # This mirrors the structure from the methods API
    assay_breakdowns = {
        'METABOLITE-PANEL': [
            {'name': 'Glucose Assay', 'category': 'HPLC', 'samples': sample_count, 'batches': max(1, sample_count // 24)},
            {'name': 'Ammonia Assay', 'category': 'Spectrophotometry', 'samples': sample_count, 'batches': max(1, sample_count // 96)},
            {'name': 'Lactate Assay', 'category': 'LC-MS', 'samples': sample_count, 'batches': max(1, sample_count // 8)},
            {'name': 'Creatinine Assay', 'category': 'HPLC', 'samples': sample_count, 'batches': max(1, sample_count // 24)}
        ],
        'STABILITY-STUDY': [
            {'name': 'Monomer Assay', 'category': 'HPLC', 'samples': sample_count, 'batches': max(1, sample_count // 24)},
            {'name': 'Aggregate Assay', 'category': 'SEC', 'samples': sample_count, 'batches': max(1, sample_count // 12)},
            {'name': 'Fragments Assay', 'category': 'LC-MS', 'samples': sample_count, 'batches': max(1, sample_count // 16)},
            {'name': 'Oxidation Assay', 'category': 'HPLC', 'samples': sample_count, 'batches': max(1, sample_count // 24)}
        ],
        'PURITY-ANALYSIS': [
            {'name': 'HPLC Purity Assay', 'category': 'HPLC', 'samples': sample_count, 'batches': max(1, sample_count // 24)}
        ]
    }
    return assay_breakdowns.get(method_id, [])

@app.route('/api/demand/queue')
def api_demand_queue():
    """Get demand queue data with sample-based hierarchy"""
    demand_queue = [
        {
            'id': 'DEM-001',
            'project_name': 'Biomarker Discovery Study',
            'method': 'METABOLITE-PANEL',
            'method_name': 'Metabolite Panel',
            'sample_count': 48,
            'start_date': '2024-01-25',
            'priority': 'high',
            'status': 'pending',
            'client': 'PharmaCorp',
            'requester': 'Dr. Sarah Chen',
            'assay_breakdown': [
                {'name': 'Glucose Assay', 'category': 'HPLC', 'samples': 48, 'batches': 2, 'instruments': ['HPLC-UV', 'HPLC-RID']},
                {'name': 'Ammonia Assay', 'category': 'Spectrophotometry', 'samples': 48, 'batches': 1, 'instruments': ['UV-Vis Spectrophotometer']},
                {'name': 'Lactate Assay', 'category': 'LC-MS', 'samples': 48, 'batches': 6, 'instruments': ['LC-MS/MS']},
                {'name': 'Creatinine Assay', 'category': 'HPLC', 'samples': 48, 'batches': 2, 'instruments': ['HPLC-UV']}
            ]
        },
        {
            'id': 'DEM-002',
            'project_name': 'Drug Stability Assessment',
            'method': 'STABILITY-STUDY',
            'method_name': 'Stability Study',
            'sample_count': 36,
            'start_date': '2024-01-28',
            'priority': 'medium',
            'status': 'approved',
            'client': 'BioTech Inc',
            'requester': 'Dr. James Thompson',
            'assay_breakdown': [
                {'name': 'Monomer Assay', 'category': 'HPLC', 'samples': 36, 'batches': 2, 'instruments': ['HPLC-UV', 'HPLC-CAD']},
                {'name': 'Aggregate Assay', 'category': 'SEC', 'samples': 36, 'batches': 3, 'instruments': ['SEC-HPLC', 'SEC-MALS']},
                {'name': 'Fragments Assay', 'category': 'LC-MS', 'samples': 36, 'batches': 3, 'instruments': ['LC-MS', 'LC-MS/MS']},
                {'name': 'Oxidation Assay', 'category': 'HPLC', 'samples': 36, 'batches': 2, 'instruments': ['HPLC-UV', 'HPLC-FLD']}
            ]
        },
        {
            'id': 'DEM-003',
            'project_name': 'API Purity Validation',
            'method': 'PURITY-ANALYSIS',
            'method_name': 'Purity Analysis',
            'sample_count': 24,
            'start_date': '2024-02-05',
            'priority': 'medium',
            'status': 'pending',
            'client': 'ChemLabs',
            'requester': 'Dr. Lisa Anderson',
            'assay_breakdown': [
                {'name': 'HPLC Purity Assay', 'category': 'HPLC', 'samples': 24, 'batches': 1, 'instruments': ['HPLC-UV', 'HPLC-CAD']}
            ]
        },
        {
            'id': 'DEM-004',
            'project_name': 'Clinical Trial Metabolomics',
            'method': 'METABOLITE-PANEL',
            'method_name': 'Metabolite Panel',
            'sample_count': 96,
            'start_date': '2024-02-10',
            'priority': 'high',
            'status': 'scheduled',
            'client': 'Research Corp',
            'requester': 'Dr. Michael Rodriguez',
            'assay_breakdown': [
                {'name': 'Glucose Assay', 'category': 'HPLC', 'samples': 96, 'batches': 4, 'instruments': ['HPLC-UV', 'HPLC-RID']},
                {'name': 'Ammonia Assay', 'category': 'Spectrophotometry', 'samples': 96, 'batches': 1, 'instruments': ['UV-Vis Spectrophotometer']},
                {'name': 'Lactate Assay', 'category': 'LC-MS', 'samples': 96, 'batches': 12, 'instruments': ['LC-MS/MS']},
                {'name': 'Creatinine Assay', 'category': 'HPLC', 'samples': 96, 'batches': 4, 'instruments': ['HPLC-UV']}
            ]
        },
        {
            'id': 'DEM-005',
            'project_name': 'Long-term Stability Program',
            'method': 'STABILITY-STUDY',
            'method_name': 'Stability Study',
            'sample_count': 72,
            'start_date': '2024-01-30',
            'priority': 'medium',
            'status': 'in-progress',
            'client': 'Analytics Ltd',
            'requester': 'Dr. James Thompson',
            'assay_breakdown': [
                {'name': 'Monomer Assay', 'category': 'HPLC', 'samples': 72, 'batches': 3, 'instruments': ['HPLC-UV', 'HPLC-CAD']},
                {'name': 'Aggregate Assay', 'category': 'SEC', 'samples': 72, 'batches': 6, 'instruments': ['SEC-HPLC', 'SEC-MALS']},
                {'name': 'Fragments Assay', 'category': 'LC-MS', 'samples': 72, 'batches': 5, 'instruments': ['LC-MS', 'LC-MS/MS']},
                {'name': 'Oxidation Assay', 'category': 'HPLC', 'samples': 72, 'batches': 3, 'instruments': ['HPLC-UV', 'HPLC-FLD']}
            ]
        }
    ]
    
    # Add newly created demand items to the queue
    demand_queue.extend(added_demand_items)
    
    return jsonify(demand_queue)

@app.route('/api/demand/by-instrument')
def api_demand_by_instrument():
    """Get demand breakdown by instrument type"""
    chart_data = {
        'labels': ['HPLC', 'LC-MS', 'GC', 'NMR', 'DSC'],
        'datasets': [{
            'data': [35, 28, 15, 12, 10],
            'backgroundColor': [
                '#3b82f6',  # Blue
                '#10b981',  # Green
                '#f59e0b',  # Amber
                '#ef4444',  # Red
                '#8b5cf6'   # Purple
            ],
            'borderColor': '#ffffff',
            'borderWidth': 2
        }]
    }
    return jsonify(chart_data)

@app.route('/api/demand/capacity-gap')
def api_demand_capacity_gap():
    """Get demand vs capacity gap analysis"""
    instruments = ['HPLC', 'LC-MS', 'GC', 'NMR', 'DSC']
    demand_hours = [120, 95, 60, 45, 30]
    capacity_hours = [100, 80, 70, 50, 40]
    
    chart_data = {
        'labels': instruments,
        'datasets': [
            {
                'label': 'Demand (Hours/Week)',
                'data': demand_hours,
                'backgroundColor': 'rgba(239, 68, 68, 0.8)',
                'borderColor': '#ef4444',
                'borderWidth': 2
            },
            {
                'label': 'Capacity (Hours/Week)',
                'data': capacity_hours,
                'backgroundColor': 'rgba(16, 185, 129, 0.8)',
                'borderColor': '#10b981',
                'borderWidth': 2
            }
        ]
    }
    return jsonify(chart_data)

@app.route('/api/personnel/skills')
def api_personnel_skills():
    """Get personnel skills matrix - who is trained on what methods"""
    personnel_skills = [
        {
            'person_id': 'alice_johnson',
            'name': 'Alice Johnson',
            'role': 'Senior Scientist',
            'department': 'Analytical',
            'hire_date': '2020-03-15',
            'certifications': ['HPLC Advanced', 'Method Development'],
            'trained_methods': [
                {'method_id': 'hplc-potency', 'certified_date': '2020-04-01', 'proficiency': 'expert'},
                {'method_id': 'hplc-impurity', 'certified_date': '2020-06-15', 'proficiency': 'expert'},
                {'method_id': 'dissolution', 'certified_date': '2021-02-01', 'proficiency': 'intermediate'}
            ],
            'current_workload': 85,
            'max_concurrent_batches': 2,
            'shift_pattern': 'standard', # 8am-5pm
            'overtime_approved': True
        },
        {
            'person_id': 'bob_smith',
            'name': 'Bob Smith',
            'role': 'Associate Scientist',
            'department': 'Analytical',
            'hire_date': '2021-08-01',
            'certifications': ['HPLC Basic', 'GC Certified'],
            'trained_methods': [
                {'method_id': 'hplc-potency', 'certified_date': '2021-09-15', 'proficiency': 'intermediate'},
                {'method_id': 'gc-residual', 'certified_date': '2021-10-01', 'proficiency': 'expert'},
                {'method_id': 'dissolution', 'certified_date': '2022-01-15', 'proficiency': 'intermediate'}
            ],
            'current_workload': 92,
            'max_concurrent_batches': 1,
            'shift_pattern': 'standard',
            'overtime_approved': False
        },
        {
            'person_id': 'carol_davis',
            'name': 'Carol Davis',
            'role': 'Technician',
            'department': 'Analytical',
            'hire_date': '2019-05-20',
            'certifications': ['LC-MS Specialist', 'Sample Prep Expert'],
            'trained_methods': [
                {'method_id': 'lcms-impurity', 'certified_date': '2019-07-01', 'proficiency': 'expert'},
                {'method_id': 'bioanalytical', 'certified_date': '2020-03-01', 'proficiency': 'expert'},
                {'method_id': 'hplc-potency', 'certified_date': '2021-01-15', 'proficiency': 'intermediate'}
            ],
            'current_workload': 78,
            'max_concurrent_batches': 2,
            'shift_pattern': 'early', # 6am-3pm
            'overtime_approved': True
        },
        {
            'person_id': 'david_wilson',
            'name': 'David Wilson',
            'role': 'Senior Scientist',
            'department': 'QC',
            'hire_date': '2018-11-01',
            'certifications': ['LC-MS Advanced', 'Method Validation'],
            'trained_methods': [
                {'method_id': 'lcms-impurity', 'certified_date': '2019-01-01', 'proficiency': 'expert'},
                {'method_id': 'bioanalytical', 'certified_date': '2019-06-01', 'proficiency': 'expert'},
                {'method_id': 'microbiology', 'certified_date': '2020-01-01', 'proficiency': 'intermediate'}
            ],
            'current_workload': 88,
            'max_concurrent_batches': 3,
            'shift_pattern': 'standard',
            'overtime_approved': True
        },
        {
            'person_id': 'frank_miller',
            'name': 'Frank Miller',
            'role': 'Specialist',
            'department': 'R&D',
            'hire_date': '2017-02-10',
            'certifications': ['NMR Expert', 'Thermal Analysis'],
            'trained_methods': [
                {'method_id': 'nmr-structure', 'certified_date': '2017-04-01', 'proficiency': 'expert'},
                {'method_id': 'dsc-thermal', 'certified_date': '2017-06-01', 'proficiency': 'expert'},
                {'method_id': 'gc-residual', 'certified_date': '2018-03-01', 'proficiency': 'intermediate'}
            ],
            'current_workload': 65,
            'max_concurrent_batches': 1,
            'shift_pattern': 'flexible', # 7am-4pm or 9am-6pm
            'overtime_approved': False
        }
    ]
    return jsonify(personnel_skills)

@app.route('/api/methods/instrument-compatibility')
def api_method_instrument_compatibility():
    """Get method x instrument compatibility matrix"""
    compatibility_matrix = [
        {
            'method_id': 'hplc-potency',
            'method_name': 'HPLC Potency Assay',
            'compatible_instruments': [
                {
                    'instrument_type': 'HPLC',
                    'instrument_ids': ['HPLC-01', 'HPLC-04'],
                    'batch_size': 12,
                    'run_time_per_sample': 15,
                    'setup_time': 30,
                    'cleanup_time': 15,
                    'total_time_per_batch': 6,
                    'preferred_instrument': 'HPLC-01'
                }
            ],
            'lead_time_days': 3,
            'sample_prep_required': True,
            'data_processing_complexity': 'low'
        },
        {
            'method_id': 'hplc-impurity',
            'method_name': 'HPLC Impurity Method',
            'compatible_instruments': [
                {
                    'instrument_type': 'HPLC',
                    'instrument_ids': ['HPLC-01', 'HPLC-04'],
                    'batch_size': 24,
                    'run_time_per_sample': 20,
                    'setup_time': 45,
                    'cleanup_time': 30,
                    'total_time_per_batch': 10,
                    'preferred_instrument': 'HPLC-04'
                }
            ],
            'lead_time_days': 5,
            'sample_prep_required': True,
            'data_processing_complexity': 'medium'
        },
        {
            'method_id': 'lcms-impurity',
            'method_name': 'LC-MS Impurity Screen',
            'compatible_instruments': [
                {
                    'instrument_type': 'LC-MS',
                    'instrument_ids': ['LCMS-02', 'LCMS-05'],
                    'batch_size': 18,
                    'run_time_per_sample': 18,
                    'setup_time': 60,
                    'cleanup_time': 30,
                    'total_time_per_batch': 8,
                    'preferred_instrument': 'LCMS-02'
                }
            ],
            'lead_time_days': 4,
            'sample_prep_required': True,
            'data_processing_complexity': 'high'
        },
        {
            'method_id': 'bioanalytical',
            'method_name': 'Bioanalytical Assay',
            'compatible_instruments': [
                {
                    'instrument_type': 'LC-MS',
                    'instrument_ids': ['LCMS-02', 'LCMS-05'],
                    'batch_size': 32,
                    'run_time_per_sample': 8,
                    'setup_time': 90,
                    'cleanup_time': 45,
                    'total_time_per_batch': 12,
                    'preferred_instrument': 'LCMS-05'
                }
            ],
            'lead_time_days': 6,
            'sample_prep_required': True,
            'data_processing_complexity': 'high'
        },
        {
            'method_id': 'gc-residual',
            'method_name': 'GC Residual Solvents',
            'compatible_instruments': [
                {
                    'instrument_type': 'GC',
                    'instrument_ids': ['GC-03'],
                    'batch_size': 20,
                    'run_time_per_sample': 12,
                    'setup_time': 30,
                    'cleanup_time': 20,
                    'total_time_per_batch': 7,
                    'preferred_instrument': 'GC-03'
                }
            ],
            'lead_time_days': 2,
            'sample_prep_required': False,
            'data_processing_complexity': 'low'
        },
        {
            'method_id': 'nmr-structure',
            'method_name': 'NMR Structure Confirmation',
            'compatible_instruments': [
                {
                    'instrument_type': 'NMR',
                    'instrument_ids': ['NMR-01'],
                    'batch_size': 6,
                    'run_time_per_sample': 45,
                    'setup_time': 60,
                    'cleanup_time': 30,
                    'total_time_per_batch': 16,
                    'preferred_instrument': 'NMR-01'
                }
            ],
            'lead_time_days': 7,
            'sample_prep_required': True,
            'data_processing_complexity': 'high'
        }
    ]
    return jsonify(compatibility_matrix)

@app.route('/api/calendar/holidays')
def api_holiday_calendar():
    """Get holiday and weekend calendar for scheduling calculations"""
    holidays = [
        {
            'date': '2024-01-01',
            'name': 'New Year\'s Day',
            'type': 'federal'
        },
        {
            'date': '2024-01-15',
            'name': 'Martin Luther King Jr. Day',
            'type': 'federal'
        },
        {
            'date': '2024-02-19',
            'name': 'Presidents\' Day',
            'type': 'federal'
        },
        {
            'date': '2024-03-29',
            'name': 'Good Friday',
            'type': 'company'
        },
        {
            'date': '2024-05-27',
            'name': 'Memorial Day',
            'type': 'federal'
        },
        {
            'date': '2024-06-19',
            'name': 'Juneteenth',
            'type': 'federal'
        },
        {
            'date': '2024-07-04',
            'name': 'Independence Day',
            'type': 'federal'
        },
        {
            'date': '2024-09-02',
            'name': 'Labor Day',
            'type': 'federal'
        },
        {
            'date': '2024-11-28',
            'name': 'Thanksgiving',
            'type': 'federal'
        },
        {
            'date': '2024-11-29',
            'name': 'Day after Thanksgiving',
            'type': 'company'
        },
        {
            'date': '2024-12-25',
            'name': 'Christmas Day',
            'type': 'federal'
        }
    ]
    
    # Add lab shutdown periods
    lab_shutdowns = [
        {
            'start_date': '2024-12-23',
            'end_date': '2024-01-02',
            'name': 'Year-end Shutdown',
            'type': 'lab_shutdown'
        }
    ]
    
    return jsonify({
        'holidays': holidays,
        'lab_shutdowns': lab_shutdowns,
        'weekend_policy': 'no_work', # or 'overtime_only'
        'holiday_policy': 'no_work'
    })

@app.route('/api/methods')
def api_methods():
    """Get available methods/panels with their assays and requirements"""
    methods = [
        {
            'id': 'HPLC-001',
            'name': 'HPLC Method A',
            'type': 'method',
            'category': 'HPLC',
            'lead_time_days': 3,
            'description': 'Standard HPLC analysis for organic compounds',
            'instrument_category': 'HPLC',
            'instrument_types': ['HPLC-UV', 'HPLC-RID'],
            'batch_size': 24,
            'time_per_batch': 4,
            'run_time_per_sample': 10,
            'qualified_personnel': ['Dr. Sarah Chen', 'Alice Johnson'],
            'is_active': True
        },
        {
            'id': 'HPLC-002',
            'name': 'HPLC Method B', 
            'type': 'method',
            'category': 'HPLC',
            'lead_time_days': 5,
            'description': 'Advanced HPLC method for complex matrices',
            'instrument_category': 'HPLC',
            'instrument_types': ['HPLC-UV', 'HPLC-CAD'],
            'batch_size': 24,
            'time_per_batch': 5,
            'run_time_per_sample': 12,
            'qualified_personnel': ['Dr. James Thompson', 'David Wilson'],
            'is_active': True
        },
        {
            'id': 'GC-001',
            'name': 'GC Method A',
            'type': 'method',
            'category': 'GC',
            'lead_time_days': 2,
            'description': 'Gas chromatography for volatile compounds',
            'instrument_category': 'GC',
            'instrument_types': ['GC-FID', 'GC-MS'],
            'batch_size': 36,
            'time_per_batch': 3,
            'run_time_per_sample': 5,
            'qualified_personnel': ['Dr. Michael Rodriguez', 'Bob Smith'],
            'is_active': True
        },
        {
            'id': 'MS-001',
            'name': 'Mass Spec Method A',
            'type': 'method',
            'category': 'MS',
            'lead_time_days': 7,
            'description': 'LC-MS/MS analysis for trace compounds',
            'instrument_category': 'LC-MS',
            'instrument_types': ['LC-MS/MS', 'LC-MS'],
            'batch_size': 16,
            'time_per_batch': 6,
            'run_time_per_sample': 22,
            'qualified_personnel': ['Dr. Sarah Chen', 'Emma Brown'],
            'is_active': True
        },
        {
            'id': 'ICP-001',
            'name': 'ICP-MS Method A',
            'type': 'method',
            'category': 'ICP',
            'lead_time_days': 4,
            'description': 'Inductively coupled plasma mass spectrometry',
            'instrument_category': 'ICP',
            'instrument_types': ['ICP-MS', 'ICP-OES'],
            'batch_size': 48,
            'time_per_batch': 4,
            'run_time_per_sample': 5,
            'qualified_personnel': ['Dr. Lisa Anderson', 'Carol Davis'],
            'is_active': True
        }
    ]
    return jsonify(methods)

@app.route('/api/instrument-categories')
def api_instrument_categories():
    """Get instrument categories and their specific types"""
    categories = [
                    'run_time_per_sample': 10,
                    'qualified_personnel': ['Dr. Sarah Chen', 'Alice Johnson'],
                    'description': 'Glucose quantification using HPLC'
                },
                {
                    'id': 'AMMONIA-ASSAY',
                    'name': 'Ammonia Assay',
                    'instrument_category': 'Spectrophotometry',
                    'instrument_types': ['UV-Vis Spectrophotometer'],
                    'batch_size': 96,
                    'time_per_batch': 2,
                    'run_time_per_sample': 1,
                    'qualified_personnel': ['Dr. Michael Rodriguez', 'Bob Smith'],
                    'description': 'Ammonia measurement using spectrophotometric method'
                },
                {
                    'id': 'LACTATE-ASSAY',
                    'name': 'Lactate Assay',
                    'instrument_category': 'LC-MS',
                    'instrument_types': ['LC-MS/MS'],
                    'batch_size': 8,
                    'time_per_batch': 6,
                    'run_time_per_sample': 45,
                    'qualified_personnel': ['Dr. Sarah Chen', 'Emma Brown'],
                    'description': 'Lactate analysis using LC-MS/MS'
                },
                {
                    'id': 'CREATININE-ASSAY',
                    'name': 'Creatinine Assay',
                    'instrument_category': 'HPLC',
                    'instrument_types': ['HPLC-UV'],
                    'batch_size': 24,
                    'time_per_batch': 3,
                    'run_time_per_sample': 8,
                    'qualified_personnel': ['Dr. Michael Rodriguez', 'Charlie Wilson'],
                    'description': 'Creatinine determination using HPLC-UV'
                }
            ]
        },
        {
            'id': 'STABILITY-STUDY',
            'name': 'Stability Study',
            'type': 'method',
            'category': 'Stability Testing',
            'lead_time_days': 3,
            'description': 'Long-term stability testing under various conditions (temperature, humidity, light)',
            'assays': [
                {
                    'id': 'MONOMER-ASSAY',
                    'name': 'Monomer Assay',
                    'instrument_category': 'HPLC',
                    'instrument_types': ['HPLC-UV', 'HPLC-CAD'],
                    'batch_size': 24,
                    'time_per_batch': 6,
                    'run_time_per_sample': 15,
                    'qualified_personnel': ['Dr. James Thompson', 'David Lee'],
                    'description': 'Monomer content determination using HPLC'
                },
                {
                    'id': 'AGGREGATE-ASSAY',
                    'name': 'Aggregate Assay',
                    'instrument_category': 'SEC',
                    'instrument_types': ['SEC-HPLC', 'SEC-MALS'],
                    'batch_size': 12,
                    'time_per_batch': 8,
                    'run_time_per_sample': 40,
                    'qualified_personnel': ['Dr. James Thompson', 'Frank Miller'],
                    'description': 'Aggregate analysis using size exclusion chromatography'
                },
                {
                    'id': 'FRAGMENTS-ASSAY',
                    'name': 'Fragments Assay',
                    'instrument_category': 'LC-MS',
                    'instrument_types': ['LC-MS', 'LC-MS/MS'],
                    'batch_size': 16,
                    'time_per_batch': 10,
                    'run_time_per_sample': 30,
                    'qualified_personnel': ['Dr. James Thompson', 'Grace Lee'],
                    'description': 'Fragment analysis using LC-MS'
                },
                {
                    'id': 'OXIDATION-ASSAY',
                    'name': 'Oxidation Assay',
                    'instrument_category': 'HPLC',
                    'instrument_types': ['HPLC-UV', 'HPLC-FLD'],
                    'batch_size': 24,
                    'time_per_batch': 5,
                    'run_time_per_sample': 12,
                    'qualified_personnel': ['Dr. James Thompson', 'Henry Taylor'],
                    'description': 'Oxidation product analysis using HPLC'
                }
            ]
        },
        {
            'id': 'PURITY-ANALYSIS',
            'name': 'Purity Analysis',
            'type': 'method',
            'category': 'Quality Control',
            'lead_time_days': 2,
            'description': 'Determination of compound purity using HPLC with UV and charged aerosol detection',
            'assays': [
                {
                    'id': 'HPLC-PURITY-ASSAY',
                    'name': 'HPLC Purity Assay',
                    'instrument_category': 'HPLC',
                    'instrument_types': ['HPLC-UV', 'HPLC-CAD'],
                    'batch_size': 24,
                    'time_per_batch': 6,
                    'run_time_per_sample': 15,
                    'qualified_personnel': ['Dr. Lisa Anderson', 'Charlie Wilson', 'Emma Brown'],
                    'description': 'Main component purity determination'
                }
            ]
        },
        {
            'id': 'STABILITY-STUDY',
            'name': 'Stability Study',
            'instrument_type': 'HPLC-UV, LC-MS',
            'qualified_personnel': ['Dr. James Thompson', 'David Lee', 'Frank Miller'],
            'typical_batch_size': 24,
            'time_per_batch': 8,
            'sample_prep_time': 2,
            'run_time_per_sample': 20,
            'data_processing_time': 1.5,
            'lead_time_days': 3,
            'description': 'Long-term stability testing under various conditions (temperature, humidity, light)'
        },
        {
            'id': 'IMPURITY-PROFILE',
            'name': 'Impurity Profile',
            'instrument_type': 'HPLC-UV, LC-MS, GC-MS',
            'qualified_personnel': ['Dr. Maria Garcia', 'Grace Lee', 'Henry Taylor'],
            'typical_batch_size': 16,
            'time_per_batch': 10,
            'sample_prep_time': 3,
            'run_time_per_sample': 30,
            'data_processing_time': 2,
            'lead_time_days': 4,
            'description': 'Comprehensive impurity identification and quantification using multiple analytical techniques'
        },
        {
            'id': 'RESIDUAL-SOLVENTS',
            'name': 'Residual Solvents',
            'instrument_type': 'GC-FID, GC-MS',
            'qualified_personnel': ['Dr. Kevin Park', 'Alice Johnson', 'Bob Smith'],
            'typical_batch_size': 12,
            'time_per_batch': 4,
            'sample_prep_time': 1,
            'run_time_per_sample': 20,
            'data_processing_time': 0.5,
            'lead_time_days': 1,
            'description': 'Analysis of residual solvents in pharmaceutical products using gas chromatography'
        },
        {
            'id': 'ELEMENTAL-ANALYSIS',
            'name': 'Elemental Analysis',
            'instrument_type': 'ICP-MS, ICP-OES',
            'qualified_personnel': ['Dr. Amanda White', 'Charlie Wilson', 'Emma Brown'],
            'typical_batch_size': 16,
            'time_per_batch': 6,
            'sample_prep_time': 2,
            'run_time_per_sample': 25,
            'data_processing_time': 1,
            'lead_time_days': 3,
            'description': 'Quantitative analysis of trace elements and heavy metals in various matrices'
        },
        {
            'id': 'BIOANALYTICAL-ASSAY',
            'name': 'Bioanalytical Assay',
            'instrument_type': 'LC-MS/MS, HPLC-UV',
            'qualified_personnel': ['Dr. Patricia Davis', 'David Lee', 'Frank Miller'],
            'typical_batch_size': 8,
            'time_per_batch': 12,
            'sample_prep_time': 4,
            'run_time_per_sample': 45,
            'data_processing_time': 2,
            'lead_time_days': 5,
            'description': 'Quantitative bioanalysis of drugs and metabolites in biological matrices'
        },
        {
            'id': 'PHARMACOKINETICS',
            'name': 'Pharmacokinetics',
            'instrument_type': 'LC-MS/MS',
            'qualified_personnel': ['Dr. Richard Brown', 'Grace Lee', 'Henry Taylor'],
            'typical_batch_size': 8,
            'time_per_batch': 14,
            'sample_prep_time': 5,
            'run_time_per_sample': 60,
            'data_processing_time': 3,
            'lead_time_days': 6,
            'description': 'PK studies including drug absorption, distribution, metabolism, and excretion'
        },
        {
            'id': 'TOXICOKINETICS',
            'name': 'Toxicokinetics',
            'instrument_type': 'LC-MS/MS, GC-MS',
            'qualified_personnel': ['Dr. Susan Martinez', 'Alice Johnson', 'Bob Smith'],
            'typical_batch_size': 8,
            'time_per_batch': 16,
            'sample_prep_time': 6,
            'run_time_per_sample': 70,
            'data_processing_time': 4,
            'lead_time_days': 7,
            'description': 'Toxicokinetic studies for safety assessment and regulatory submissions'
        },
        {
            'id': 'BIOMARKER-ANALYSIS',
            'name': 'Biomarker Analysis',
            'instrument_type': 'LC-MS/MS, HPLC-UV',
            'qualified_personnel': ['Dr. Thomas Wilson', 'Charlie Wilson', 'Emma Brown'],
            'typical_batch_size': 8,
            'time_per_batch': 10,
            'sample_prep_time': 3,
            'run_time_per_sample': 40,
            'data_processing_time': 2,
            'lead_time_days': 4,
            'description': 'Discovery and validation of biomarkers for disease diagnosis and monitoring'
        },
        {
            'id': 'PROTEOMICS',
            'name': 'Proteomics',
            'instrument_type': 'LC-MS/MS, MALDI-TOF',
            'qualified_personnel': ['Dr. Nancy Taylor', 'David Lee', 'Frank Miller'],
            'typical_batch_size': 6,
            'time_per_batch': 18,
            'sample_prep_time': 8,
            'run_time_per_sample': 90,
            'data_processing_time': 6,
            'lead_time_days': 8,
            'description': 'Comprehensive protein identification, quantification, and post-translational modification analysis'
        },
        {
            'id': 'GENOMICS',
            'name': 'Genomics',
            'instrument_type': 'qPCR, NGS',
            'qualified_personnel': ['Dr. Christopher Lee', 'Grace Lee', 'Henry Taylor'],
            'typical_batch_size': 96,
            'time_per_batch': 24,
            'sample_prep_time': 12,
            'run_time_per_sample': 120,
            'data_processing_time': 8,
            'lead_time_days': 10,
            'description': 'Genomic analysis including gene expression, sequencing, and variant detection'
        }
    ]
    return jsonify(methods)

@app.route('/api/instrument-categories')
def api_instrument_categories():
    """Get instrument categories and their specific types"""
    categories = [
        {
            'id': 'HPLC',
            'name': 'High Performance Liquid Chromatography',
            'description': 'HPLC systems for separation and analysis',
            'instrument_types': [
                {'id': 'HPLC-UV', 'name': 'HPLC with UV Detection', 'batch_capacity': 24, 'run_time_per_sample': 15},
                {'id': 'HPLC-CAD', 'name': 'HPLC with Charged Aerosol Detection', 'batch_capacity': 24, 'run_time_per_sample': 15},
                {'id': 'HPLC-RID', 'name': 'HPLC with Refractive Index Detection', 'batch_capacity': 24, 'run_time_per_sample': 12},
                {'id': 'HPLC-FLD', 'name': 'HPLC with Fluorescence Detection', 'batch_capacity': 24, 'run_time_per_sample': 12}
            ]
        },
        {
            'id': 'LC-MS',
            'name': 'Liquid Chromatography Mass Spectrometry',
            'description': 'LC-MS systems for mass spectrometric analysis',
            'instrument_types': [
                {'id': 'LC-MS', 'name': 'Single Quadrupole LC-MS', 'batch_capacity': 16, 'run_time_per_sample': 30},
                {'id': 'LC-MS/MS', 'name': 'Triple Quadrupole LC-MS/MS', 'batch_capacity': 8, 'run_time_per_sample': 45}
            ]
        },
        {
            'id': 'GC',
            'name': 'Gas Chromatography',
            'description': 'GC systems for volatile compound analysis',
            'instrument_types': [
                {'id': 'GC-FID', 'name': 'GC with Flame Ionization Detection', 'batch_capacity': 12, 'run_time_per_sample': 20},
                {'id': 'GC-MS', 'name': 'GC with Mass Spectrometry', 'batch_capacity': 12, 'run_time_per_sample': 25}
            ]
        },
        {
            'id': 'SEC',
            'name': 'Size Exclusion Chromatography',
            'description': 'SEC systems for molecular size analysis',
            'instrument_types': [
                {'id': 'SEC-HPLC', 'name': 'SEC with HPLC Detection', 'batch_capacity': 12, 'run_time_per_sample': 40},
                {'id': 'SEC-MALS', 'name': 'SEC with Multi-Angle Light Scattering', 'batch_capacity': 12, 'run_time_per_sample': 50}
            ]
        },
        {
            'id': 'Spectrophotometry',
            'name': 'Spectrophotometric Analysis',
            'description': 'UV-Vis and other spectrophotometric methods',
            'instrument_types': [
                {'id': 'UV-Vis Spectrophotometer', 'name': 'UV-Visible Spectrophotometer', 'batch_capacity': 96, 'run_time_per_sample': 1}
            ]
        },
        {
            'id': 'ICP',
            'name': 'Inductively Coupled Plasma',
            'description': 'ICP systems for elemental analysis',
            'instrument_types': [
                {'id': 'ICP-MS', 'name': 'ICP Mass Spectrometry', 'batch_capacity': 16, 'run_time_per_sample': 25},
                {'id': 'ICP-OES', 'name': 'ICP Optical Emission Spectrometry', 'batch_capacity': 20, 'run_time_per_sample': 20}
            ]
        }
    ]
    return jsonify(categories)

@app.route('/api/eln/instruments/status')
def api_eln_instrument_status():
    """Get real-time instrument status from ELN system"""
    # Simulated ELN data - in reality this would call external ELN API
    instrument_status = [
        {
            'instrument_id': 'HPLC-01',
            'instrument_name': 'HPLC System 1',
            'type': 'HPLC',
            'location': 'Lab A',
            'status': 'running',
            'current_sample_batch': 'SAM-001-B2',
            'current_method': 'HPLC Potency Assay',
            'operator': 'Alice Johnson',
            'started_at': '2024-01-25T09:00:00',
            'estimated_completion': '2024-01-25T15:00:00',
            'samples_remaining': 8,
            'total_samples_in_batch': 12,
            'queue_position': 2,
            'next_available': '2024-01-25T15:30:00'
        },
        {
            'instrument_id': 'HPLC-04',
            'instrument_name': 'HPLC System 4',
            'type': 'HPLC',
            'location': 'Lab A',
            'status': 'available',
            'current_sample_batch': None,
            'current_method': None,
            'operator': None,
            'next_available': '2024-01-25T08:00:00'
        },
        {
            'instrument_id': 'LCMS-02',
            'instrument_name': 'LC-MS System 2',
            'type': 'LC-MS',
            'location': 'Lab A',
            'status': 'running',
            'current_sample_batch': 'SAM-002-B1',
            'current_method': 'LC-MS Impurity Screen',
            'operator': 'Carol Davis',
            'started_at': '2024-01-25T10:00:00',
            'estimated_completion': '2024-01-25T18:00:00',
            'samples_remaining': 12,
            'total_samples_in_batch': 18,
            'queue_position': 1,
            'next_available': '2024-01-25T18:30:00'
        },
        {
            'instrument_id': 'LCMS-05',
            'instrument_name': 'LC-MS System 5',
            'type': 'LC-MS',
            'location': 'Lab B',
            'status': 'maintenance',
            'current_sample_batch': None,
            'current_method': None,
            'operator': None,
            'maintenance_until': '2024-01-26T12:00:00',
            'next_available': '2024-01-26T12:00:00'
        },
        {
            'instrument_id': 'GC-03',
            'instrument_name': 'GC System 3',
            'type': 'GC',
            'location': 'Lab B',
            'status': 'queued',
            'current_sample_batch': None,
            'current_method': None,
            'operator': None,
            'queue_position': 3,
            'queued_batches': [
                {'batch_id': 'SAM-005-B1', 'method': 'GC Residual Solvents', 'estimated_duration': 7},
                {'batch_id': 'SAM-006-B1', 'method': 'GC Residual Solvents', 'estimated_duration': 7}
            ],
            'next_available': '2024-01-26T08:00:00'
        },
        {
            'instrument_id': 'NMR-01',
            'instrument_name': 'NMR System 1',
            'type': 'NMR',
            'location': 'Lab C',
            'status': 'available',
            'current_sample_batch': None,
            'current_method': None,
            'operator': None,
            'next_available': '2024-01-25T08:00:00'
        },
        {
            'instrument_id': 'DSC-01',
            'instrument_name': 'DSC System 1',
            'type': 'DSC',
            'location': 'Lab C',
            'status': 'running',
            'current_sample_batch': 'SAM-004-B1',
            'current_method': 'DSC Thermal Analysis',
            'operator': 'Frank Miller',
            'started_at': '2024-01-25T14:00:00',
            'estimated_completion': '2024-01-25T22:00:00',
            'samples_remaining': 3,
            'total_samples_in_batch': 6,
            'next_available': '2024-01-25T22:30:00'
        }
    ]
    return jsonify(instrument_status)

@app.route('/api/eln/personnel/availability')
def api_eln_personnel_availability():
    """Get real-time personnel availability from ELN/scheduling system"""
    personnel_availability = [
        {
            'person_id': 'alice_johnson',
            'name': 'Alice Johnson',
            'role': 'Senior Scientist',
            'status': 'busy',
            'current_activity': 'Running HPLC-01',
            'available_from': '2024-01-25T15:30:00',
            'qualified_methods': ['hplc-potency', 'hplc-impurity'],
            'shift_end': '2024-01-25T17:00:00'
        },
        {
            'person_id': 'bob_smith',
            'name': 'Bob Smith',
            'role': 'Associate Scientist',
            'status': 'available',
            'current_activity': None,
            'available_from': '2024-01-25T08:00:00',
            'qualified_methods': ['hplc-potency', 'gc-residual'],
            'shift_end': '2024-01-25T17:00:00'
        },
        {
            'person_id': 'carol_davis',
            'name': 'Carol Davis',
            'role': 'Technician',
            'status': 'busy',
            'current_activity': 'Running LCMS-02',
            'available_from': '2024-01-25T18:30:00',
            'qualified_methods': ['lcms-impurity'],
            'shift_end': '2024-01-25T17:00:00',
            'overtime_approved': True
        },
        {
            'person_id': 'david_wilson',
            'name': 'David Wilson',
            'role': 'Senior Scientist',
            'status': 'available',
            'current_activity': None,
            'available_from': '2024-01-25T08:00:00',
            'qualified_methods': ['lcms-impurity'],
            'shift_end': '2024-01-25T17:00:00'
        },
        {
            'person_id': 'emma_brown',
            'name': 'Emma Brown',
            'role': 'Associate Scientist',
            'status': 'on_leave',
            'current_activity': 'Vacation',
            'available_from': '2024-01-28T08:00:00',
            'qualified_methods': ['hplc-potency', 'hplc-impurity'],
            'shift_end': '2024-01-25T17:00:00'
        },
        {
            'person_id': 'frank_miller',
            'name': 'Frank Miller',
            'role': 'Technician',
            'status': 'busy',
            'current_activity': 'Running DSC-01',
            'available_from': '2024-01-25T22:30:00',
            'qualified_methods': ['nmr-structure', 'gc-residual'],
            'shift_end': '2024-01-25T17:00:00',
            'overtime_approved': True
        }
    ]
    return jsonify(personnel_availability)

@app.route('/api/capacity/realtime')
def api_realtime_capacity():
    """Calculate real-time capacity availability based on ELN data"""
    # This would integrate instrument and personnel availability
    capacity_data = {
        'HPLC': {
            'total_instruments': 2,
            'available_now': 1,
            'available_today': 2,
            'earliest_slot': '2024-01-25T15:30:00',
            'queue_depth': 2,
            'avg_wait_time_hours': 6.5
        },
        'LC-MS': {
            'total_instruments': 2,
            'available_now': 0,
            'available_today': 1,
            'earliest_slot': '2024-01-25T18:30:00',
            'queue_depth': 1,
            'avg_wait_time_hours': 8.5
        },
        'GC': {
            'total_instruments': 1,
            'available_now': 0,
            'available_today': 0,
            'earliest_slot': '2024-01-26T08:00:00',
            'queue_depth': 3,
            'avg_wait_time_hours': 18
        },
        'NMR': {
            'total_instruments': 1,
            'available_now': 1,
            'available_today': 1,
            'earliest_slot': '2024-01-25T08:00:00',
            'queue_depth': 0,
            'avg_wait_time_hours': 0
        },
        'DSC': {
            'total_instruments': 1,
            'available_now': 0,
            'available_today': 1,
            'earliest_slot': '2024-01-25T22:30:00',
            'queue_depth': 0,
            'avg_wait_time_hours': 8.5
        }
    }
    return jsonify(capacity_data)

@app.route('/api/scheduling/optimize', methods=['POST'])
def api_optimize_schedule():
    """Generate optimal schedule based on samples, methods, personnel, and constraints"""
    req_data = request.get_json()
    
    # Sample optimization algorithm (simplified)
    # In reality, this would be a complex constraint satisfaction problem
    sample_requests = req_data.get('sample_requests', [])
    
    optimized_schedule = []
    current_time = datetime.now()
    
    # Sample optimization logic
    for i, sample_request in enumerate(sample_requests):
        method_id = sample_request.get('method')
        sample_count = sample_request.get('sample_count', 0)
        priority = sample_request.get('priority', 'medium')
        required_by = sample_request.get('required_by_date')
        
        # Find best operator (highest proficiency, lowest workload)
        best_operator = 'Alice Johnson'  # Simplified selection
        best_instrument = 'HPLC-01'     # Simplified selection
        
        # Calculate batches
        batch_size = 12  # From method-instrument compatibility
        batches_needed = np.ceil(sample_count / batch_size)
        
        # Schedule each batch
        for batch_num in range(int(batches_needed)):
            start_time = current_time + timedelta(hours=i * 8)  # Simplified scheduling
            end_time = start_time + timedelta(hours=6)  # Batch duration
            
            optimized_schedule.append({
                'request_id': sample_request.get('id', f'REQ-{i+1}'),
                'batch_id': f"{sample_request.get('id', f'REQ-{i+1}')}-B{batch_num+1}",
                'operator': best_operator,
                'instrument': best_instrument,
                'method': method_id,
                'samples_in_batch': min(batch_size, sample_count - (batch_num * batch_size)),
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'priority': priority,
                'status': 'scheduled'
            })
    
    return jsonify({
        'optimized_schedule': optimized_schedule,
        'total_batches': len(optimized_schedule),
        'schedule_efficiency': 85.5,  # Percentage
        'bottlenecks': ['LC-MS capacity', 'Frank Miller availability'],
        'recommendations': [
            'Consider overtime for LC-MS methods',
            'Cross-train additional personnel on NMR',
            'Schedule maintenance during low-demand periods'
        ]
    })

@app.route('/api/capacity/overview')
def api_capacity_overview():
    """Get capacity overview comparing sample capacity by method"""
    capacity_overview = {
        'by_method': [
            {
                'method_id': 'hplc-potency',
                'method_name': 'HPLC Potency Assay',
                'daily_capacity': 48,  # samples per day
                'weekly_capacity': 240,
                'current_utilization': 78,
                'available_capacity': 22,
                'qualified_operators': 3,
                'available_instruments': 2,
                'bottleneck_factor': 'personnel'  # or 'instrument'
            },
            {
                'method_id': 'lcms-impurity',
                'method_name': 'LC-MS Impurity Screen',
                'daily_capacity': 36,
                'weekly_capacity': 180,
                'current_utilization': 95,
                'available_capacity': 5,
                'qualified_operators': 4,
                'available_instruments': 1,  # One in maintenance
                'bottleneck_factor': 'instrument'
            },
            {
                'method_id': 'nmr-structure',
                'method_name': 'NMR Structure Confirmation',
                'daily_capacity': 12,
                'weekly_capacity': 60,
                'current_utilization': 45,
                'available_capacity': 55,
                'qualified_operators': 1,
                'available_instruments': 1,
                'bottleneck_factor': 'personnel'
            },
            {
                'method_id': 'gc-residual',
                'method_name': 'GC Residual Solvents',
                'daily_capacity': 40,
                'weekly_capacity': 200,
                'current_utilization': 82,
                'available_capacity': 18,
                'qualified_operators': 2,
                'available_instruments': 1,
                'bottleneck_factor': 'balanced'
            }
        ],
        'overall_metrics': {
            'total_daily_capacity': 136,
            'total_weekly_capacity': 680,
            'current_demand': 542,
            'capacity_utilization': 79.7,
            'projected_bottlenecks': ['LC-MS instruments', 'NMR personnel'],
            'optimization_opportunities': [
                'Cross-train LC-MS personnel on HPLC methods',
                'Implement staggered shifts for high-demand periods',
                'Consider additional LC-MS instrument procurement'
            ]
        }
    }
    return jsonify(capacity_overview)

@app.route('/api/demand/add', methods=['POST'])
def api_add_demand():
    """Add new sample-based demand request"""
    data = request.get_json()
    
    # Extract form data and ensure proper types
    sample_count = int(data.get('sample_count', 0))
    method_id = data.get('method', '')
    
    # Validation
    if sample_count <= 0:
        return jsonify({
            'success': False,
            'message': 'Sample count must be greater than 0'
        }), 400
    
    if not method_id:
        return jsonify({
            'success': False,
            'message': 'Method must be selected'
        }), 400
    
    # Generate assay breakdown for the selected method
    assay_breakdown = get_assay_breakdown_for_method(method_id, sample_count)
    
    # Generate unique ID using Python random instead of numpy
    import random
    demand_id = f"DEM-{random.randint(100, 999):03d}"
    
    # Create the demand item
    demand_item = {
        'id': demand_id,
        'date': data.get('start_date', datetime.now().strftime('%Y-%m-%d')),
        'method': str(method_id),
        'method_name': str(method_id.replace('-', ' ').title()),
        'sample_count': sample_count,
        'priority': str(data.get('priority', 'medium')),
        'status': str(data.get('status', 'pending')),
        'client': str(data.get('client', '')),
        'project': str(data.get('project_name', '')),
        'requirements': str(data.get('requirements', '')),
        'assay_breakdown': assay_breakdown,
        'created_at': datetime.now().isoformat()
    }
    
    # Store in memory (in production, this would save to database)
    added_demand_items.append(demand_item)
    
    return jsonify({
        'success': True,
        'message': 'Sample request added successfully',
        'id': demand_id,
        'data': demand_item
    })

# ============================================================================
# ADMIN API ENDPOINTS
# ============================================================================

@app.route('/api/admin/methods', methods=['GET'])
def api_admin_methods():
    """Get all methods for admin management"""
    methods = [
        {
            'id': 'HPLC-001',
            'name': 'HPLC Method A',
            'description': 'Standard HPLC analysis for organic compounds',
            'category': 'HPLC',
            'lead_time_days': 3,
            'is_active': True
        },
        {
            'id': 'HPLC-002', 
            'name': 'HPLC Method B',
            'description': 'Advanced HPLC method for complex matrices',
            'category': 'HPLC',
            'lead_time_days': 5,
            'is_active': True
        },
        {
            'id': 'GC-001',
            'name': 'GC Method A',
            'description': 'Gas chromatography for volatile compounds',
            'category': 'GC',
            'lead_time_days': 2,
            'is_active': True
        },
        {
            'id': 'MS-001',
            'name': 'Mass Spec Method A',
            'description': 'LC-MS/MS analysis for trace compounds',
            'category': 'MS',
            'lead_time_days': 7,
            'is_active': True
        },
        {
            'id': 'ICP-001',
            'name': 'ICP-MS Method A',
            'description': 'Inductively coupled plasma mass spectrometry',
            'category': 'ICP',
            'lead_time_days': 4,
            'is_active': True
        }
    ]
    return jsonify(methods)

@app.route('/api/admin/instruments', methods=['GET'])
def api_admin_instruments():
    """Get all instruments for admin management"""
    instruments = [
        {
            'id': 'HPLC-01',
            'name': 'Agilent 1260 HPLC',
            'type': 'HPLC',
            'status': 'active',
            'location': 'Lab A-101',
            'max_batch_size': 96,
            'setup_time_hours': 1,
            'cleanup_time_hours': 0.5
        },
        {
            'id': 'HPLC-02',
            'name': 'Waters 2695 HPLC',
            'type': 'HPLC', 
            'status': 'active',
            'location': 'Lab A-102',
            'max_batch_size': 96,
            'setup_time_hours': 1.5,
            'cleanup_time_hours': 0.5
        },
        {
            'id': 'GC-01',
            'name': 'Agilent 7890B GC',
            'type': 'GC',
            'status': 'active',
            'location': 'Lab B-201',
            'max_batch_size': 48,
            'setup_time_hours': 0.5,
            'cleanup_time_hours': 0.25
        },
        {
            'id': 'MS-01',
            'name': 'Thermo Q Exactive MS',
            'type': 'MS',
            'status': 'active',
            'location': 'Lab C-301',
            'max_batch_size': 24,
            'setup_time_hours': 2,
            'cleanup_time_hours': 1
        },
        {
            'id': 'ICP-01',
            'name': 'PerkinElmer NexION ICP-MS',
            'type': 'ICP',
            'status': 'active',
            'location': 'Lab D-401',
            'max_batch_size': 72,
            'setup_time_hours': 1,
            'cleanup_time_hours': 0.5
        }
    ]
    return jsonify(instruments)

@app.route('/api/admin/operators', methods=['GET'])
def api_admin_operators():
    """Get all operators for admin management"""
    operators = [
        {
            'id': 'OP-001',
            'name': 'Alice Johnson',
            'email': 'alice.johnson@lab.com',
            'department': 'Analytical Chemistry',
            'shift': 'Day',
            'max_hours_per_week': 40,
            'is_active': True,
            'hire_date': '2020-01-15',
            'certifications': ['HPLC Level 2', 'GC Level 1', 'MS Level 1']
        },
        {
            'id': 'OP-002',
            'name': 'Bob Smith',
            'email': 'bob.smith@lab.com',
            'department': 'Analytical Chemistry',
            'shift': 'Day',
            'max_hours_per_week': 40,
            'is_active': True,
            'hire_date': '2019-03-22',
            'certifications': ['HPLC Level 3', 'GC Level 2', 'ICP Level 1']
        },
        {
            'id': 'OP-003',
            'name': 'Carol Davis',
            'email': 'carol.davis@lab.com',
            'department': 'Analytical Chemistry',
            'shift': 'Evening',
            'max_hours_per_week': 40,
            'is_active': True,
            'hire_date': '2021-06-10',
            'certifications': ['HPLC Level 1', 'MS Level 2', 'ICP Level 2']
        },
        {
            'id': 'OP-004',
            'name': 'David Wilson',
            'email': 'david.wilson@lab.com',
            'department': 'Analytical Chemistry',
            'shift': 'Night',
            'max_hours_per_week': 40,
            'is_active': True,
            'hire_date': '2018-11-05',
            'certifications': ['HPLC Level 2', 'GC Level 3', 'MS Level 1']
        }
    ]
    return jsonify(operators)

@app.route('/api/admin/method-instrument-matrix', methods=['GET'])
def api_admin_method_instrument_matrix():
    """Get method x instrument compatibility matrix for admin management"""
    matrix = [
        {
            'method_id': 'HPLC-001',
            'method_name': 'HPLC Method A',
            'instrument_id': 'HPLC-01',
            'instrument_name': 'Agilent 1260 HPLC',
            'is_compatible': True,
            'batch_size': 96,
            'run_time_hours': 2.5,
            'setup_time_hours': 1,
            'cleanup_time_hours': 0.5,
            'lead_time_days': 3,
            'efficiency_factor': 1.0
        },
        {
            'method_id': 'HPLC-001',
            'method_name': 'HPLC Method A',
            'instrument_id': 'HPLC-02',
            'instrument_name': 'Waters 2695 HPLC',
            'is_compatible': True,
            'batch_size': 96,
            'run_time_hours': 2.8,
            'setup_time_hours': 1.5,
            'cleanup_time_hours': 0.5,
            'lead_time_days': 3,
            'efficiency_factor': 0.9
        },
        {
            'method_id': 'HPLC-002',
            'method_name': 'HPLC Method B',
            'instrument_id': 'HPLC-01',
            'instrument_name': 'Agilent 1260 HPLC',
            'is_compatible': True,
            'batch_size': 48,
            'run_time_hours': 4.0,
            'setup_time_hours': 1,
            'cleanup_time_hours': 0.5,
            'lead_time_days': 5,
            'efficiency_factor': 1.0
        },
        {
            'method_id': 'GC-001',
            'method_name': 'GC Method A',
            'instrument_id': 'GC-01',
            'instrument_name': 'Agilent 7890B GC',
            'is_compatible': True,
            'batch_size': 48,
            'run_time_hours': 1.5,
            'setup_time_hours': 0.5,
            'cleanup_time_hours': 0.25,
            'lead_time_days': 2,
            'efficiency_factor': 1.0
        },
        {
            'method_id': 'MS-001',
            'method_name': 'Mass Spec Method A',
            'instrument_id': 'MS-01',
            'instrument_name': 'Thermo Q Exactive MS',
            'is_compatible': True,
            'batch_size': 24,
            'run_time_hours': 6.0,
            'setup_time_hours': 2,
            'cleanup_time_hours': 1,
            'lead_time_days': 7,
            'efficiency_factor': 1.0
        },
        {
            'method_id': 'ICP-001',
            'method_name': 'ICP-MS Method A',
            'instrument_id': 'ICP-01',
            'instrument_name': 'PerkinElmer NexION ICP-MS',
            'is_compatible': True,
            'batch_size': 72,
            'run_time_hours': 3.0,
            'setup_time_hours': 1,
            'cleanup_time_hours': 0.5,
            'lead_time_days': 4,
            'efficiency_factor': 1.0
        }
    ]
    return jsonify(matrix)

@app.route('/api/admin/operator-skills', methods=['GET'])
def api_admin_operator_skills():
    """Get operator skills matrix for admin management"""
    skills = [
        {
            'operator_id': 'OP-001',
            'operator_name': 'Alice Johnson',
            'method_id': 'HPLC-001',
            'method_name': 'HPLC Method A',
            'proficiency_level': 'Expert',
            'certification_date': '2020-02-15',
            'last_training': '2023-01-10',
            'can_train_others': True,
            'max_batch_size': 96
        },
        {
            'operator_id': 'OP-001',
            'operator_name': 'Alice Johnson',
            'method_id': 'GC-001',
            'method_name': 'GC Method A',
            'proficiency_level': 'Intermediate',
            'certification_date': '2020-03-20',
            'last_training': '2022-08-15',
            'can_train_others': False,
            'max_batch_size': 48
        },
        {
            'operator_id': 'OP-001',
            'operator_name': 'Alice Johnson',
            'method_id': 'MS-001',
            'method_name': 'Mass Spec Method A',
            'proficiency_level': 'Beginner',
            'certification_date': '2021-05-10',
            'last_training': '2023-03-05',
            'can_train_others': False,
            'max_batch_size': 24
        },
        {
            'operator_id': 'OP-002',
            'operator_name': 'Bob Smith',
            'method_id': 'HPLC-001',
            'method_name': 'HPLC Method A',
            'proficiency_level': 'Expert',
            'certification_date': '2019-04-01',
            'last_training': '2023-02-20',
            'can_train_others': True,
            'max_batch_size': 96
        },
        {
            'operator_id': 'OP-002',
            'operator_name': 'Bob Smith',
            'method_id': 'HPLC-002',
            'method_name': 'HPLC Method B',
            'proficiency_level': 'Expert',
            'certification_date': '2019-06-15',
            'last_training': '2023-01-15',
            'can_train_others': True,
            'max_batch_size': 48
        },
        {
            'operator_id': 'OP-002',
            'operator_name': 'Bob Smith',
            'method_id': 'GC-001',
            'method_name': 'GC Method A',
            'proficiency_level': 'Advanced',
            'certification_date': '2019-05-10',
            'last_training': '2022-11-30',
            'can_train_others': True,
            'max_batch_size': 48
        },
        {
            'operator_id': 'OP-002',
            'operator_name': 'Bob Smith',
            'method_id': 'ICP-001',
            'method_name': 'ICP-MS Method A',
            'proficiency_level': 'Intermediate',
            'certification_date': '2020-08-20',
            'last_training': '2023-02-10',
            'can_train_others': False,
            'max_batch_size': 72
        }
    ]
    return jsonify(skills)

@app.route('/api/admin/operator-holidays', methods=['GET'])
def api_admin_operator_holidays():
    """Get operator holidays for admin management"""
    holidays = [
        {
            'id': 'HOL-001',
            'operator_id': 'OP-001',
            'operator_name': 'Alice Johnson',
            'holiday_type': 'Vacation',
            'start_date': '2024-12-23',
            'end_date': '2024-12-27',
            'status': 'Approved',
            'requested_date': '2024-10-15',
            'approved_by': 'Manager A',
            'notes': 'Family vacation'
        },
        {
            'id': 'HOL-002',
            'operator_id': 'OP-001',
            'operator_name': 'Alice Johnson',
            'holiday_type': 'Sick Leave',
            'start_date': '2024-11-15',
            'end_date': '2024-11-15',
            'status': 'Approved',
            'requested_date': '2024-11-15',
            'approved_by': 'Manager A',
            'notes': 'Medical appointment'
        },
        {
            'id': 'HOL-003',
            'operator_id': 'OP-002',
            'operator_name': 'Bob Smith',
            'holiday_type': 'Vacation',
            'start_date': '2024-12-30',
            'end_date': '2025-01-03',
            'status': 'Approved',
            'requested_date': '2024-09-20',
            'approved_by': 'Manager B',
            'notes': 'New Year break'
        },
        {
            'id': 'HOL-004',
            'operator_id': 'OP-003',
            'operator_name': 'Carol Davis',
            'holiday_type': 'Personal',
            'start_date': '2024-11-28',
            'end_date': '2024-11-29',
            'status': 'Pending',
            'requested_date': '2024-11-20',
            'approved_by': None,
            'notes': 'Personal matters'
        },
        {
            'id': 'HOL-005',
            'operator_id': 'OP-004',
            'operator_name': 'David Wilson',
            'holiday_type': 'Training',
            'start_date': '2024-12-09',
            'end_date': '2024-12-13',
            'status': 'Approved',
            'requested_date': '2024-10-30',
            'approved_by': 'Manager C',
            'notes': 'Advanced HPLC training course'
        }
    ]
    return jsonify(holidays)

@app.route('/api/admin/method-instrument-matrix', methods=['POST'])
def api_admin_update_method_instrument():
    """Update method x instrument compatibility"""
    data = request.get_json()
    # In a real implementation, this would update the database
    return jsonify({'status': 'success', 'message': 'Method-Instrument matrix updated'})

@app.route('/api/admin/operator-skills', methods=['POST'])
def api_admin_update_operator_skills():
    """Update operator skills"""
    data = request.get_json()
    # In a real implementation, this would update the database
    return jsonify({'status': 'success', 'message': 'Operator skills updated'})

@app.route('/api/admin/operator-holidays', methods=['POST'])
def api_admin_update_operator_holidays():
    """Update operator holidays"""
    data = request.get_json()
    # In a real implementation, this would update the database
    return jsonify({'status': 'success', 'message': 'Operator holidays updated'})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8051)
