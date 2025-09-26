from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import mysql.connector
import bcrypt
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os
from database import db_manager
from fastapi import HTTPException

app = FastAPI(title="SIACOM API", version="1.0.0")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="siacom_db",
        port=3306
    )

# Pydantic models
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int

class PacienteBase(BaseModel):
    nombre: str
    apellido: str
    cedula: str
    fecha_nacimiento: str
    sexo: str
    telefono: Optional[str] = None
    eps: Optional[str] = None
    tipo_sangre: Optional[str] = None

class ContactoBase(BaseModel):
    nombre: str
    apellido: str
    relacion: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    es_contacto_principal: bool = False

class CirugiaBase(BaseModel):
    tipo_cirugia_id: int
    fecha_programada: str
    quirofano: Optional[str] = None
    notas_preoperatorias: Optional[str] = None

class SignosVitalesBase(BaseModel):
    presion_sistolica: Optional[int] = None
    presion_diastolica: Optional[int] = None
    frecuencia_cardiaca: Optional[int] = None
    temperatura: Optional[float] = None
    saturacion_oxigeno: Optional[int] = None
    dolor_escala: Optional[int] = None

class EvolucionClinicaBase(BaseModel):
    estado_general: str
    descripcion: str
    plan_tratamiento: Optional[str] = None
    observaciones: Optional[str] = None
    medico_id: int 

# Authentication functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Endpoints
@app.post("/login", response_model=Token)
def login(user_login: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM usuarios WHERE username = %s", (user_login.username,))
        user = cursor.fetchone()
        
        if not user or not pwd_context.verify(user_login.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(data={"sub": user["username"], "user_id": user["id"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": user["tipo_usuario"],
            "user_id": user["id"]
        }
    finally:
        cursor.close()
        conn.close()

@app.get("/pacientes")
def get_pacientes():
    conn = db_manager.get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error al conectar con la base de datos")
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT 
                id, nombre, apellido, cedula, fecha_nacimiento, sexo, 
                telefono, eps, tipo_sangre
            FROM pacientes
            WHERE activo = TRUE
            LIMIT 50
        """)
        pacientes = cursor.fetchall()
        return pacientes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la consulta: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/pacientes/{paciente_id}")
def get_paciente(paciente_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT p.*, 
                   COUNT(c.id) as total_cirugias,
                   MAX(c.fecha_programada) as ultima_cirugia
            FROM pacientes p
            LEFT JOIN cirugias c ON p.id = c.paciente_id
            WHERE p.id = %s
            GROUP BY p.id
        """, (paciente_id,))
        paciente = cursor.fetchone()
        
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        return paciente
    finally:
        cursor.close()
        conn.close()

@app.get("/cirugias/{paciente_id}")
def get_cirugias_paciente(paciente_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT c.*, tc.nombre as tipo_cirugia_nombre,
                   CONCAT(m.nombre, ' ', m.apellido) as medico_nombre
            FROM cirugias c
            JOIN tipos_cirugia tc ON c.tipo_cirugia_id = tc.id
            JOIN medicos m ON c.medico_principal_id = m.id
            WHERE c.paciente_id = %s
            ORDER BY c.fecha_programada DESC
        """, (paciente_id,))
        cirugias = cursor.fetchall()
        return cirugias
    finally:
        cursor.close()
        conn.close()

@app.put("/cirugias/{cirugia_id}/estado")
def actualizar_estado_cirugia(cirugia_id: int, estado: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Actualizar estado
        cursor.execute("""
            UPDATE cirugias 
            SET estado = %s, 
                fecha_inicio = CASE WHEN %s = 'En_proceso' THEN NOW() ELSE fecha_inicio END,
                fecha_fin = CASE WHEN %s = 'Finalizada' THEN NOW() ELSE fecha_fin END
            WHERE id = %s
        """, (estado, estado, estado, cirugia_id))
        
        # Notificar a contactos
        cursor.execute("""
            INSERT INTO notificaciones (contacto_id, paciente_id, cirugia_id, tipo, titulo, mensaje)
            SELECT c.id, ci.paciente_id, ci.id, 'cambio_estado',
                   CONCAT('Cambio de estado en cirugía'),
                   CONCAT('La cirugía ha cambiado a estado: ', %s)
            FROM contactos c
            JOIN cirugias ci ON c.paciente_id = ci.paciente_id
            WHERE ci.id = %s AND c.notificaciones_activas = TRUE
        """, (estado, cirugia_id))
        
        conn.commit()
        return {"message": "Estado actualizado correctamente"}
    finally:
        cursor.close()
        conn.close()

@app.get("/contactos")
def get_contactos(limit: int = 50, offset: int = 0):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT * FROM contactos
            ORDER BY id ASC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        contactos = cursor.fetchall()
        return contactos
    finally:
        cursor.close()
        conn.close()


@app.get("/signos-vitales/{paciente_id}")
def get_signos_vitales(paciente_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT * FROM signos_vitales 
            WHERE paciente_id = %s
            ORDER BY fecha_registro DESC
            LIMIT 20
        """, (paciente_id,))
        signos = cursor.fetchall()
        return signos
    finally:
        cursor.close()
        conn.close()

@app.post("/signos-vitales/{paciente_id}")
def crear_signos_vitales(paciente_id: int, signos: SignosVitalesBase):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO signos_vitales 
            (paciente_id, fecha_registro, presion_sistolica, presion_diastolica, 
             frecuencia_cardiaca, temperatura, saturacion_oxigeno, dolor_escala, registrado_por_medico_id)
            VALUES (%s, NOW(), %s, %s, %s, %s, %s, %s, %s)
        """, (
            paciente_id, signos.presion_sistolica, signos.presion_diastolica,
            signos.frecuencia_cardiaca, signos.temperatura, signos.saturacion_oxigeno,
            signos.dolor_escala, None
        ))
        conn.commit()
        return {"message": "Signos vitales registrados correctamente"}
    finally:
        cursor.close()
        conn.close()

@app.get("/evoluciones/{paciente_id}")
def get_evoluciones(paciente_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT e.*, CONCAT(m.nombre, ' ', m.apellido) as medico_nombre
            FROM evoluciones_clinicas e
            JOIN medicos m ON e.medico_id = m.id
            WHERE e.paciente_id = %s
            ORDER BY e.fecha_registro DESC
            LIMIT 10
        """, (paciente_id,))
        evoluciones = cursor.fetchall()
        return evoluciones
    finally:
        cursor.close()
        conn.close()

@app.post("/evoluciones/{paciente_id}")
def crear_evolucion(paciente_id: int, evolucion: EvolucionClinicaBase):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO evoluciones_clinicas 
            (paciente_id, fecha_registro, estado_general, descripcion, plan_tratamiento, observaciones_familiares, medico_id)
            VALUES (%s, NOW(), %s, %s, %s, %s, %s)
        """, (
            paciente_id,
            evolucion.estado_general,
            evolucion.descripcion,
            evolucion.plan_tratamiento,
            evolucion.observaciones,
            evolucion.medico_id
        ))
        conn.commit()
        return {"message": "Evolución clínica registrada correctamente"}
    finally:
        cursor.close()
        conn.close()


@app.get("/dashboard/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        stats = {}
        
        # Total pacientes
        cursor.execute("SELECT COUNT(*) as total FROM pacientes WHERE activo = TRUE")
        stats['total_pacientes'] = cursor.fetchone()['total']
        
        # Cirugías hoy
        cursor.execute("""
            SELECT COUNT(*) as total FROM cirugias 
            WHERE DATE(fecha_programada) = CURDATE()
        """)
        stats['cirugias_hoy'] = cursor.fetchone()['total']
        
        # Cirugías en proceso
        cursor.execute("""
            SELECT COUNT(*) as total FROM cirugias 
            WHERE estado IN ('Pre-operatorio', 'En_proceso')
        """)
        stats['cirugias_activas'] = cursor.fetchone()['total']
        
        # Pacientes críticos
        cursor.execute("""
            SELECT COUNT(DISTINCT paciente_id) as total 
            FROM evoluciones_clinicas 
            WHERE estado_general = 'Crítico' 
            AND fecha_registro > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        """)
        stats['pacientes_criticos'] = cursor.fetchone()['total']
        
        return stats
    finally:
        cursor.close()
        conn.close()

@app.get("/test-db")
def test_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT NOW() as fecha")
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return {"conexion_exitosa": True, "resultado": result}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)