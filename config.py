"""
Configuration settings for Lab Capacity Model
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Database settings
    DB_SERVER = os.getenv('DB_SERVER', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'LabCapacity')
    DB_USERNAME = os.getenv('DB_USERNAME', '')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    
    # Connection string for SQL Server
    DB_CONNECTION_STRING = (
        f"mssql+pyodbc://{DB_USERNAME}:{DB_PASSWORD}@{DB_SERVER}/{DB_NAME}"
        f"?driver=ODBC+Driver+17+for+SQL+Server"
    )
    
    # App settings
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8050))
    
    # Refresh intervals (in milliseconds)
    DASHBOARD_REFRESH_INTERVAL = int(os.getenv('DASHBOARD_REFRESH_INTERVAL', 30000))  # 30 seconds
    
    # UI settings
    ITEMS_PER_PAGE = int(os.getenv('ITEMS_PER_PAGE', 10))
    
    # File paths
    ASSETS_PATH = os.getenv('ASSETS_PATH', 'assets')
    
    @classmethod
    def get_db_connection_string(cls):
        """Get database connection string"""
        if cls.DB_USERNAME and cls.DB_PASSWORD:
            return cls.DB_CONNECTION_STRING
        else:
            # Use Windows Authentication if no username/password provided
            return (
                f"mssql+pyodbc://{cls.DB_SERVER}/{cls.DB_NAME}"
                f"?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
            )
