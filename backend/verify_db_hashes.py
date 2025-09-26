# verify_db_hashes.py
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

conn = mysql.connector.connect(**DB)
cur = conn.cursor()
cur.execute("SELECT id, username, password_hash FROM usuarios")
rows = cur.fetchall()
for r in rows:
    uid, username, phash = r
    ok = False
    try:
        ok = pwd_context.verify("password123", phash)
    except Exception as e:
        print("ERROR verify:", username, e)
    print(uid, username, " -> verify password123:", ok)
cur.close()
conn.close()
