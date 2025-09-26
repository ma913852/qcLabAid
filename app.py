"""
Lab Capacity Model - Dash Frontend Application
Rapid MVP for 2-3 month delivery
"""

import dash
from dash import dcc, html, Input, Output, callback, dash_table, State
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, date
import sqlite3
import os

# Initialize the Dash app
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
app.title = "Lab Capacity Model"

# Sample data for MVP (replace with SQL Server connection later)
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

# Color scheme
colors = {
    'primary': '#1f77b4',
    'secondary': '#ff7f0e', 
    'success': '#2ca02c',
    'danger': '#d62728',
    'warning': '#ff7f0e',
    'info': '#17a2b8',
    'light': '#f8f9fa',
    'dark': '#343a40'
}

# Header component
header = dbc.Navbar(
    dbc.Container([
        dbc.Row([
            dbc.Col([
                html.Img(src="/assets/lab-icon.png", height="30px", className="me-2") if os.path.exists("/assets/lab-icon.png") else None,
                dbc.NavbarBrand("Laboratory Capacity Model", className="ms-2", style={"font-weight": "bold"})
            ], width="auto"),
            dbc.Col([
                dbc.Nav([
                    dbc.NavItem(dbc.NavLink("Dashboard", href="#dashboard", id="nav-dashboard")),
                    dbc.NavItem(dbc.NavLink("Schedule", href="#schedule", id="nav-schedule")),
                    dbc.NavItem(dbc.NavLink("Resources", href="#resources", id="nav-resources")),
                    dbc.NavItem(dbc.NavLink("Reports", href="#reports", id="nav-reports")),
                ], navbar=True)
            ])
        ], className="w-100 justify-content-between")
    ], fluid=True),
    color="dark",
    dark=True,
    className="mb-4"
)

# KPI Cards component
def create_kpi_cards():
    total_personnel = len(df_personnel)
    available_personnel = len(df_personnel[df_personnel['status'] == 'Available'])
    avg_personnel_util = df_personnel['utilization'].mean()
    
    total_instruments = len(df_instruments)
    available_instruments = len(df_instruments[df_instruments['status'] == 'Available'])
    avg_instrument_util = df_instruments['utilization'].mean()
    
    active_projects = len(df_projects[df_projects['status'] == 'Active'])
    
    cards = dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4(f"{available_personnel}/{total_personnel}", className="card-title text-primary"),
                    html.P("Personnel Available", className="card-text"),
                    html.Small(f"Avg Utilization: {avg_personnel_util:.1f}%", className="text-muted")
                ])
            ], className="text-center")
        ], width=3),
        
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4(f"{available_instruments}/{total_instruments}", className="card-title text-success"),
                    html.P("Instruments Available", className="card-text"),
                    html.Small(f"Avg Utilization: {avg_instrument_util:.1f}%", className="text-muted")
                ])
            ], className="text-center")
        ], width=3),
        
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4(f"{active_projects}", className="card-title text-warning"),
                    html.P("Active Projects", className="card-text"),
                    html.Small(f"Total Projects: {len(df_projects)}", className="text-muted")
                ])
            ], className="text-center")
        ], width=3),
        
        dbc.Col([
            dbc.Card([
                dbc.CardBody([
                    html.H4("78%", className="card-title text-info"),
                    html.P("Overall Capacity", className="card-text"),
                    html.Small("Lab-wide utilization", className="text-muted")
                ])
            ], className="text-center")
        ], width=3),
    ], className="mb-4")
    
    return cards

# Dashboard tab content
dashboard_content = html.Div([
    create_kpi_cards(),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Personnel Utilization", className="mb-0")),
                dbc.CardBody([
                    dcc.Graph(id="personnel-utilization-chart")
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Instrument Status", className="mb-0")),
                dbc.CardBody([
                    dcc.Graph(id="instrument-status-chart")
                ])
            ])
        ], width=6),
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Capacity Timeline", className="mb-0")),
                dbc.CardBody([
                    dcc.Graph(id="capacity-timeline-chart")
                ])
            ])
        ], width=12),
    ])
])

# Schedule tab content
schedule_content = html.Div([
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    dbc.Row([
                        dbc.Col(html.H5("Resource Schedule", className="mb-0"), width="auto"),
                        dbc.Col([
                            dcc.DatePickerSingle(
                                id='schedule-date-picker',
                                date=date.today(),
                                display_format='YYYY-MM-DD'
                            )
                        ], width="auto"),
                        dbc.Col([
                            dbc.Button("Add Task", color="primary", size="sm", id="add-task-btn")
                        ], width="auto")
                    ], justify="between", align="center")
                ]),
                dbc.CardBody([
                    dcc.Graph(id="schedule-gantt-chart", style={"height": "500px"})
                ])
            ])
        ], width=12)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Today's Assignments", className="mb-0")),
                dbc.CardBody([
                    dash_table.DataTable(
                        id="assignments-table",
                        columns=[
                            {"name": "Time", "id": "time"},
                            {"name": "Personnel", "id": "personnel"},
                            {"name": "Instrument", "id": "instrument"},
                            {"name": "Task", "id": "task"},
                            {"name": "Status", "id": "status"}
                        ],
                        data=[
                            {"time": "09:00-12:00", "personnel": "Alice Johnson", "instrument": "HPLC-01", "task": "Method Validation", "status": "In Progress"},
                            {"time": "10:00-14:00", "personnel": "Bob Smith", "instrument": "LCMS-02", "task": "Stability Analysis", "status": "Scheduled"},
                            {"time": "13:00-17:00", "personnel": "Carol Davis", "instrument": "HPLC-04", "task": "Release Testing", "status": "Scheduled"},
                            {"time": "14:00-16:00", "personnel": "David Wilson", "instrument": "NMR-01", "task": "Structure Confirmation", "status": "Scheduled"}
                        ],
                        style_cell={'textAlign': 'left'},
                        style_data_conditional=[
                            {
                                'if': {'filter_query': '{status} = "In Progress"'},
                                'backgroundColor': '#d4edda',
                                'color': 'black',
                            },
                            {
                                'if': {'filter_query': '{status} = "Scheduled"'},
                                'backgroundColor': '#fff3cd',
                                'color': 'black',
                            }
                        ]
                    )
                ])
            ])
        ], width=12)
    ])
])

# Resources tab content
resources_content = html.Div([
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Personnel", className="mb-0")),
                dbc.CardBody([
                    dash_table.DataTable(
                        id="personnel-table",
                        columns=[
                            {"name": "Name", "id": "name"},
                            {"name": "Role", "id": "role"},
                            {"name": "Department", "id": "department"},
                            {"name": "Status", "id": "status"},
                            {"name": "Utilization %", "id": "utilization", "type": "numeric", "format": {"specifier": ".0f"}}
                        ],
                        data=df_personnel.to_dict('records'),
                        sort_action="native",
                        filter_action="native",
                        page_size=10,
                        style_cell={'textAlign': 'left'},
                        style_data_conditional=[
                            {
                                'if': {'filter_query': '{status} = "Available"'},
                                'backgroundColor': '#d4edda',
                                'color': 'black',
                            },
                            {
                                'if': {'filter_query': '{status} = "Busy"'},
                                'backgroundColor': '#fff3cd',
                                'color': 'black',
                            },
                            {
                                'if': {'filter_query': '{status} = "On Leave"'},
                                'backgroundColor': '#f8d7da',
                                'color': 'black',
                            }
                        ]
                    )
                ])
            ])
        ], width=6),
        
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Instruments", className="mb-0")),
                dbc.CardBody([
                    dash_table.DataTable(
                        id="instruments-table",
                        columns=[
                            {"name": "Name", "id": "name"},
                            {"name": "Type", "id": "type"},
                            {"name": "Location", "id": "location"},
                            {"name": "Status", "id": "status"},
                            {"name": "Utilization %", "id": "utilization", "type": "numeric", "format": {"specifier": ".0f"}}
                        ],
                        data=df_instruments.to_dict('records'),
                        sort_action="native",
                        filter_action="native",
                        page_size=10,
                        style_cell={'textAlign': 'left'},
                        style_data_conditional=[
                            {
                                'if': {'filter_query': '{status} = "Available"'},
                                'backgroundColor': '#d4edda',
                                'color': 'black',
                            },
                            {
                                'if': {'filter_query': '{status} = "In Use"'},
                                'backgroundColor': '#fff3cd',
                                'color': 'black',
                            },
                            {
                                'if': {'filter_query': '{status} = "Maintenance"'},
                                'backgroundColor': '#f8d7da',
                                'color': 'black',
                            }
                        ]
                    )
                ])
            ])
        ], width=6),
    ])
])

# Reports tab content
reports_content = html.Div([
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader([
                    dbc.Row([
                        dbc.Col(html.H5("Utilization Reports", className="mb-0"), width="auto"),
                        dbc.Col([
                            dbc.Button("Export Excel", color="success", size="sm", id="export-excel-btn")
                        ], width="auto")
                    ], justify="between", align="center")
                ]),
                dbc.CardBody([
                    dcc.Graph(id="utilization-trend-chart")
                ])
            ])
        ], width=12)
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader(html.H5("Project Status", className="mb-0")),
                dbc.CardBody([
                    dash_table.DataTable(
                        id="projects-table",
                        columns=[
                            {"name": "Project", "id": "name"},
                            {"name": "Status", "id": "status"},
                            {"name": "Priority", "id": "priority"},
                            {"name": "Progress %", "id": "progress", "type": "numeric", "format": {"specifier": ".0f"}},
                            {"name": "Due Date", "id": "due_date"}
                        ],
                        data=df_projects.to_dict('records'),
                        sort_action="native",
                        filter_action="native",
                        style_cell={'textAlign': 'left'},
                        style_data_conditional=[
                            {
                                'if': {'filter_query': '{priority} = "Critical"'},
                                'backgroundColor': '#f8d7da',
                                'color': 'black',
                            },
                            {
                                'if': {'filter_query': '{priority} = "High"'},
                                'backgroundColor': '#fff3cd',
                                'color': 'black',
                            }
                        ]
                    )
                ])
            ])
        ], width=12)
    ])
])

# Main app layout
app.layout = dbc.Container([
    header,
    
    # Navigation tabs
    dbc.Tabs(
        id="main-tabs",
        active_tab="dashboard",
        children=[
            dbc.Tab(label="Dashboard", tab_id="dashboard"),
            dbc.Tab(label="Schedule", tab_id="schedule"),
            dbc.Tab(label="Resources", tab_id="resources"),
            dbc.Tab(label="Reports", tab_id="reports"),
        ],
        className="mb-4"
    ),
    
    # Tab content
    html.Div(id="tab-content"),
    
    # Interval component for real-time updates
    dcc.Interval(
        id='interval-component',
        interval=30*1000,  # Update every 30 seconds
        n_intervals=0
    )
], fluid=True)

# Callbacks for tab switching
@app.callback(
    Output("tab-content", "children"),
    Input("main-tabs", "active_tab")
)
def switch_tab(active_tab):
    if active_tab == "dashboard":
        return dashboard_content
    elif active_tab == "schedule":
        return schedule_content
    elif active_tab == "resources":
        return resources_content
    elif active_tab == "reports":
        return reports_content
    return dashboard_content

# Callback for personnel utilization chart
@app.callback(
    Output("personnel-utilization-chart", "figure"),
    Input("interval-component", "n_intervals")
)
def update_personnel_chart(n):
    fig = px.bar(
        df_personnel, 
        x="name", 
        y="utilization",
        color="role",
        title="Personnel Utilization by Role",
        labels={"utilization": "Utilization %", "name": "Personnel"}
    )
    fig.update_layout(xaxis_tickangle=-45, height=350)
    fig.add_hline(y=80, line_dash="dash", line_color="red", 
                  annotation_text="Target: 80%")
    return fig

# Callback for instrument status chart
@app.callback(
    Output("instrument-status-chart", "figure"),
    Input("interval-component", "n_intervals")
)
def update_instrument_chart(n):
    status_counts = df_instruments['status'].value_counts()
    fig = px.pie(
        values=status_counts.values,
        names=status_counts.index,
        title="Instrument Status Distribution",
        color_discrete_map={
            'Available': '#28a745',
            'In Use': '#ffc107', 
            'Maintenance': '#dc3545'
        }
    )
    fig.update_layout(height=350)
    return fig

# Callback for capacity timeline
@app.callback(
    Output("capacity-timeline-chart", "figure"),
    Input("interval-component", "n_intervals")
)
def update_capacity_timeline(n):
    # Generate sample timeline data
    dates = pd.date_range(start=datetime.now(), periods=14, freq='D')
    personnel_capacity = np.random.randint(70, 95, 14)
    instrument_capacity = np.random.randint(60, 90, 14)
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=dates, y=personnel_capacity,
        mode='lines+markers',
        name='Personnel Capacity',
        line=dict(color='#1f77b4')
    ))
    fig.add_trace(go.Scatter(
        x=dates, y=instrument_capacity,
        mode='lines+markers',
        name='Instrument Capacity',
        line=dict(color='#ff7f0e')
    ))
    
    fig.update_layout(
        title="2-Week Capacity Forecast",
        xaxis_title="Date",
        yaxis_title="Capacity %",
        height=300,
        hovermode='x unified'
    )
    fig.add_hline(y=85, line_dash="dash", line_color="red", 
                  annotation_text="Capacity Limit: 85%")
    return fig

# Callback for schedule Gantt chart
@app.callback(
    Output("schedule-gantt-chart", "figure"),
    Input("schedule-date-picker", "date")
)
def update_schedule_gantt(selected_date):
    # Sample Gantt chart data
    tasks_data = {
        'Task': ['Method Validation A', 'Stability Study B', 'Release Testing C', 
                'Impurity Analysis D', 'Cleaning Validation E'],
        'Start': ['2024-01-25 09:00', '2024-01-25 10:00', '2024-01-25 13:00',
                 '2024-01-25 14:00', '2024-01-25 15:00'],
        'Finish': ['2024-01-25 12:00', '2024-01-25 14:00', '2024-01-25 17:00',
                  '2024-01-25 16:00', '2024-01-25 17:00'],
        'Resource': ['Alice (HPLC-01)', 'Bob (LCMS-02)', 'Carol (HPLC-04)',
                    'David (NMR-01)', 'Emma (DSC-01)']
    }
    
    df_gantt = pd.DataFrame(tasks_data)
    df_gantt['Start'] = pd.to_datetime(df_gantt['Start'])
    df_gantt['Finish'] = pd.to_datetime(df_gantt['Finish'])
    
    fig = px.timeline(
        df_gantt, 
        x_start="Start", 
        x_end="Finish", 
        y="Resource",
        color="Task",
        title=f"Resource Schedule for {selected_date}"
    )
    fig.update_yaxes(autorange="reversed")
    fig.update_layout(height=400)
    return fig

# Callback for utilization trend chart
@app.callback(
    Output("utilization-trend-chart", "figure"),
    Input("interval-component", "n_intervals")
)
def update_utilization_trend(n):
    # Generate sample trend data
    dates = pd.date_range(start=datetime.now() - timedelta(days=30), periods=30, freq='D')
    personnel_util = np.random.randint(70, 95, 30)
    instrument_util = np.random.randint(60, 90, 30)
    
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    
    fig.add_trace(
        go.Scatter(x=dates, y=personnel_util, name="Personnel Utilization", 
                  line=dict(color='#1f77b4')),
        secondary_y=False,
    )
    
    fig.add_trace(
        go.Scatter(x=dates, y=instrument_util, name="Instrument Utilization",
                  line=dict(color='#ff7f0e')),
        secondary_y=False,
    )
    
    fig.update_layout(
        title="30-Day Utilization Trend",
        height=400
    )
    fig.update_yaxes(title_text="Utilization %", secondary_y=False)
    
    return fig

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8050)
