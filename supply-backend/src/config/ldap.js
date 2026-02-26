const ldap = require('ldapjs');

const LDAP_URL = process.env.LDAP_URL || process.env.LDAP_HOST;
const BASE_DN = process.env.LDAP_BASE_OU;
const ADMIN_DN = process.env.LDAP_SERVICE_DN;
const ADMIN_PASSWORD = process.env.LDAP_SERVICE_PASS;

function createClient() {
  return ldap.createClient({
    url: LDAP_URL,
    timeout: 5000,
    connectTimeout: 10000,
  });
}

function bindAdmin(client) {
  return new Promise((resolve, reject) => {
    console.log('Intentando bind con cuenta admin...');
    client.bind(ADMIN_DN, ADMIN_PASSWORD, (err) => {
      if (err) {
        console.error('Error en bind admin:', err.message);
        return reject(new Error('Error en la autenticación administrativa'));
      }
      console.log('Bind admin exitoso');
      resolve();
    });
  });
}

function searchUser(client, username) {
  return new Promise((resolve, reject) => {
    // ✅ Busca en todo el BASE_DN, sin depender del department
    const searchOptions = {
      filter: `(&(objectClass=user)(sAMAccountName=${username.trim()}))`,
      scope: 'sub',
      attributes: ['distinguishedName', 'sAMAccountName', 'displayName', 'cn', 'mail', 'memberOf'],
    };

    console.log(`Buscando usuario: ${username} en BASE_DN: ${BASE_DN}`);
    client.search(BASE_DN, searchOptions, (err, res) => {
      if (err) {
        console.error('Error en búsqueda:', err.message);
        return reject(new Error('Error en la búsqueda LDAP: ' + err.message));
      }

      let userFound = false;

      res.on('searchEntry', (entry) => {
        userFound = true;
        resolve(entry);
      });

      res.on('error', (err) => {
        console.error('Error durante la búsqueda:', err.message);
        reject(new Error('Error en la búsqueda LDAP: ' + err.message));
      });

      res.on('end', () => {
        if (!userFound) {
          console.error('Usuario no encontrado:', username);
          reject(new Error('Usuario no encontrado en el directorio'));
        }
      });
    });
  });
}

function extractUserData(entry) {
  // ✅ Usa entry.pojo, la forma correcta en ldapjs moderno
  const rawAttributes = entry.pojo?.attributes || [];
  const attributes = {};

  rawAttributes.forEach((attr) => {
    if (attr.type && attr.values && attr.values.length > 0) {
      attributes[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
    }
  });

  return {
    dn: attributes.distinguishedName || entry.objectName || entry.dn?.toString(),
    displayName: attributes.displayName || attributes.cn || 'No disponible',
    sAMAccountName: attributes.sAMAccountName || 'No disponible',
    cn: attributes.cn || attributes.displayName || 'No disponible',
    mail: attributes.mail || 'No disponible',
    groups: attributes.memberOf || [],
  };
}

function bindUser(client, userDN, password) {
  return new Promise((resolve, reject) => {
    client.bind(userDN, password, (err) => {
      if (err) {
        console.error('Error en bind de usuario:', err.message);
        return reject(new Error('Usuario o contraseña incorrectos'));
      }
      resolve();
    });
  });
}

async function authenticateUser(username, password) {
  if (!LDAP_URL) return Promise.reject(new Error('LDAP_URL no configurado'));

  const cleanUsername = username.trim();
  console.log('=== Iniciando autenticación LDAP ===');
  const client = createClient();

  try {
    await bindAdmin(client);
    const entry = await searchUser(client, cleanUsername);
    const userData = extractUserData(entry);

    console.log('Usuario encontrado, DN:', userData.dn);
    await bindUser(client, userData.dn, password);

    console.log('Autenticación exitosa:', cleanUsername);
    client.unbind();
    return { username: userData.sAMAccountName, displayName: userData.displayName };
  } catch (err) {
    console.error('Error en login:', err.message);
    client.unbind();
    throw err;
  } finally {
    client.destroy();
  }
}

module.exports = { authenticateUser };