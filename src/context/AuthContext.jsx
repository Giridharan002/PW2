import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

export const AuthContext = createContext(null);

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      validateSession(sessionId);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (sessionId) => {
    try {
      const response = await axios.get(`/api/auth/session/${sessionId}`);
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('sessionId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, name) => {
    console.log('AuthContext login called with:', { email, name });
    try {
      setError(null);
      console.log('Making API call to:', axios.defaults.baseURL + '/api/auth/login');
      const response = await axios.post('/api/auth/login', { email, name });
      console.log('API response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('sessionId', userData.sessionId);
        console.log('Login successful, user data:', userData);
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await axios.post('/api/auth/logout', { sessionId });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('sessionId');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
