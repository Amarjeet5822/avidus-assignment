# Avidus Assignment

🚀 **Live Application:** [https://avidus-pro.netlify.app](https://avidus-pro.netlify.app)

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
- **Create a Task**: Add new tasks with a name, completion status, and optional S3 image attachments.
- **Read Tasks**: Fetch tasks (Admins can view all tasks, users can view their own).
- **Update a Task**: Edit existing tasks and mark them as completed.
- **Delete a Task**: Remove a task.

#### ☁️ Cloud Drive Storage (Google Drive Clone)
- **Hierarchical Storage**: Infinite nesting of folders and files using a single robust MongoDB schema.
- **AWS S3 Integration**: Secure, scalable direct-to-S3 file uploads using Pre-signed PUT/GET URLs.
- **Advanced Operations**: Support for recursive soft-deletes, moving files between folders (with circular dependency protection), and renaming.

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
- **POST /api/tasks** — Create a new task (supports optional image uploads to S3)
- **GET /api/tasks/:id** — Get a specific task
- **PATCH /api/tasks/:id** — Update a task by ID
- **DELETE /api/tasks/:id** — Delete a task by ID

#### Drive Routes
- **GET /api/drive** — Get contents of a folder
- **POST /api/drive/folder** — Create a new folder
- **POST /api/drive/upload/init** — Initialize a direct S3 file upload
- **GET /api/drive/:id/download** — Get a pre-signed S3 download URL
- **PATCH /api/drive/:id/rename** — Rename a file or folder
- **PATCH /api/drive/:id/move** — Move a file or folder
- **DELETE /api/drive/:id** — Soft delete a file or folder recursively

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
- **Redux Toolkit**: Centralized state management for Users, Tasks, History Logs, and Drive Storage.
- **Protected Routes**: Role-based access control. The Admin Dashboard is strictly protected and hidden from standard users.
- **Cookie Auth**: Securely communicates with the backend using `withCredentials: true` via Axios.

#### 📁 Cloud Drive UI
- **Responsive Layouts**: Toggle seamlessly between dynamic Grid and List views for viewing stored files.
- **Breadcrumb Navigation**: Intuitive navigation for traversing deeply nested folders.
- **Image Previews & Downloads**: Instant full-screen modal previews for images and seamless forced programmatic downloading using S3 `Content-Disposition`.
- **Form Validation**: Fully integrated `react-hook-form` and `zod` for robust schema validation when creating or renaming items.

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
- **react-hook-form** & **zod** — Form Validation and Schema Management
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

---

## 📂 Drive — Recursive Folder Upload Feature

One of the highlights of the Cloud Drive module is the **recursive folder upload** system, which allows users to upload an entire local directory and have its exact hierarchy recreated inside the drive — automatically.

---

### ✨ How It Works

When a user uploads a folder (via drag-and-drop or the file picker), the frontend:

1. **Reads the entire folder tree** recursively using the browser's `FileSystemDirectoryEntry` API.
2. **Counts all nodes** (folders + files) upfront to power the real-time progress bar.
3. **Walks the tree** depth-first — creating each sub-folder in the backend before uploading the files inside it.

```
Dropped Folder: ProjectX/
  ├── docs/
  │   └── design.pdf
  ├── src/
  │   ├── index.js
  │   └── utils/
  │       └── helpers.js
  └── README.md

Result in Drive:
  ProjectX/         → POST /api/drive/folder  (parentId = currentFolder)
    docs/           → POST /api/drive/folder  (parentId = ProjectX._id)
      design.pdf    → POST /api/drive/upload + S3 PUT
    src/            → POST /api/drive/folder  (parentId = ProjectX._id)
      index.js      → POST /api/drive/upload + S3 PUT
      utils/        → POST /api/drive/folder  (parentId = src._id)
        helpers.js  → POST /api/drive/upload + S3 PUT
    README.md       → POST /api/drive/upload + S3 PUT
```

> **No new backend endpoints needed** — the feature reuses the existing `POST /api/drive/folder` and `POST /api/drive/upload` APIs.

---

### 🖱️ Three Ways to Upload

| Method | How |
|---|---|
| **Drag & Drop onto the page** | Drag a local folder anywhere on the Drive page. A full-page overlay confirms the drop target. |
| **Drag & Drop onto a folder card** | Drag a local folder directly onto an existing Drive folder card or row. The card highlights with a "Drop into `<name>`" label. |
| **Click the Upload Zone** | A compact `[ Upload Files ] | [ Upload Folder ]` bar lets users click to open the OS file manager — supports multi-file selection and whole-folder selection (`webkitdirectory`). |

---

### 📊 Real-Time Progress Bar

During a folder upload, the header shows a live progress bar:

```
📂 Uploading folder structure...       14 / 37
[████████████░░░░░░░░░░░░░░░░░░░░░░░░]
```

- Counts **every folder created and every file uploaded** as a single unit of progress.
- Automatically dismisses when the upload is complete.

---

### 🧩 Modular Component Architecture

The Drive module is fully decomposed into small, single-responsibility components:

```
frontend/src/pages/drive/
├── DrivePage.jsx                   ← Orchestrator: holds all state & Redux actions
├── utils.js                        ← Shared helpers (formatSize, getFileIcon)
├── utils/
│   └── folderUploadUtils.js        ← Core recursive engine
│       ├── readDirectory()             Reads a drag-and-drop FileSystemDirectoryEntry tree
│       ├── countNodes()               Counts total items for progress tracking
│       ├── uploadTree()               Uploads a drag-and-drop tree recursively
│       ├── buildTreeFromFileList()    Reconstructs a tree from webkitdirectory FileList
│       └── uploadTreeFromFileList()   Uploads a file-picker folder tree recursively
└── components/
    ├── DriveHeader.jsx             ← Title, view toggle, upload buttons, progress bar
    ├── DriveBreadcrumbs.jsx        ← Path navigation (Home > Folder > Sub)
    ├── NewFolderForm.jsx           ← Inline form for creating a new folder
    ├── MoveBanner.jsx              ← "Moving <item>" action bar
    ├── DropZoneOverlay.jsx         ← Full-page drag-over visual cue
    ├── UploadZone.jsx              ← Compact clickable upload bar (files + folder)
    ├── DriveGridView.jsx           ← Grid layout container
    ├── DriveItemCard.jsx           ← Individual grid card (with drop target support)
    ├── DriveListView.jsx           ← List layout container
    ├── DriveItemRow.jsx            ← Individual list row (with drop target support)
    └── ImagePreviewModal.jsx       ← Full-screen image preview overlay
```

---

### 🔑 Key Technical Details

- **`webkitGetAsEntry()`** — Used on drag events to get `FileSystemDirectoryEntry` objects, enabling full recursive directory traversal.
- **Batch `readEntries()` loop** — The browser's `readEntries()` only returns up to 100 entries per call. The implementation loops until an empty batch is returned, guaranteeing large directories are read completely.
- **`webkitdirectory` input attribute** — Used on the hidden `<input>` in `UploadZone` to open the OS folder picker. Returns a flat `FileList` with `webkitRelativePath` on each file, which `buildTreeFromFileList()` reconstructs into a proper tree.
- **Per-card drop counter ref** — Each `DriveItemCard` and `DriveItemRow` uses a `dragCounterRef` to prevent the overlay from flickering when the drag moves between child elements.
- **Double-click guard** — `lastClickedRef` with a 500ms cooldown prevents a rapid double-click from navigating into a folder twice and duplicating the breadcrumb path.
