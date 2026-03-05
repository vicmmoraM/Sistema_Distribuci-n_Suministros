-- Tabla para asignar proveedores mensuales a departamentos
-- Permite que cada departamento tenga un proveedor diferente cada mes

USE DB_SupplyChain;

-- Tabla para configurar rotación automática de proveedores por departamento
CREATE TABLE departamento_proveedores_rotacion (
    id_rotacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    id_proveedor INT NOT NULL,
    orden_rotacion INT NOT NULL,  -- 1, 2, 3... orden en el ciclo
    CONSTRAINT fk_rot_dept FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento),
    CONSTRAINT fk_rot_prov FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor),
    CONSTRAINT uq_dept_orden UNIQUE (id_departamento, orden_rotacion)
) ENGINE=INNODB;

-- Ejemplo: Tecnología rota entre Orieta (mes impar) e Iris (mes par)
INSERT INTO departamento_proveedores_rotacion (id_departamento, id_proveedor, orden_rotacion) VALUES
(1, 2, 1),  -- Tecnología -> Insumos Orieta -> Posición 1 (meses impares)
(1, 1, 2);  -- Tecnología -> Insumos Iris -> Posición 2 (meses pares)

-- Consulta para ver el proveedor que corresponde al mes actual
-- La rotación se calcula: ((mes - 1) MOD cantidad_proveedores) + 1
SELECT 
    d.descripcion AS departamento,
    p.nombre_proveedor AS proveedor_mes_actual,
    MONTH(NOW()) AS mes_actual,
    dpr.orden_rotacion
FROM departamento_proveedores_rotacion dpr
INNER JOIN departamentos d ON dpr.id_departamento = d.id_departamento
INNER JOIN proveedores p ON dpr.id_proveedor = p.id_proveedor
WHERE dpr.orden_rotacion = (
    SELECT (((MONTH(NOW()) - 1) % COUNT(*)) + 1)
    FROM departamento_proveedores_rotacion
    WHERE id_departamento = dpr.id_departamento
);

-- Consulta para ver toda la configuración de rotación
SELECT 
    d.descripcion AS departamento,
    p.nombre_proveedor AS proveedor,
    dpr.orden_rotacion,
    CASE 
        WHEN dpr.orden_rotacion = 1 THEN 'Enero, Marzo, Mayo, Julio, Sept, Nov'
        WHEN dpr.orden_rotacion = 2 THEN 'Feb, Abril, Junio, Agosto, Oct, Dic'
    END AS meses_asignados
FROM departamento_proveedores_rotacion dpr
INNER JOIN departamentos d ON dpr.id_departamento = d.id_departamento
INNER JOIN proveedores p ON dpr.id_proveedor = p.id_proveedor
ORDER BY d.descripcion, dpr.orden_rotacion;
