
### `README.md`

```markdown
# 🏎️️ F1 Classification & Management System

Panel web interactivo y responsivo construido con **React** y **Vite** para la visualización de clasificaciones de Fórmula 1 y la gestión completa (CRUD) de pilotos y escuderías, consumiendo la **F1 API Clean**.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18
- **Build Tool:** Vite
- **Enrutamiento:** React Router DOM (v6)
- **Cliente HTTP:** Axios
- **Iconos:** Lucide React
- **Estilos:** CSS3 nativo con CSS Variables y diseño responsivo adaptado a la estética F1

---

## 📂 Estructura del Proyecto

```text
f1-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── f1-styles.css
│   ├── components/
│   │   ├── EscuderiaCard.jsx
│   │   ├── EscuderiaFormModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── PilotoCard.jsx
│   │   └── PilotoFormModal.jsx
│   ├── pages/
│   │   ├── ClasificacionPage.jsx
│   │   ├── EscuderiasPage.jsx
│   │   └── PilotosPage.jsx
│   ├── routes/
│   │   └── AppRouter.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── escuderiaService.js
│   │   └── pilotoService.js
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── README.md

```

---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

* **Node.js** (v16.0.0 o superior)
* **npm** o **yarn**
* Backend **F1 API Clean** ejecutándose localmente (por defecto en `http://localhost:3000`).

### 2. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd f1-frontend

# Instalar paquetes
npm install

```

### 3. Configurar Variables de Entorno

Asegúrate de que existe el archivo `.env` en la raíz del proyecto con la URL de tu API backend:

```env
VITE_API_URL=http://localhost:3000/api

```

### 4. Ejecutar el Proyecto en Desarrollo

```bash
npm run dev

```

La aplicación estará disponible por defecto en `http://localhost:5173`.

---

## 📌 Funcionalidades Principal

### 🏆 Clasificación General (`/`)

* Tabla dinámica del **Mundial de Pilotos** ordenada por puntos de mayor a menor.
* Tabla dinámica del **Mundial de Escuderías** con detalles de motor, jefe de equipo y año de fundación.

### 🏎️ Gestión de Pilotos (`/pilotos`)

* **Crear Piloto:** Añade nombre, apellidos, dorsal, nacionalidad, puntos y asigna una escudería existente.
* **Editar Piloto:** Modifica los datos o cambia de escudería.
* **Eliminar Piloto:** Borra el registro con confirmación de seguridad.

### 🏢 Gestión de Escuderías (`/escuderias`)

* **Crear Escudería:** Registro de nombre, país, motor, jefe de equipo, año de fundación y puntos totales.
* **Editar Escudería:** Actualiza cualquier atributo de la escudería.
* **Eliminar Escudería:** Elimina la escudería del sistema.

---

## 📦 Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo local con Hot Reload.
* `npm run build`: Compila el proyecto para producción en la carpeta `dist/`.
* `npm run preview`: Previsualiza la build de producción localmente.

```

```