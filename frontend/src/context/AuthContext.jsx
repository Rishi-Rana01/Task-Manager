import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('task_app_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('task_app_token');
    localStorage.removeItem('task_app_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          setIsAuthenticated(true);
          const savedUser = localStorage.getItem('task_app_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        } catch (err) {
          console.log('Error initializing authentication:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token]);

  // 3. Keep registration and login handlers below
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/register', { name, email, password });
      const { data } = response.data;

      localStorage.setItem('task_app_token', data.token);
      localStorage.setItem('task_app_user', JSON.stringify({ name: data.name, email: data.email }));

      setToken(data.token);
      setUser({ name: data.name, email: data.email });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { data } = response.data;

      localStorage.setItem('task_app_token', data.token);
      localStorage.setItem('task_app_user', JSON.stringify({ name: data.name, email: data.email }));

      setToken(data.token);
      setUser({ name: data.name, email: data.email });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email credentials or password.'
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);