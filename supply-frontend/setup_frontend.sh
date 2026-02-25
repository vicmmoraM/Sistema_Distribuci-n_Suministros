#!/bin&bash

mkdir -p src/api
mkdir -p src/context
mkdir -p src/components
mkdir -p src/pages

touch src/api/axios.js
touch src/context/AuthContext.jsx
touch src/components/ProtectedRoute.jsx
touch src/pages/Login.jsx
touch src/pages/Home.jsx
touch src/pages/Notificacion.jsx

echo "Estructura creada."
echo ""
echo "supply-frontend/src/"
echo "├── api/"
echo "│   └── axios.js"
echo "├── context/"
echo "│   └── AuthContext.jsx"
echo "├── components/"
echo "│   └── ProtectedRoute.jsx"
echo "├── pages/"
echo "│   ├── Login.jsx"
echo "│   ├── Home.jsx"
echo "│   └── Notificacion.jsx"
echo "├── App.jsx"
echo "├── main.jsx"
echo "└── index.css"