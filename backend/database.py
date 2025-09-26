import mysql.connector
from mysql.connector import Error
import os
from typing import Optional

class DatabaseManager:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.database = os.getenv('DB_NAME', 'siacom_db')
        self.port = os.getenv('DB_PORT', 3306)
    
    def get_connection(self):
        try:
            connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                charset='utf8mb4'
            )
            return connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None

db_manager = DatabaseManager()