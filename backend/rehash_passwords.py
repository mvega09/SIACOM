from passlib.context import CryptContext
import mysql.connector

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "siacom_db",
    "port": 3306
}

usuarios = [
    ("dr.martinez", "password123"),
    ("dr.rodriguez", "password123"),
    ("dr.garcia", "password123"),
    ("familia.gonzalez", "password123"),
    ("admin", "password123"),
]

conn = mysql.connector.connect(**DB)
cur = conn.cursor()

for username, plain in usuarios:
    hash_pwd = pwd_context.hash(plain)
    cur.execute("UPDATE usuarios SET password_hash=%s WHERE username=%s", (hash_pwd, username))
    print(f"{username} actualizado -> {hash_pwd}")

conn.commit()
cur.close()
conn.close()
print("Contraseñas actualizadas correctamente ✅")
