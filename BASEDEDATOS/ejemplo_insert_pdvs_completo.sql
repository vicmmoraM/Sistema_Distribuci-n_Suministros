-- =====================================================
-- EJEMPLO COMPLETO DE INSERTS PARA PDVs
-- Incluye: Región, Ciudad, Supervisor, Zona, Proveedor y PDV
-- Fecha: 2026-03-09
-- =====================================================

USE DB_SupplyChain;

-- =====================================================
-- 1. INSERTAR REGIONES (si no existen)
-- =====================================================
INSERT INTO regiones (descripcion) VALUES ('Costa')
ON DUPLICATE KEY UPDATE descripcion = descripcion;

-- =====================================================
-- 2. INSERTAR CIUDADES
-- =====================================================
INSERT INTO ciudades (id_region, descripcion) 
VALUES 
    ((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'BALZAR'),
    ((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'DURAN')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- =====================================================
-- 3. INSERTAR SUPERVISORES
-- =====================================================
INSERT INTO supervisores (nombres, activo) 
VALUES 
    ('Ligia Rodriguez', 1),
    ('Fernando Vera', 1)
ON DUPLICATE KEY UPDATE nombres = VALUES(nombres);

-- =====================================================
-- 4. INSERTAR ZONAS COMERCIALES
-- =====================================================
INSERT INTO zonas_comerciales (zona, codigo_zona, id_region)
VALUES 
    ('COSTA CENTRO 1', 'CC1', (SELECT id_region FROM regiones WHERE descripcion = 'Costa')),
    ('DURAN', 'DRN', (SELECT id_region FROM regiones WHERE descripcion = 'Costa'))
ON DUPLICATE KEY UPDATE zona = VALUES(zona);

-- =====================================================
-- 5. INSERTAR PROVEEDORES
-- =====================================================
INSERT INTO proveedores (nombre_proveedor)
VALUES 
    ('ORIETA'),
    ('Irrazabal (IRIS)')
ON DUPLICATE KEY UPDATE nombre_proveedor = VALUES(nombre_proveedor);

-- =====================================================
-- 6. INSERTAR ESTADOS Y GRUPOS DE PDVs (si no existen)
-- =====================================================
INSERT INTO estado_pdvs (descripcion) VALUES ('Activo')
ON DUPLICATE KEY UPDATE descripcion = descripcion;

-- Grupo con monto autorizado de $1000 por ejemplo
INSERT INTO grupo_pdvs (descripcion, monto_autorizado)
VALUES ('Grupo Costa', 1000.00)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- =====================================================
-- 7. INSERTAR PDVs CON TODOS LOS DATOS
-- =====================================================

-- PDV FC004 - BALZAR
INSERT INTO pdvs (
    id_grupo_pdv,
    id_estado_pdv,
    id_zona_comercial,
    id_proveedor_principal,
    id_ciudad,
    id_supervisor,
    descripcion,
    direccion,
    codigo_centro_costo
)
VALUES (
    (SELECT id_grupo_pdv FROM grupo_pdvs WHERE descripcion = 'Grupo Costa' LIMIT 1),
    (SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion = 'Activo' LIMIT 1),
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'CC1' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor = 'ORIETA' LIMIT 1),
    (SELECT id_ciudad FROM ciudades WHERE descripcion = 'BALZAR' LIMIT 1),
    (SELECT id_supervisor FROM supervisores WHERE nombres = 'Ligia Rodriguez' LIMIT 1),
    'FC004',
    'Av. Principal Balzar',
    'FC004'
)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- PDV FC005 - BALZAR
INSERT INTO pdvs (
    id_grupo_pdv,
    id_estado_pdv,
    id_zona_comercial,
    id_proveedor_principal,
    id_ciudad,
    id_supervisor,
    descripcion,
    direccion,
    codigo_centro_costo
)
VALUES (
    (SELECT id_grupo_pdv FROM grupo_pdvs WHERE descripcion = 'Grupo Costa' LIMIT 1),
    (SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion = 'Activo' LIMIT 1),
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'CC1' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor = 'ORIETA' LIMIT 1),
    (SELECT id_ciudad FROM ciudades WHERE descripcion = 'BALZAR' LIMIT 1),
    (SELECT id_supervisor FROM supervisores WHERE nombres = 'Ligia Rodriguez' LIMIT 1),
    'FC005',
    'Calle Comercial Balzar',
    'FC005'
)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- PDV FC007 - DURAN
INSERT INTO pdvs (
    id_grupo_pdv,
    id_estado_pdv,
    id_zona_comercial,
    id_proveedor_principal,
    id_ciudad,
    id_supervisor,
    descripcion,
    direccion,
    codigo_centro_costo
)
VALUES (
    (SELECT id_grupo_pdv FROM grupo_pdvs WHERE descripcion = 'Grupo Costa' LIMIT 1),
    (SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion = 'Activo' LIMIT 1),
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'DRN' LIMIT 1),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor = 'Irrazabal (IRIS)' LIMIT 1),
    (SELECT id_ciudad FROM ciudades WHERE descripcion = 'DURAN' LIMIT 1),
    (SELECT id_supervisor FROM supervisores WHERE nombres = 'Fernando Vera' LIMIT 1),
    'FC007',
    'Av. Central Duran',
    'FC007'
)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- =====================================================
-- VERIFICAR LOS DATOS INSERTADOS
-- =====================================================

SELECT 
    p.codigo_centro_costo AS 'Centro Costo',
    p.descripcion AS 'PDV',
    c.descripcion AS 'Ciudad',
    r.descripcion AS 'Region',
    zc.zona AS 'Zona Comercial',
    prov.nombre_proveedor AS 'Proveedor',
    s.nombres AS 'Supervisor',
    g.monto_autorizado AS 'Cupo Autorizado'
FROM pdvs p
INNER JOIN ciudades c ON p.id_ciudad = c.id_ciudad
INNER JOIN regiones r ON c.id_region = r.id_region
INNER JOIN zonas_comerciales zc ON p.id_zona_comercial = zc.id_zona_comercial
LEFT JOIN proveedores prov ON p.id_proveedor_principal = prov.id_proveedor
LEFT JOIN supervisores s ON p.id_supervisor = s.id_supervisor
INNER JOIN grupo_pdvs g ON p.id_grupo_pdv = g.id_grupo_pdv
WHERE p.codigo_centro_costo IN ('FC004', 'FC005', 'FC007')
ORDER BY p.codigo_centro_costo;

SELECT '¡PDVs insertados exitosamente!' AS resultado;
