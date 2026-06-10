# 📝 Task Management Application

This is a **Task Management Backend Application** built with **Node.js, Express, and MongoDB**. It allows users to **register, login, and manage their tasks** with robust history and tracking functionalities.

## 🚀 Features

### 🌟 User Authentication
- **Register**: Users can create an account.
- **Login/Logout**: Secure login and logout using JWT.
- **Cookie-based Authentication**: Cookies are used to securely store refresh tokens.
- **Role-Based Access Control**: Supports `Admin` and `User` roles.

### 🗒️ Task Management
- **Create a Task**: Add new tasks with a name and completion status.
- **Read Tasks**: Fetch tasks (Admins can view all tasks, users can view their own).
- **Update a Task**: Edit existing tasks and mark them as completed.
- **Delete a Task**: Remove a task.

### 📜 History & Audit Logging
- **Reusable History Plugin**: Automatically tracks `CREATE`, `UPDATE`, and `DELETE` actions on `User` and `Task` models using Mongoose hooks.
- **History Logs**: Admins can fetch comprehensive audit logs to track changes in the system.

## 🌐 API Endpoints

### User Routes
- **POST /api/users/signup** — Register a new user
- **POST /api/users/login** — Login a user and set cookie
- **POST /api/users/logout** — Logout a user and add token to blocklist
- **GET /api/users/** — Get all users (Admin only)
- **GET /api/users/:id** — Get user details
- **PATCH /api/users/:id** — Update a user by ID
- **DELETE /api/users/:id** — Delete a user by ID

### Task Routes
- **GET /api/tasks** — Get all tasks for the logged-in user (Admin gets all)
- **POST /api/tasks** — Create a new task
- **GET /api/tasks/:id** — Get a specific task
- **PATCH /api/tasks/:id** — Update a task by ID
- **DELETE /api/tasks/:id** — Delete a task by ID

### History Routes
- **GET /api/history** — Get history/audit logs (Admin only)

## 🔧 Configuration

Create a `.env` file with the following variables:
```
PORT=8080
MONGO_URL=your_mongo_db_connection_string
SECRET_KEY=your_secret_key
SALT_ROUNDS=10
FE_URL=http://localhost:5173
DEPLOYED_FE_URL=your_deployed_frontend_url
NODE_ENV=development
```

## 🚢 Run the Project

1. **Install dependencies:**
```bash
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

## 📦 Packages Used

- **Express** — For creating the server
- **Mongoose** — For interacting with MongoDB
- **dotenv** — To load environment variables
- **cors** — To enable cross-origin requests
- **cookie-parser** — To handle cookies
- **jsonwebtoken** — For JWT authentication
- **bcrypt** — For password hashing
- **nodemon** — For live server reload during development

## 📚 Folder Structure
```
.
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

## 💡 Contributing
Feel free to fork the repo and submit pull requests. All contributions are welcome!

## 📜 License
This project is licensed under the MIT License.

---
Happy Coding! 🚀
