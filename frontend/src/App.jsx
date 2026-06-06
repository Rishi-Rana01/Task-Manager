import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';


const MockDashboard = () => {
  const { logout, user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Secure Dashboard Panel</h1>
      <p className="text-slate-600 mt-1">Authenticated user: {user?.email}</p>
      <button onClick={logout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
        Terminate Session (Logout)
      </button>
    </div>
  );
};

import { useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Elite Toast Notification Engine */}
        <Toaster position="top-right" reverseOrder={false} />
        
        <Routes>
          {/* Guest Access Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Secure Firewall Auth Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MockDashboard />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;