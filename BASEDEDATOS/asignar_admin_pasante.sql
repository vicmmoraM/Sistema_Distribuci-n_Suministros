-- Asignar rol de Administrador al usuario pasante.desarrollo
-- Fecha: 2026-03-09

USE DB_SupplyChain;

-- Actualizar el usuario pasante.desarrollo para que tenga rol de Administrador
UPDATE usuarios 
SET id_rol = (SELECT id_rol FROM roles WHERE LOWER(descripcion) = 'administrador' LIMIT 1),
    activo = 1
WHERE login = 'pasante.desarrollo';

-- Verificar el cambio
SELECT 
    u.login,
    u.nombres,
    r.descripcion AS rol,
    d.descripcion AS departamento,
    u.activo
FROM usuarios u
INNER JOIN roles r ON u.id_rol = r.id_rol
INNER JOIN departamentos d ON u.id_departamento = d.id_departamento
WHERE u.login = 'pasante.desarrollo';

SELECT '¡Usuario pasante.desarrollo ahora es Administrador!' AS resultado;
