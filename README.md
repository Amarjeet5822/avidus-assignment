# Avidus Assignment

This repository contains the full-stack Avidus Assignment application, consisting of an Express.js backend, React.js frontend, and MongoDB database.

---

## 🏗️ Backend

# 📝 Task Management Application

This is a **Task Management Backend Application** built with **Node.js, Express, and MongoDB**. It allows users to **register, login, and manage their tasks** with robust history and tracking functionalities.

### 🚀 Features

#### 🌟 User Authentication
- **Register**: Users can create an account.
- **Login/Logout**: Secure login and logout using JWT.
- **Cookie-based Authentication**: Cookies are used to securely store refresh tokens.
- **Role-Based Access Control**: Supports `Admin` and `User` roles.

#### 🗒️ Task Management
- **Create a Task**: Add new tasks with a name and completion status.
- **Read Tasks**: Fetch tasks (Admins can view all tasks, users can view their own).
- **Update a Task**: Edit existing tasks and mark them as completed.
- **Delete a Task**: Remove a task.

#### 📜 History & Audit Logging
- **Reusable History Plugin**: Automatically tracks `CREATE`, `UPDATE`, and `DELETE` actions on `User` and `Task` models using Mongoose hooks.
- **History Logs**: Admins can fetch comprehensive audit logs to track changes in the system.

### 🌐 API Endpoints

#### User Routes
- **POST /api/users/signup** — Register a new user
- **POST /api/users/login** — Login a user and set cookie
- **POST /api/users/logout** — Logout a user and add token to blocklist
- **GET /api/users/** — Get all users (Admin only)
- **GET /api/users/:id** — Get user details
- **PATCH /api/users/:id** — Update a user by ID
- **DELETE /api/users/:id** — Delete a user by ID

#### Task Routes
- **GET /api/tasks** — Get all tasks for the logged-in user (Admin gets all)
- **POST /api/tasks** — Create a new task
- **GET /api/tasks/:id** — Get a specific task
- **PATCH /api/tasks/:id** — Update a task by ID
- **DELETE /api/tasks/:id** — Delete a task by ID

#### History Routes
- **GET /api/history** — Get history/audit logs (Admin only)

### 🔧 Configuration

Create a `.env` file in the `backend` directory with the following variables:
```
PORT=8080
MONGO_URL=your_mongo_db_connection_string
SECRET_KEY=your_secret_key
SALT_ROUNDS=10
FE_URL=http://localhost:5173
DEPLOYED_FE_URL=your_deployed_frontend_url
NODE_ENV=development
```

### 🚢 Run the Backend

1. **Navigate to backend and install dependencies:**
```bash
cd backend
npm install
```

2. **Seed Default Admin:**
```bash
npm run seed
```
*(Creates a default admin user with `example@gmail.com` and password `admin`)*

3. **Start the server (Development):**
```bash
npm run dev
```

### 📦 Packages Used

- **Express** — For creating the server
- **Mongoose** — For interacting with MongoDB
- **dotenv** — To load environment variables
- **cors** — To enable cross-origin requests
- **cookie-parser** — To handle cookies
- **jsonwebtoken** — For JWT authentication
- **bcrypt** — For password hashing
- **nodemon** — For live server reload during development

### 📚 Folder Structure
```
backend/
├── config
│   └── dbConnection.js
├── controllers
│   ├── authControllers.js
│   ├── historyControllers.js
│   ├── taskControllers.js
│   └── usersControllers.js
├── middlewares
│   └── auth.js
├── models
│   ├── history.models.js
│   ├── task.models.js
│   ├── token.models.js
│   └── user.models.js
├── routes
│   ├── history.route.js
│   ├── index.route.js
│   ├── task.route.js
│   └── user.route.js
├── utils
│   ├── AppError.js
│   └── historyPlugin.js
├── index.js
├── seed.js
├── .env
└── package.json
```

---

## 🎨 Frontend

This is a **Task Management Frontend Application** built with **React, Vite, and Tailwind CSS**. It provides a responsive, modern user interface to interact with the backend API.

### 🚀 Features

#### 🌟 Modern Tech Stack
- **React + Vite**: Blazing fast development server and optimized production builds.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and responsive design.
- **React Router DOM**: Seamless client-side routing for navigating between pages.

#### 🔐 State Management & Authentication
- **Redux Toolkit**: Centralized state management for Users, Tasks, and History Logs.
- **Protected Routes**: Role-based access control. The Admin Dashboard is strictly protected and hidden from standard users.
- **Cookie Auth**: Securely communicates with the backend using `withCredentials: true` via Axios.

#### 📊 Admin Dashboard
- **Analytics**: Overview of total users and pending/completed tasks.
- **User Management**: Admins can view, edit (Name, Email, Role, Active/Inactive status), update passwords, and delete users inline.
- **Task Monitoring**: Global view of all tasks across the application with inline editing capabilities.
- **Activity Logs**: Rich, formatted audit tables showing exactly what fields changed (`Old Value ➔ New Value`) with exact timestamps.

#### 🔔 User Experience
- **Toast Notifications**: Interactive popup notifications using `react-hot-toast` for all CRUD operations.
- **Inline Task Editing**: Users can easily click an edit icon to rename their tasks instantly on the homepage.

### 🔧 Configuration

Create a `.env` file in the `frontend` directory with the following variables:
```env
VITE_BE_URL=http://localhost:8080/api
VITE_DEPLOYED_BE_URL=https://your-deployed-backend-url.com/api
```

### 🚢 Run the Frontend

1. **Navigate to frontend and install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

### 📦 Packages Used

- **react** & **react-dom** — UI Library
- **vite** — Next Generation Frontend Tooling
- **react-router-dom** — Client-side routing
- **@reduxjs/toolkit** & **react-redux** — State Management
- **axios** — HTTP client for API requests
- **tailwindcss** — Utility-first styling
- **react-icons** — Beautiful SVG icons
- **react-hot-toast** — Toast notifications

### 📚 Folder Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ActivityLogs.jsx
│   │   │   ├── AnalyticsSection.jsx
│   │   │   ├── TaskMonitoring.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── AllRoutes.jsx
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── store/
│   │   ├── features/
│   │   │   ├── authUser/authUserSlice.js
│   │   │   ├── historyUser/historyUserSlice.js
│   │   │   └── taskUser/taskUserSlice.js
│   │   └── store.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── tailwind.config.js
└── package.json
```
