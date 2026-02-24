#Generación automatizada de carpetas y archivos para el backend de la aplicación
#!/bin/bash

mkdir -p supply-backend/src/config
mkdir -p supply-backend/src/middleware
mkdir -p supply-backend/src/routes

touch supply-backend/package.json
touch supply-backend/.env.example

touch supply-backend/src/index.js

touch supply-backend/src/config/db.js
touch supply-backend/src/config/ldap.js

touch supply-backend/src/middleware/auth.js

touch supply-backend/src/routes/auth.js
touch supply-backend/src/routes/catologos.js
touch supply-backend/src/routes/pedidos.js

echo "Estructura de carpetas y archivos para el backend creada exitosamente."
echo ""
echo "supply-backend/"
echo "├── package.json"
echo "├── .env.example"
echo "├── README.md"
echo "└── src/"
echo "    ├── index.js"
echo "    ├── config/"
echo "    │   ├── db.js"
echo "    │   └── ldap.js"
echo "    ├── middleware/"
echo "    │   └── auth.js"
echo "    └── routes/"
echo "        ├── auth.js"
echo "        ├── catalogos.js"
echo "        └── pedidos.js"