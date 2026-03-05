-- Eliminar pedidos antiguos sin proveedor
-- Deshabilitar safe mode temporalmente
SET SQL_SAFE_UPDATES = 0;

DELETE FROM cabecera_pedidos
WHERE id_pedido IN (
  SELECT DISTINCT dp.id_pedido
  FROM detalle_pedidos dp
  WHERE dp.id_proveedor IS NULL
);

-- Volver a habilitar safe mode
SET SQL_SAFE_UPDATES = 1;

-- Verificar cuántos pedidos quedaron
SELECT COUNT(*) as pedidos_restantes
FROM cabecera_pedidos;

