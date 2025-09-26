-- Script de Base de Datos SIACOM
-- Sistema Integral de Acompañamiento Hospitalario para Pacientes y Familiares

DROP DATABASE IF EXISTS siacom_db;
CREATE DATABASE siacom_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siacom_db;

-- Tabla de Usuarios del Sistema
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    tipo_usuario ENUM('medico', 'familiar', 'administrador') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Especialidades Médicas
CREATE TABLE especialidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Médicos Especialistas
CREATE TABLE medicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    especialidad_id INT NOT NULL,
    telefono VARCHAR(20),
    registro_medico VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

-- Tabla de Pacientes
CREATE TABLE pacientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('M', 'F', 'Otro') NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    eps VARCHAR(100),
    tipo_sangre VARCHAR(5),
    alergias TEXT,
    enfermedades_previas TEXT,
    medicamentos_actuales TEXT,
    contacto_emergencia VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Contactos/Familiares
CREATE TABLE contactos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    usuario_id INT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    relacion VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    es_contacto_principal BOOLEAN DEFAULT FALSE,
    notificaciones_activas BOOLEAN DEFAULT TRUE,
    puede_recibir_info_medica BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de Tipos de Cirugía
CREATE TABLE tipos_cirugia (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_estimada_minutos INT,
    complejidad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media'
);

-- Tabla de Gestión Transoperatoria (Cirugías)
CREATE TABLE cirugias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    medico_principal_id INT NOT NULL,
    tipo_cirugia_id INT NOT NULL,
    fecha_programada DATETIME NOT NULL,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    estado ENUM('Programada', 'Pre-operatorio', 'En_proceso', 'Post-operatorio', 'Finalizada', 'Cancelada') DEFAULT 'Programada',
    quirofano VARCHAR(20),
    notas_preoperatorias TEXT,
    notas_transoperatorias TEXT,
    notas_postoperatorias TEXT,
    complicaciones TEXT,
    resultado ENUM('Exitosa', 'Complicaciones_menores', 'Complicaciones_mayores') NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_principal_id) REFERENCES medicos(id),
    FOREIGN KEY (tipo_cirugia_id) REFERENCES tipos_cirugia(id)
);

-- Tabla de Signos Vitales
CREATE TABLE signos_vitales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    cirugia_id INT,
    fecha_registro DATETIME NOT NULL,
    presion_sistolica INT,
    presion_diastolica INT,
    frecuencia_cardiaca INT,
    temperatura DECIMAL(4,2),
    saturacion_oxigeno INT,
    frecuencia_respiratoria INT,
    dolor_escala INT CHECK (dolor_escala >= 0 AND dolor_escala <= 10),
    observaciones TEXT,
    registrado_por_medico_id INT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (cirugia_id) REFERENCES cirugias(id) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por_medico_id) REFERENCES medicos(id)
);

-- Tabla de Evolución Clínica
CREATE TABLE evoluciones_clinicas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    cirugia_id INT,
    fecha_registro DATETIME NOT NULL,
    estado_general ENUM('Estable', 'Mejorado', 'Regular', 'Crítico') NOT NULL,
    descripcion TEXT NOT NULL,
    plan_tratamiento TEXT,
    medicamentos TEXT,
    restricciones TEXT,
    observaciones_familiares TEXT,
    proxima_evaluacion DATETIME,
    medico_id INT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (cirugia_id) REFERENCES cirugias(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES medicos(id)
);

-- Tabla de Notificaciones
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contacto_id INT NOT NULL,
    paciente_id INT NOT NULL,
    cirugia_id INT,
    tipo ENUM('info_general', 'cambio_estado', 'complicacion', 'alta_medica') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (cirugia_id) REFERENCES cirugias(id) ON DELETE CASCADE
);

-- Tabla de Auditoría
CREATE TABLE auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tabla_afectada VARCHAR(50) NOT NULL,
    id_registro INT NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    usuario_id INT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSON,
    datos_nuevos JSON,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ÍNDICES para mejorar el rendimiento
CREATE INDEX idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX idx_cirugias_fecha ON cirugias(fecha_programada);
CREATE INDEX idx_cirugias_estado ON cirugias(estado);
CREATE INDEX idx_signos_vitales_fecha ON signos_vitales(fecha_registro);
CREATE INDEX idx_evoluciones_fecha ON evoluciones_clinicas(fecha_registro);
CREATE INDEX idx_notificaciones_contacto ON notificaciones(contacto_id);

-- INSERCIÓN DE DATOS DE PRUEBA

-- Especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
('Cirugía General', 'Especialidad médica quirúrgica general'),
('Cardiología', 'Especialidad del corazón y sistema cardiovascular'),
('Neurología', 'Especialidad del sistema nervioso'),
('Ortopedia', 'Especialidad de huesos y articulaciones'),
('Anestesiología', 'Especialidad de anestesia y cuidados perioperatorios');

-- Tipos de Cirugía
INSERT INTO tipos_cirugia (nombre, descripcion, duracion_estimada_minutos, complejidad) VALUES
('Apendicectomía', 'Extirpación del apéndice', 60, 'Baja'),
('Colecistectomía', 'Extirpación de la vesícula biliar', 90, 'Media'),
('Cirugía de Corazón Abierto', 'Cirugía cardíaca mayor', 300, 'Alta'),
('Reemplazo de Rodilla', 'Cirugía ortopédica de rodilla', 120, 'Media'),
('Neurocirugía', 'Cirugía del sistema nervioso', 240, 'Alta');

-- Usuarios (contraseñas hasheadas para 'password123')
INSERT INTO usuarios (username, password_hash, email, tipo_usuario) VALUES
('dr.martinez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcSyh8VsD/.vR2m', 'dr.martinez@hospital.com', 'medico'),
('dr.rodriguez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcSyh8VsD/.vR2m', 'dr.rodriguez@hospital.com', 'medico'),
('dr.garcia', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcSyh8VsD/.vR2m', 'dr.garcia@hospital.com', 'medico'),
('familia.gonzalez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcSyh8VsD/.vR2m', 'familia.gonzalez@gmail.com', 'familiar'),
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewcSyh8VsD/.vR2m', 'admin@hospital.com', 'administrador');

-- Médicos
INSERT INTO medicos (usuario_id, nombre, apellido, cedula, especialidad_id, telefono, registro_medico) VALUES
(1, 'Carlos', 'Martínez', '12345678', 1, '3001234567', 'RM001'),
(2, 'Ana', 'Rodríguez', '87654321', 2, '3009876543', 'RM002'),
(3, 'Miguel', 'García', '11223344', 3, '3005566778', 'RM003');

-- Script para generar datos masivos de pacientes (2000+ registros)
DELIMITER //
CREATE PROCEDURE GenerarPacientes()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE nombre_var VARCHAR(100);
    DECLARE apellido_var VARCHAR(100);
    DECLARE cedula_var VARCHAR(20);
    DECLARE fecha_nac DATE;
    DECLARE sexo_var CHAR(1);
    
    WHILE i <= 2000 DO
        SET nombre_var = CASE (i % 20)
            WHEN 0 THEN 'Juan'
            WHEN 1 THEN 'María'
            WHEN 2 THEN 'Carlos'
            WHEN 3 THEN 'Ana'
            WHEN 4 THEN 'Luis'
            WHEN 5 THEN 'Carmen'
            WHEN 6 THEN 'José'
            WHEN 7 THEN 'Elena'
            WHEN 8 THEN 'Miguel'
            WHEN 9 THEN 'Laura'
            WHEN 10 THEN 'Antonio'
            WHEN 11 THEN 'Isabel'
            WHEN 12 THEN 'Francisco'
            WHEN 13 THEN 'Rosa'
            WHEN 14 THEN 'David'
            WHEN 15 THEN 'Patricia'
            WHEN 16 THEN 'Roberto'
            WHEN 17 THEN 'Marta'
            WHEN 18 THEN 'Fernando'
            ELSE 'Lucía'
        END;
        
        SET apellido_var = CASE (i % 15)
            WHEN 0 THEN 'González'
            WHEN 1 THEN 'Rodríguez'
            WHEN 2 THEN 'García'
            WHEN 3 THEN 'Martínez'
            WHEN 4 THEN 'López'
            WHEN 5 THEN 'Hernández'
            WHEN 6 THEN 'Pérez'
            WHEN 7 THEN 'Sánchez'
            WHEN 8 THEN 'Ramírez'
            WHEN 9 THEN 'Cruz'
            WHEN 10 THEN 'Torres'
            WHEN 11 THEN 'Flores'
            WHEN 12 THEN 'Gómez'
            WHEN 13 THEN 'Díaz'
            ELSE 'Vargas'
        END;
        
        SET cedula_var = CONCAT('100', LPAD(i, 6, '0'));
        SET fecha_nac = DATE_SUB(CURDATE(), INTERVAL (FLOOR(RAND() * 60) + 20) YEAR);
        SET sexo_var = IF(i % 2 = 0, 'M', 'F');
        
        INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, sexo, telefono, eps, tipo_sangre)
        VALUES (
            nombre_var, 
            apellido_var, 
            cedula_var, 
            fecha_nac, 
            sexo_var,
            CONCAT('300', FLOOR(RAND() * 9000000) + 1000000),
            CASE (i % 5) 
                WHEN 0 THEN 'EPS SURA'
                WHEN 1 THEN 'Nueva EPS'
                WHEN 2 THEN 'Sanitas'
                WHEN 3 THEN 'Compensar'
                ELSE 'Salud Total'
            END,
            CASE (i % 8)
                WHEN 0 THEN 'O+'
                WHEN 1 THEN 'A+'
                WHEN 2 THEN 'B+'
                WHEN 3 THEN 'AB+'
                WHEN 4 THEN 'O-'
                WHEN 5 THEN 'A-'
                WHEN 6 THEN 'B-'
                ELSE 'AB-'
            END
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerarPacientes();
DROP PROCEDURE GenerarPacientes;

-- Script para generar contactos (2000+ registros)
DELIMITER //
CREATE PROCEDURE GenerarContactos()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE max_paciente_id INT;
    
    SELECT MAX(id) INTO max_paciente_id FROM pacientes;
    
    WHILE i <= 2000 DO
        INSERT INTO contactos (paciente_id, nombre, apellido, relacion, telefono, email, es_contacto_principal, notificaciones_activas)
        VALUES (
            (i % max_paciente_id) + 1,
            CASE (i % 10)
                WHEN 0 THEN 'Pedro'
                WHEN 1 THEN 'Sandra'
                WHEN 2 THEN 'Ricardo'
                WHEN 3 THEN 'Mónica'
                WHEN 4 THEN 'Andrés'
                WHEN 5 THEN 'Claudia'
                WHEN 6 THEN 'Javier'
                WHEN 7 THEN 'Diana'
                WHEN 8 THEN 'Sergio'
                ELSE 'Alejandra'
            END,
            CASE (i % 8)
                WHEN 0 THEN 'Morales'
                WHEN 1 THEN 'Jiménez'
                WHEN 2 THEN 'Ruiz'
                WHEN 3 THEN 'Herrera'
                WHEN 4 THEN 'Medina'
                WHEN 5 THEN 'Castro'
                WHEN 6 THEN 'Ortiz'
                ELSE 'Ramos'
            END,
            CASE (i % 6)
                WHEN 0 THEN 'Hijo/a'
                WHEN 1 THEN 'Esposo/a'
                WHEN 2 THEN 'Padre/Madre'
                WHEN 3 THEN 'Hermano/a'
                WHEN 4 THEN 'Abuelo/a'
                ELSE 'Primo/a'
            END,
            CONCAT('300', FLOOR(RAND() * 9000000) + 1000000),
            CONCAT('contacto', i, '@email.com'),
            IF(i % 3 = 0, TRUE, FALSE),
            TRUE
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerarContactos();
DROP PROCEDURE GenerarContactos;

-- Script para generar cirugías (2000+ registros)
DELIMITER //
CREATE PROCEDURE GenerarCirugias()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE max_paciente_id INT;
    DECLARE max_medico_id INT;
    DECLARE fecha_prog DATETIME;
    
    SELECT MAX(id) INTO max_paciente_id FROM pacientes;
    SELECT MAX(id) INTO max_medico_id FROM medicos;
    
    WHILE i <= 2000 DO
        SET fecha_prog = DATE_ADD(CURDATE(), INTERVAL (FLOOR(RAND() * 60) - 30) DAY);
        
        INSERT INTO cirugias (paciente_id, medico_principal_id, tipo_cirugia_id, fecha_programada, estado, quirofano)
        VALUES (
            (i % max_paciente_id) + 1,
            (i % max_medico_id) + 1,
            (i % 5) + 1,
            fecha_prog,
            CASE (i % 6)
                WHEN 0 THEN 'Programada'
                WHEN 1 THEN 'Pre-operatorio'
                WHEN 2 THEN 'En_proceso'
                WHEN 3 THEN 'Post-operatorio'
                WHEN 4 THEN 'Finalizada'
                ELSE 'Programada'
            END,
            CONCAT('Q', (i % 10) + 1)
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerarCirugias();
DROP PROCEDURE GenerarCirugias;

-- Script para generar signos vitales (2000+ registros)
DELIMITER //
CREATE PROCEDURE GenerarSignosVitales()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE max_paciente_id INT;
    DECLARE max_cirugia_id INT;
    DECLARE max_medico_id INT;
    
    SELECT MAX(id) INTO max_paciente_id FROM pacientes;
    SELECT MAX(id) INTO max_cirugia_id FROM cirugias;
    SELECT MAX(id) INTO max_medico_id FROM medicos;
    
    WHILE i <= 2000 DO
        INSERT INTO signos_vitales (paciente_id, cirugia_id, fecha_registro, presion_sistolica, presion_diastolica, 
                                   frecuencia_cardiaca, temperatura, saturacion_oxigeno, frecuencia_respiratoria, 
                                   dolor_escala, registrado_por_medico_id)
        VALUES (
            (i % max_paciente_id) + 1,
            IF(i % 3 = 0, (i % max_cirugia_id) + 1, NULL),
            DATE_SUB(NOW(), INTERVAL (FLOOR(RAND() * 720)) HOUR),
            FLOOR(RAND() * 60) + 100,  -- Presión sistólica 100-160
            FLOOR(RAND() * 40) + 60,   -- Presión diastólica 60-100
            FLOOR(RAND() * 60) + 60,   -- Frecuencia cardíaca 60-120
            ROUND(35.0 + (RAND() * 4.0), 1), -- Temperatura 35.0-39.0
            FLOOR(RAND() * 10) + 90,   -- Saturación oxígeno 90-100
            FLOOR(RAND() * 10) + 12,   -- Frecuencia respiratoria 12-22
            FLOOR(RAND() * 11),        -- Dolor escala 0-10
            (i % max_medico_id) + 1
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerarSignosVitales();
DROP PROCEDURE GenerarSignosVitales;

-- Script para generar evoluciones clínicas (2000+ registros)
DELIMITER //
CREATE PROCEDURE GenerarEvolucionesClinicas()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE max_paciente_id INT;
    DECLARE max_cirugia_id INT;
    DECLARE max_medico_id INT;
    
    SELECT MAX(id) INTO max_paciente_id FROM pacientes;
    SELECT MAX(id) INTO max_cirugia_id FROM cirugias;
    SELECT MAX(id) INTO max_medico_id FROM medicos;
    
    WHILE i <= 2000 DO
        INSERT INTO evoluciones_clinicas (paciente_id, cirugia_id, fecha_registro, estado_general, descripcion, 
                                         plan_tratamiento, medico_id)
        VALUES (
            (i % max_paciente_id) + 1,
            IF(i % 4 = 0, (i % max_cirugia_id) + 1, NULL),
            DATE_SUB(NOW(), INTERVAL (FLOOR(RAND() * 168)) HOUR),
            CASE (i % 4)
                WHEN 0 THEN 'Estable'
                WHEN 1 THEN 'Mejorado'
                WHEN 2 THEN 'Regular'
                ELSE 'Crítico'
            END,
            CASE (i % 8)
                WHEN 0 THEN 'Paciente en evolución favorable, sin complicaciones'
                WHEN 1 THEN 'Signos vitales estables, dolor controlado'
                WHEN 2 THEN 'Recuperación dentro de parámetros normales'
                WHEN 3 THEN 'Requiere monitoreo constante'
                WHEN 4 THEN 'Evolución satisfactoria post-cirugía'
                WHEN 5 THEN 'Paciente consciente y orientado'
                WHEN 6 THEN 'Tolerando dieta, movilización progresiva'
                ELSE 'Control de dolor adecuado, herida en buen estado'
            END,
            CASE (i % 6)
                WHEN 0 THEN 'Continuar tratamiento actual'
                WHEN 1 THEN 'Ajustar medicación para dolor'
                WHEN 2 THEN 'Iniciar fisioterapia'
                WHEN 3 THEN 'Control en 24 horas'
                WHEN 4 THEN 'Preparar para alta médica'
                ELSE 'Monitoreo estrecho de signos vitales'
            END,
            (i % max_medico_id) + 1
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerarEvolucionesClinicas();
DROP PROCEDURE GenerarEvolucionesClinicas;

-- Crear vistas para reportes de Power BI
CREATE VIEW vista_pacientes_completa AS
SELECT 
    p.id,
    p.nombre,
    p.apellido,
    p.cedula,
    p.fecha_nacimiento,
    TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
    p.sexo,
    p.eps,
    p.tipo_sangre,
    COUNT(c.id) AS total_cirugias,
    MAX(c.fecha_programada) AS ultima_cirugia
FROM pacientes p
LEFT JOIN cirugias c ON p.id = c.paciente_id
GROUP BY p.id;

CREATE VIEW vista_cirugias_detallada AS
SELECT 
    c.id,
    CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
    p.cedula,
    CONCAT(m.nombre, ' ', m.apellido) AS medico_nombre,
    e.nombre AS especialidad,
    tc.nombre AS tipo_cirugia,
    c.fecha_programada,
    c.fecha_inicio,
    c.fecha_fin,
    c.estado,
    c.quirofano,
    CASE 
        WHEN c.fecha_fin IS NOT NULL AND c.fecha_inicio IS NOT NULL 
        THEN TIMESTAMPDIFF(MINUTE, c.fecha_inicio, c.fecha_fin)
        ELSE NULL
    END AS duracion_minutos
FROM cirugias c
JOIN pacientes p ON c.paciente_id = p.id
JOIN medicos m ON c.medico_principal_id = m.id
JOIN especialidades e ON m.especialidad_id = e.id
JOIN tipos_cirugia tc ON c.tipo_cirugia_id = tc.id;

CREATE VIEW vista_signos_vitales_resumen AS
SELECT 
    sv.paciente_id,
    CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
    DATE(sv.fecha_registro) AS fecha,
    AVG(sv.presion_sistolica) AS promedio_sistolica,
    AVG(sv.presion_diastolica) AS promedio_diastolica,
    AVG(sv.frecuencia_cardiaca) AS promedio_fc,
    AVG(sv.temperatura) AS promedio_temperatura,
    AVG(sv.saturacion_oxigeno) AS promedio_saturacion,
    COUNT(*) AS total_registros
FROM signos_vitales sv
JOIN pacientes p ON sv.paciente_id = p.id
GROUP BY sv.paciente_id, DATE(sv.fecha_registro);

COMMIT;