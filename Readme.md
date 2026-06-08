# 🚀 TaskFlow: Modern Task Management Platform

**Live Demo:** [https://task-manager-ten-cyan-14.vercel.app/](https://task-manager-ten-cyan-14.vercel.app/)

TaskFlow is a premium, full-stack Task Management application built on the **MERN Stack** (MongoDB, Express, React, Node.js). It is designed to deliver a highly responsive, enterprise-grade user experience with advanced data handling, beautiful UI/UX, and robust security.

---

## 🗂️ Project Structure & Sub-Documentation

This repository is split into two distinct environments. **Each environment has its own dedicated `README.md`** containing setup instructions, API endpoints, and day-by-day development logs.

```text
Task Manager/
├── Backend/                 # Node.js + Express REST API Server
│   ├── config/              # Database configurations
│   ├── controllers/         # API business logic
│   ├── middleware/          # Security & Error handlers
│   ├── models/              # Mongoose database schemas
│   ├── routes/              # API route definitions
│   └── README.md            # ➡️ Backend Documentation & API Specs
│
├── frontend/                # React.js + Vite Client Application
│   ├── src/
│   │   ├── api/             # Axios client configurations
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Application views
│   │   └── utils/           # Helper functions (Export, Dates)
│   ├── index.css            # Tailwind CSS design system tokens
│   └── README.md            # ➡️ Frontend Documentation & Setup
│
└── Readme.md                # Project Root Documentation (This file)
```

---

## ✨ Core Features

*   **🔍 Live Debounced Search:** Client-side search optimization utilizing a custom `useDebounce` hook to prevent API spam while searching task titles and descriptions.
*   **🗂️ Server-Side Pagination:** Highly optimized data loading. Data is split into pages (9 items per page) at the database level, ensuring the application remains blazing fast even with thousands of tasks.
*   **🎯 Advanced Filtering:** Dynamic filtering by Task Status (Pending/Completed) and Priority (High/Medium/Low) integrated seamlessly with the pagination state.
*   **⚡ Bulk Operations:** A floating "Bulk Actions Bar" that allows users to select multiple tasks and instantly Delete, Complete, or re-assign Priorities in a single batch request.
*   **📊 Analytics Dashboard:** A lazy-loaded statistics panel featuring custom, lightweight SVG charts (Pie & Bar charts) and a 7-day completion trend line calculated via MongoDB Aggregation pipelines.
*   **💾 Data Portability:** Built-in tools to Export task data to **CSV** or **JSON**, and a robust JSON Importer that safely hydrates external task files into the database.

---

## 🎨 UI/UX & Creativity ("Quantum" Theme)

The frontend was meticulously designed with a custom **"Quantum"** design system, pushing past standard component libraries to deliver a truly unique look:
*   **Glassmorphism & Depth:** Sticky blurred header bars, floating glow-shadow panels, and translucent "glass" overlays.
*   **Dot-Grid Canvas:** A subtle geometric background that dynamically shifts opacity between light and dark modes.
*   **Micro-Interactions:** Custom CSS keyframes power staggered card entrances, strikethrough completion animations, "shimmer" hover effects on primary buttons, and a pulsing neon glow for overdue tasks.
*   **Contextual Dark Mode:** A flawless dark mode implemented via Tailwind v4 explicit classes, paired with a custom `ThemeContext` that persists user preference in `localStorage`.
*   **Joyful Design:** Triggering a full-screen Confetti overlay when the user successfully clears their pending task backlog.
*   **Fully Responsive:** Fluid layouts using CSS Grid and Flexbox that elegantly scale down to support mobile screens as small as 320px width.

---

## 🛡️ Code Quality & Error Handling

*   **Robust State Management:** Clean separation of concerns using custom hooks (`usePagination`, `useLocalStorage`, `useDebounce`) to keep components like `Dashboard.jsx` declarative and lean.
*   **Centralized Error Middleware (Backend):** A single source of truth for backend errors. It intercepts Mongoose `ValidationError`s and duplicate key faults (Code `11000`), formats them safely, and returns clean `400 Bad Request` payloads instead of crashing.
*   **Micro-Animated Feedback:** Every CRUD action (Create, Update, Delete) is hooked into `react-hot-toast` to provide the user with instant, slide-in notifications describing the success or failure of their action.
*   **Dual-Tier Route Guarding:** The frontend employs `ProtectedRoute` and `PublicOnlyRoute` wrappers to prevent unauthenticated users from seeing the workspace, and to bounce logged-in users away from the login screen.
*   **Code Cleanliness:** Strict adherence to modern ES6+ practices, removing redundant JSDoc boilerplate in favor of self-documenting function names and precise inline comments for complex side-effects.

---

## 💻 Tech Stack Summary

### ⚙️ Backend Environment
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB via Mongoose ODM
*   **Security:** `bcryptjs` (Password hashing), `jsonwebtoken` (Stateless Session Auth)

### 🖥️ Frontend Environment
*   **Core:** React 18 & Vite
*   **Styling:** Tailwind CSS v4 & Vanilla CSS Variables
*   **HTTP Client:** Axios (with Interceptors for automatic Bearer token injection)
*   **Icons:** Lucide React

## 🚀 Quick Start (Local Setup)

To run the entire TaskFlow application locally, you will need to start both the backend API and the frontend client simultaneously.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend/` directory and add your configurations:
   ```ini
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_super_secret_jwt_signing_key
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory and link it to the backend:
   ```ini
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```

*Once both servers are running, open your browser and navigate to `http://localhost:5173` to use the application.*

---

*For deeper architectural details, please refer to the individual `README.md` files located inside the `frontend/` and `Backend/` directories.*
