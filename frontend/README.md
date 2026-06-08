# Task Manager Frontend - Client Application

A modern, highly responsive React client interface for the **Task Manager** application. Built using **Vite**, styled with custom utility classes, and fortified with client-side security architecture.

---

## 📅 Day-by-Day Development Summary

### 📂 Day 1: Project Initialization & Boilerplate
*   **React + Vite Template:** Initialized the React application powered by Vite for instant Hot Module Replacement (HMR).
*   **Boilerplate Setup:** Organized the base directory structure (`src/pages`, `src/components`, `src/context`, `src/api`).
*   **Environment Configuration:** Setup the configuration files (`.env`, `eslint.config.js`, `vite.config.js`).

---

### 📂 Day 2: Authentication Core & Route Security
*   **Centralized Session State Management (`AuthContext`):**
    *   Maintains global reactive authentication state: `user`, `isAuthenticated`, `loading`.
    *   Exposes secure asynchronous handlers: `login()`, `register()`, and `logout()`.
    *   Implements persistent session syncing with `localStorage` for automatic credentials recovery.
*   **Dual-Tier Route Guarding Firewall (`RouteGuards`):**
    *   `ProtectedRoute`: Protects the `/dashboard` workspace, blocking unauthenticated users and redirecting them to `/login`.
    *   `PublicOnlyRoute`: Prevents authenticated users from accessing guest pages like `/login` or `/register`, routing them directly back to `/dashboard`.
*   **Unified API Client Gateway (`axiosClient`):**
    *   Configured Axios instance with dynamic base URL settings.
    *   Configured automatic Request Interceptor to scan and inject client `Bearer <token>` headers on all API requests.
*   **Premium Brand UI Pages:**
    *   **Login View:** Professional dark/blue theme login screen with validation handlers and dynamic alert sections.
    *   **Registration View:** Emerald-themed sign-up interface equipped with length validations and clean, minimal form layout.
    *   Subtle hover state animations and smooth active scale transformations.
*   **Toast Notifications Integration:**
    *   Integrated `react-hot-toast` to provide premium micro-animation response notifications for successful or failed authentication requests.

---

### 📂 Day 3: Task Management Dashboard & Workspace Components
*   **Workspace Central Dashboard (`Dashboard.jsx`):**
    *   Integrates with the `AuthContext` to fetch and show user-specific profile parameters.
    *   Implements real-time workspace metrics: Assigned Backlog (total task count), Completed Segments (completed task count), and Awaiting Execution (pending task count).
    *   Implements interactive status filtering tabs (`All`, `Pending`, `Completed`).
    *   Implements client-side live search filtering on task titles and descriptions.
*   **Reusable Task Components (`TaskCard.jsx` & `TaskModal.jsx`):**
    *   `TaskCard`: Modern UI card with hover actions (edit, delete, toggle status), completion state styling (strike-through, dimmed background), and task metadata display (status badge, calendar date).
    *   `TaskModal`: A clean, responsive modal window for initiating new tasks or editing existing ones, complete with input validation, backdrop blur overlays, and keyframe scale/fade animations.
*   **Dynamic API Operations & Feedbacks:**
    *   Integrates Axios endpoints for fetching tasks, adding new tasks, modifying existing task parameters (title, description, status), and removing task resources (with confirm dialog protection).
    *   Leverages `react-hot-toast` for micro-animated client feedback alerts on all successful/failed CRUD state transitions.

---

### 📂 Day 4: "Quantum" UI/UX Redesign & Advanced Features
*   **"Quantum" Theme Redesign:**
    *   Full visual overhaul featuring dot-grid backgrounds, glassmorphism overlays, glowing accent borders, and gradient typography.
    *   Dynamic dark/light mode execution utilizing Tailwind v4 explicit class-based variance and custom CSS properties.
*   **Advanced State & Data Handling:**
    *   **Server-Side Pagination:** Re-engineered list rendering to support query-based server-side pagination with memoized component state tracking.
    *   **Bulk Operations:** Implemented interactive floating action bars for mass task deletions, completions, and priority reassignments.
*   **Analytics & Telemetry Components:**
    *   Engineered a lazy-loaded `AnalyticsDashboard` using raw SVG mathematics for high-performance pie and bar charts.
    *   Integrated deadline alert banners (Critical/Warning/Normal) tracking remaining hours and overdue states.
*   **Data Portability:**
    *   Added seamless JSON and CSV data export functionalities.
    *   Implemented JSON file parsing and automated batch-task generation for importing external states.

---

## 📂 Architecture & Directory Structure

```text
frontend/
├── src/
│   ├── api/
│   │   └── axiosClient.js     # Configured Axios client with automatic request interceptors (Day 2)
│   ├── components/
│   │   ├── RouteGuards.jsx    # ProtectedRoute and PublicOnlyRoute components (Day 2)
│   │   ├── TaskCard.jsx       # Interactive task item component displaying task state (Day 3)
│   │   └── TaskModal.jsx      # Modal form component for creating and editing tasks (Day 3)
│   ├── context/
│   │   └── AuthContext.jsx    # Centralized JWT authentication provider & custom hooks (Day 2)
│   ├── pages/
│   │   ├── Dashboard.jsx      # Interactive user task management workspace page (Day 3)
│   │   ├── Login.jsx          # Login portal page with validation and state integration (Day 2)
│   │   └── Register.jsx       # User registration page with safety guidelines (Day 2)
│   ├── App.jsx                # Main client router, route mappings, and global providers (Updated Day 3)
│   ├── index.css              # Main global stylesheets and Tailwind directives (Day 1)
│   └── main.jsx               # Entry node rendering the virtual React DOM (Day 1)
├── .env                       # Base URL API variables (Day 1)
├── package.json               # Dependency declarations (Day 1)
└── README.md                  # This documentation file
```

---

## ⚙️ Environment Configurations

Create a `.env` file in the root of the `frontend/` directory:

```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛠️ Tech Stack & Dependencies

*   **Framework Core:** [React (v18+)](https://react.dev/) & [Vite](https://vite.dev/)
*   **Routing System:** [React Router DOM (v6)](https://reactrouter.com/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Icons Library:** [Lucide React](https://lucide.dev/)
*   **User Notifications:** [React Hot Toast](https://react-hot-toast.com/)

---

## 💻 Local Setup & Execution

### 1. Installation
Navigate to the `frontend/` directory and install the necessary npm dependencies:
```bash
npm install
```

### 2. Running in Development Mode
Start the Vite local server:
```bash
npm run dev
```

The application will be served at `http://localhost:5173/` by default.
