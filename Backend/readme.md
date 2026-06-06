# Task Manager Backend - API Service

A robust, secure, and production-ready RESTful API backend for the **Task Manager** application. Built using the modern Node.js ecosystem, Express.js framework, and MongoDB for persistent storage, this service provides user authentication, session security, and complete CRUD functionality for task management.

---

## 📅 Day-by-Day Development Summary

### 📂 Day 1: Core API Architecture & CRUD Operations
*   **Robust User Authentication:**
    *   Secure registration and login flows.
    *   State-of-the-art password security with automatic salting and hashing (using `bcryptjs` with `12` salt rounds) via Mongoose pre-save middleware.
    *   Stateless session management using JSON Web Tokens (JWT) with a `7d` expiration window.
*   **Complete Task CRUD API:**
    *   Create, Read, Update, and Delete endpoints for task entities.
    *   Scope isolation: Users can only query, edit, or delete tasks that they own.
    *   Support for sorting (tasks returned are ordered by `createdAt` in descending order).
*   **Enterprise-Grade Middleware Architecture:**
    *   **Global Route Security Middleware:** Protects task endpoints by verifying and decoding JWT Bearer tokens.
    *   **Centralized Error Handling Middleware:** Gracefully catches internal server exceptions, formats error responses uniformly, and automatically hides debug stack traces in production mode.
    *   **Request Logger:** Development-focused HTTP request logging using `morgan`.

---

### 📂 Day 2: Telemetry, Bug Fixes & Refined Error States
*   **Mongoose Pre-Save Hook Resolution (`User.js`):**
    *   Refactored the async pre-save hook to remove the deprecated `next` callback. By adhering to Mongoose 6+ specifications for asynchronous middleware, this resolves the `TypeError: next is not a function` error that previously occurred during registration.
*   **Extended Global Error Middleware (`errorMiddleware.js`):**
    *   **Mongoose ValidationError Handler:** Dynamically catches schema validation faults and returns a clean, concatenated bad request (`400`) response of field-specific error messages.
    *   **Duplicate Key Exception Handler (`code 11000`):** Intercepts unique constraint violations (e.g., trying to register an already existing email address) and responds gracefully with a `400 Bad Request` instead of triggering a generic `500 Server Error`.
*   **Telemetry & Error Logging (`authController.js`):**
    *   Integrated standard error logging (`console.error`) inside the authentication controllers for better visibility and server debugging.
*   **Server Cleanup (`server.js`):**
    *   Removed redundant, inactive db config imports.

---

## 📂 Project Architecture & Directory Structure

```text
Backend/
├── config/
│   └── db.js                 # MongoDB connection logic using Mongoose
├── controllers/
│   ├── authController.js     # User registration and authentication handlers (w/ Day 2 error logging)
│   └── taskController.js     # CRUD handlers for task management (Day 1)
├── middleware/
│   ├── authMiddleware.js     # JWT verification and route protection (Day 1)
│   └── errorMiddleware.js    # Enhanced global centralized error handler (Enhanced Day 2)
├── models/
│   ├── Task.js               # Mongoose schema for Tasks (Day 1)
│   └── User.js               # Mongoose schema for Users (Refactored Day 2)
├── routes/
│   ├── authRoutes.js         # Routes mapping for authentication (/api/auth/*)
│   └── taskRoutes.js         # Secured routes mapping for tasks (/api/tasks/*)
├── .env                      # Local environment configurations (ignored by git)
├── .gitignore                # Specifies intentionally untracked files to ignore
├── package.json              # Dependency manifests and execution scripts
├── readme.md                 # Project documentation (this file)
└── server.js                 # Main application entry point (Cleaned Day 2)
```

---

## 🗄️ Database Models & Schema Design

### 1. User Schema (`models/User.js`)
| Field | Type | Rules / Validation | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required | The user's profile display name. |
| `email` | `String` | Required, Unique, Lowercase, Trimmed, Valid Email Regex | The unique identifier for authentication. |
| `password` | `String` | Required, Minimum length `6` | Hashed value stored in the database. |
| `timestamps` | `Date` | Generated automatically (`createdAt`, `updatedAt`) | Metadata for creation and update times. |

### 2. Task Schema (`models/Task.js`)
| Field | Type | Rules / Validation | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `String` | Required, Trimmed | *None* | Descriptive summary of the task. |
| `description`| `String` | Optional, Trimmed | *None* | Detailed scope of the task. |
| `status` | `String` | Enum: `['pending', 'completed']` | `'pending'` | Current completion state. |
| `userId` | `ObjectId` | Required, Reference to `User` model | *None* | Foreign key mapping the task to its owner. |
| `timestamps` | `Date` | Generated automatically (`createdAt`, `updatedAt`) | *None* | Metadata for creation and update times. |

---

## 🔌 API Endpoints Specifications

### Authentication API (Unprotected)

#### A. User Registration
*   **Endpoint:** `POST /api/auth/register`
*   **Headers:** `Content-Type: application/json`
*   **Request Payload:**
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "64bfbc7a2e2b3426a8f1025a",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "token": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

#### B. User Login
*   **Endpoint:** `POST /api/auth/login`
*   **Headers:** `Content-Type: application/json`
*   **Request Payload:**
    ```json
    {
      "email": "johndoe@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "64bfbc7a2e2b3426a8f1025a",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "token": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

---

### Task Management API (Protected - Requires `Authorization: Bearer <token>`)

#### A. Fetch All Tasks
*   **Endpoint:** `GET /api/tasks`
*   **Description:** Retrieves all tasks owned by the authenticated user, sorted by newest first.
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "count": 2,
      "data": [
        {
          "_id": "64bfc1232e2b3426a8f1026b",
          "title": "Complete Day 1 Frontend Draft",
          "description": "Establish routing and modern CSS layout boilerplate.",
          "status": "pending",
          "userId": "64bfbc7a2e2b3426a8f1025a",
          "createdAt": "2026-06-05T11:45:00.000Z",
          "updatedAt": "2026-06-05T11:45:00.000Z"
        }
      ]
    }
    ```

#### B. Create Task
*   **Endpoint:** `POST /api/tasks`
*   **Request Payload:**
    ```json
    {
      "title": "Write Backend Documentation",
      "description": "Generate a highly professional README outlining architecture and API endpoints."
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "64bfc4562e2b3426a8f1027c",
        "title": "Write Backend Documentation",
        "description": "Generate a highly professional README outlining architecture and API endpoints.",
        "status": "pending",
        "userId": "64bfbc7a2e2b3426a8f1025a",
        "createdAt": "2026-06-05T11:50:00.000Z",
        "updatedAt": "2026-06-05T11:50:00.000Z"
      }
    }
    ```

#### C. Update Task
*   **Endpoint:** `PUT /api/tasks/:id`
*   **Request Payload (Example: Updating status to completed):**
    ```json
    {
      "status": "completed"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "64bfc4562e2b3426a8f1027c",
        "title": "Write Backend Documentation",
        "description": "Generate a highly professional README outlining architecture and API endpoints.",
        "status": "completed",
        "userId": "64bfbc7a2e2b3426a8f1025a",
        "createdAt": "2026-06-05T11:50:00.000Z",
        "updatedAt": "2026-06-05T11:55:00.000Z"
      }
    }
    ```

#### D. Delete Task
*   **Endpoint:** `DELETE /api/tasks/:id`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Resource collection dropped cleanly from cluster"
    }
    ```

---

## ⚙️ Setting Up Locally

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Recommended: LTS version)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Or a MongoDB Atlas Cloud Cluster account)

### 2. Environment Configurations
Create a `.env` file in the root of the `Backend/` directory:
```ini
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_super_secret_jwt_signing_key
NODE_ENV=development
```

### 3. Installation
Navigate to the `Backend/` directory and install the package dependencies:
```bash
npm install
```

### 4. Running the Application
*   **Development Server (with Hot-Reloading using `nodemon`):**
    ```bash
    npm run dev
    ```
*   **Production Server:**
    ```bash
    npm start
    ```

The server will initialize and listen on the configured port (default is `5000`).
