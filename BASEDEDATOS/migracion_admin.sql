USE db_supplychain;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE suministros
  ADD COLUMN IF NOT EXISTS fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS rol_permisos (
  id_rol INT NOT NULL PRIMARY KEY,
  puede_pedidos TINYINT(1) NOT NULL DEFAULT 1,
  puede_reportes TINYINT(1) NOT NULL DEFAULT 0,
  puede_aprobacion TINYINT(1) NOT NULL DEFAULT 0,
  puede_configuracion TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_rol_perm FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=INNODB;

INSERT INTO rol_permisos (id_rol, puede_pedidos, puede_reportes, puede_aprobacion, puede_configuracion)
SELECT
  r.id_rol,
  1,
  CASE WHEN LOWER(r.descripcion) IN ('aprobador', 'administrador') THEN 1 ELSE 0 END,
  CASE WHEN LOWER(r.descripcion) IN ('aprobador', 'administrador') THEN 1 ELSE 0 END,
  CASE WHEN LOWER(r.descripcion) = 'administrador' THEN 1 ELSE 0 END
FROM roles r
ON DUPLICATE KEY UPDATE
  puede_pedidos = VALUES(puede_pedidos),
  puede_reportes = VALUES(puede_reportes),
  puede_aprobacion = VALUES(puede_aprobacion),
  puede_configuracion = VALUES(puede_configuracion);

-- Crear usuario administrador para pasante.desarrollo
INSERT INTO usuarios (id_departamento, id_rol, login, nombres, email, activo)
SELECT 
  (SELECT id_departamento FROM departamentos LIMIT 1),
  (SELECT id_rol FROM roles WHERE descripcion = 'Administrador' LIMIT 1),
  'pasante.desarrollo',
  'Pasante Desarrollo',
  'pasante.desarrollo@farmcorp.com.ec',
  1
ON DUPLICATE KEY UPDATE
  id_rol = (SELECT id_rol FROM roles WHERE descripcion = 'Administrador' LIMIT 1),
  activo = 1;

-- Añadir id_proveedor a detalle_pedidos para relacionar con proveedores y no exista 
-- ambigüedad con precios de suministros
ALTER TABLE detalle_pedidos ADD COLUMN id_proveedor INT;
ALTER TABLE detalle_pedidos ADD CONSTRAINT fk_det_prov 
  FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor);