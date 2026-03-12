-- ============================================================
-- MIGRACIÓN: Agregar campos de ventana de pedidos a departamentos
-- ============================================================

-- Agregar campos de ventana de pedidos a departamentos
ALTER TABLE departamentos 
ADD COLUMN dias_inicio_ventana INT DEFAULT 1,
ADD COLUMN dias_fin_ventana INT DEFAULT 3;

-- Agregar comentario
ALTER TABLE departamentos 
MODIFY COLUMN dias_inicio_ventana INT DEFAULT 1 COMMENT 'Primer día del mes permitido para hacer pedidos',
MODIFY COLUMN dias_fin_ventana INT DEFAULT 3 COMMENT 'Último día del mes permitido para hacer pedidos';

-- Confirmación
SELECT 'Migración completada: Campos dias_inicio_ventana y dias_fin_ventana agregados a departamentos' as status;
