-- Migración: Agregar columnas para observaciones y motivos en pedidos
-- Fecha: 2026-03-09
-- Descripción: Agrega columnas para guardar observaciones de aprobación y motivos de rechazo

USE DB_SupplyChain;

-- Agregar columna para observaciones cuando se aprueba un pedido
ALTER TABLE cabecera_pedidos 
ADD COLUMN observaciones_aprobacion TEXT NULL DEFAULT NULL
COMMENT 'Observaciones o comentarios al aprobar el pedido';

-- Agregar columna para el motivo cuando se rechaza un pedido
ALTER TABLE cabecera_pedidos 
ADD COLUMN motivo_rechazo TEXT NULL DEFAULT NULL
COMMENT 'Motivo especificado al rechazar el pedido';

-- Verificar los cambios
DESCRIBE cabecera_pedidos;
