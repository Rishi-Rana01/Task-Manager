import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import { Component } from 'react';
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error('[ErrorBoundary]', err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800">Something went wrong</h1>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            An unexpected error occurred. Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Toaster must be inside ThemeProvider so useTheme() works
function ToasterWithTheme() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-center"
      containerStyle={{ zIndex: 999999, top: 40 }}
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
          borderRadius: '12px',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(129,140,248,0.2)'
            : '0 8px 32px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.1)',
          background: isDark ? '#0d1526' : '#ffffff',
          color:      isDark ? '#e2e8f0' : '#0f172a',
          border:     isDark ? '1px solid rgba(129,140,248,0.25)' : '1px solid rgba(99,102,241,0.15)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: isDark ? '#0d1526' : '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: isDark ? '#0d1526' : '#fff' },
        },
        loading: {
          iconTheme: { primary: '#6366f1', secondary: isDark ? '#0d1526' : '#fff' },
        },
      }}
    />
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {/* ToasterWithTheme is inside ThemeProvider so useTheme() is available */}
            <ToasterWithTheme />
            <Routes>
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login"    element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;