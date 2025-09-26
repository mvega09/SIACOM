# ================================================
# INSTRUCCIONES DE INSTALACIÓN
# ================================================

# README.md
# SIACOM - Sistema Integral de Acompañamiento Hospitalario

## Descripción
SIACOM es una aplicación móvil diseñada para proporcionar información en tiempo real a familiares y pacientes durante procedimientos quirúrgicos, facilitando el seguimiento del estado del paciente y la comunicación con el equipo médico.

## Características Principales
- **Gestión de Pacientes**: Registro y consulta de información básica
- **Gestión Transoperatoria**: Seguimiento en tiempo real de cirugías
- **Gestión de Contactos**: Información de familiares con notificaciones
- **Evolución Clínica**: Seguimiento postoperatorio y signos vitales

## Tecnologías Utilizadas
- **Backend**: Python + FastAPI + MySQL
- **Frontend**: React Native + Expo
- **Base de Datos**: MySQL 8.0+
- **Autenticación**: JWT

## Requisitos Previos
- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Expo CLI
- Git

## Instalación y Configuración

### 1. Clonar el Proyecto
```bash
git clone <repository-url>
cd siacom-project
```

### 2. Configurar Base de Datos
```bash
# Iniciar MySQL
mysql -u root -p

# Ejecutar el script de base de datos
source database/siacom_database.sql
```

### 3. Configurar Backend
```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
#python -m venv venv
python3.12 -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

#post instalar las dependencias ejecutar la secuencia de los siguientes comandos, lo que hace es mostrar las contraseñas hasheadas de los usuarios
python verify_db_hashes.py
python rehash_passwords.py
python verify_db_hashes.py

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones de base de datos
```

### 4. Configurar Frontend
```bash
# Navegar al directorio frontend

cd frontend

# Instalar dependencias
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer

### 5. Ejecutar la Aplicación
npm run dev


#### Backend
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend
```bash
cd frontend
# Para desarrollo web
npm run dev

### Variables de Entorno (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=siacom_db
DB_PORT=3306