"""
Database models and operations for Lab Capacity Model
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from datetime import datetime
import pandas as pd
from config import Config

# Database setup
Base = declarative_base()
engine = create_engine(Config.get_db_connection_string())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database Models

class Personnel(Base):
    """Personnel/Staff table"""
    __tablename__ = "personnel"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255))
    role = Column(String(50))
    department = Column(String(100))
    hire_date = Column(DateTime)
    status = Column(String(20), default="Active")  # Active, Inactive, On_Leave
    fte_percentage = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="assigned_personnel")
    availability = relationship("PersonnelAvailability", back_populates="personnel")

class Instrument(Base):
    """Instruments/Equipment table"""
    __tablename__ = "instruments"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    instrument_type = Column(String(50))
    model = Column(String(100))
    manufacturer = Column(String(100))
    location = Column(String(100))
    status = Column(String(20), default="Available")  # Available, In_Use, Maintenance, Out_of_Service
    installation_date = Column(DateTime)
    last_maintenance = Column(DateTime)
    next_maintenance = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="assigned_instrument")
    schedules = relationship("InstrumentSchedule", back_populates="instrument")

class Project(Base):
    """Projects table"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(50), unique=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    client = Column(String(100))
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    start_date = Column(DateTime)
    due_date = Column(DateTime)
    status = Column(String(20), default="Planning")  # Planning, Active, On_Hold, Completed, Cancelled
    project_manager_id = Column(Integer, ForeignKey("personnel.id"))
    estimated_hours = Column(Integer)
    actual_hours = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="project")
    project_manager = relationship("Personnel")

class Task(Base):
    """Tasks table"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String(200), nullable=False)
    description = Column(Text)
    estimated_duration = Column(Integer)  # in minutes
    actual_duration = Column(Integer)
    status = Column(String(20), default="Not_Started")  # Not_Started, In_Progress, Completed, Blocked
    priority = Column(String(20), default="Medium")
    assigned_personnel_id = Column(Integer, ForeignKey("personnel.id"))
    assigned_instrument_id = Column(Integer, ForeignKey("instruments.id"))
    scheduled_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    actual_start = Column(DateTime)
    actual_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_personnel = relationship("Personnel", back_populates="tasks")
    assigned_instrument = relationship("Instrument", back_populates="tasks")

class PersonnelAvailability(Base):
    """Personnel availability tracking"""
    __tablename__ = "personnel_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    personnel_id = Column(Integer, ForeignKey("personnel.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    availability_type = Column(String(20), nullable=False)  # Available, Vacation, Training, Meeting, Sick
    notes = Column(Text)
    
    # Relationships
    personnel = relationship("Personnel", back_populates="availability")

class InstrumentSchedule(Base):
    """Instrument scheduling table"""
    __tablename__ = "instrument_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(20), default="Scheduled")  # Scheduled, In_Progress, Completed, Cancelled
    setup_time = Column(Integer, default=0)  # in minutes
    cleanup_time = Column(Integer, default=0)  # in minutes
    
    # Relationships
    instrument = relationship("Instrument", back_populates="schedules")
    task = relationship("Task")

class CapacityMetric(Base):
    """Capacity metrics for reporting"""
    __tablename__ = "capacity_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    resource_type = Column(String(20), nullable=False)  # Personnel, Instrument
    resource_id = Column(Integer, nullable=False)
    planned_hours = Column(Float)
    actual_hours = Column(Float)
    utilization_rate = Column(Float)
    efficiency_rate = Column(Float)
    downtime_hours = Column(Float, default=0)
    overtime_hours = Column(Float, default=0)

# Database operations

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

def init_sample_data():
    """Initialize with sample data for MVP"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Personnel).first():
            return
        
        # Add sample personnel
        personnel_data = [
            Personnel(employee_id="EMP001", name="Alice Johnson", email="alice@lab.com", role="Senior Scientist", department="Analytical"),
            Personnel(employee_id="EMP002", name="Bob Smith", email="bob@lab.com", role="Associate Scientist", department="Analytical"),
            Personnel(employee_id="EMP003", name="Carol Davis", email="carol@lab.com", role="Technician", department="Analytical"),
            Personnel(employee_id="EMP004", name="David Wilson", email="david@lab.com", role="Senior Scientist", department="QC"),
            Personnel(employee_id="EMP005", name="Emma Brown", email="emma@lab.com", role="Associate Scientist", department="QC"),
        ]
        
        # Add sample instruments
        instruments_data = [
            Instrument(asset_tag="HPLC-01", name="HPLC System 1", instrument_type="HPLC", location="Lab A", status="Available"),
            Instrument(asset_tag="LCMS-02", name="LC-MS System 2", instrument_type="LC-MS", location="Lab A", status="Available"),
            Instrument(asset_tag="GC-03", name="GC System 3", instrument_type="GC", location="Lab B", status="Available"),
            Instrument(asset_tag="NMR-01", name="NMR System 1", instrument_type="NMR", location="Lab C", status="Available"),
            Instrument(asset_tag="DSC-01", name="DSC System 1", instrument_type="DSC", location="Lab C", status="Available"),
        ]
        
        # Add sample projects
        projects_data = [
            Project(project_code="PRJ001", name="Method Validation A", description="HPLC method validation", priority="High"),
            Project(project_code="PRJ002", name="Stability Study B", description="Accelerated stability study", priority="Medium"),
            Project(project_code="PRJ003", name="Release Testing C", description="Product release testing", priority="Critical"),
        ]
        
        # Add to database
        for item in personnel_data + instruments_data + projects_data:
            db.add(item)
        
        db.commit()
        print("Sample data initialized successfully")
        
    except Exception as e:
        print(f"Error initializing sample data: {e}")
        db.rollback()
    finally:
        db.close()

# Data access functions

def get_personnel_utilization():
    """Get personnel utilization data"""
    db = SessionLocal()
    try:
        # This is a simplified calculation - in production, you'd calculate based on actual scheduling data
        personnel = db.query(Personnel).all()
        data = []
        for person in personnel:
            # Mock utilization calculation
            utilization = hash(person.name) % 40 + 60  # Random between 60-100
            data.append({
                'id': person.id,
                'name': person.name,
                'role': person.role,
                'department': person.department,
                'status': person.status,
                'utilization': utilization
            })
        return pd.DataFrame(data)
    finally:
        db.close()

def get_instrument_status():
    """Get instrument status data"""
    db = SessionLocal()
    try:
        instruments = db.query(Instrument).all()
        data = []
        for instrument in instruments:
            # Mock utilization calculation
            utilization = hash(instrument.name) % 30 + 50 if instrument.status == "Available" else 0
            data.append({
                'id': instrument.id,
                'name': instrument.name,
                'type': instrument.instrument_type,
                'location': instrument.location,
                'status': instrument.status,
                'utilization': utilization
            })
        return pd.DataFrame(data)
    finally:
        db.close()

def get_project_data():
    """Get project data"""
    db = SessionLocal()
    try:
        projects = db.query(Project).all()
        data = []
        for project in projects:
            # Mock progress calculation
            progress = hash(project.name) % 80 + 10  # Random between 10-90
            data.append({
                'id': project.id,
                'name': project.name,
                'status': project.status,
                'priority': project.priority,
                'progress': progress,
                'due_date': project.due_date.strftime('%Y-%m-%d') if project.due_date else None
            })
        return pd.DataFrame(data)
    finally:
        db.close()

if __name__ == "__main__":
    # Initialize database
    create_tables()
    init_sample_data()
    print("Database initialized!")
