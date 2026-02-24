//Autenticación 
const ldap = require('ldapjs');

/**
 * Autentica un usuario contra un servidor LDAP
 * 
 * @param {string} username - login del usuarios
 * @param {string} password - contraseña del usuario
 * @param {string} department - nombre del OU del departamento al que pertenece el usuario
 * @return {Promise<{username: string, displayName: string}>} - Promesa que resuelve con el nombre de usuario y su displayName si la autenticación es exitosa, o rechaza con un error si falla
 */

async function authenticateUser(username, password, department) {
    return new Promise((resolve, reject) => {
        const client = ldap.createClient({ url: process.env.LDAP_URL });

        client.on('error', (err) => {
            reject(new Error('Error de conexión LDAP: ' + err.message));
        });

        client.bind(process.env.LDAP_SERVICE_DN, process.env.LDAP_SERVICE_PASS, (err) => {
            if (err) {
                client.destroy();
                return reject(new Error('Error de autenticación del servicio LDAP'));
            }

            const searchBase = `ou=${department},${process.env.LDAP_BASE_OU}`;
            const searchOptions = {
                filter: `(sAMAccountName=${ldap.escapeDN(username)})`,
                scope: 'sub',
                attributes: ['dn', 'displayName', 'cn'],
            };

            client.search(searchBase, searchOptions, (err, res) => {
                if (err) {
                    client.destroy();
                    return reject(new Error('Error al buscar usuario en LDAP'));
                }

                let userEntry = null;

                res.on('searchEntry', (entry) => {
                    userEntry = entry;
                });

                res.on('error', (err) => {
                    client.destroy();
                    reject(new Error('Error en la búsqueda LDAP: ' + err.message));
                });

                res.on('end', () => {
                    if (!userEntry) {
                        client.destroy();
                        return reject(new Error('Usuario no encontrado en el directorio'));
                    }

                    const userDN = userEntry.objectName;
                    const cnPart = userDN.split(',')[0];
                    const displayName = cnPart.split('=')[1] || username;

                    client.bind(userDN, password, (err) => {
                        client.destroy();
                        if (err) {
                            return reject(new Error('Usuario o contraseña incorrectos'));
                        }
                        resolve({ username, displayName });
                    });
                });
            });
        });
    });
}

module.exports = { authenticateUser };