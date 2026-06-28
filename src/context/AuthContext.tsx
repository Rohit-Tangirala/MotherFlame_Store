import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set Authorization header for Axios and fetch user profile if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Fetch /api/auth/me on initial load if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Session restore failed:', error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const newToken = response.data.token;
      setToken(newToken);
      // Fetch fresh /api/auth/me to get created_at
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      const meResponse = await axios.get('/api/auth/me');
      setUser(meResponse.data.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const newToken = response.data.token;
      setToken(newToken);
      // Fetch fresh /api/auth/me to get created_at
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      const meResponse = await axios.get('/api/auth/me');
      setUser(meResponse.data.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (name: string, email: string, password?: string) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/auth/profile', { name, email, password });
      const { token: newToken, user: updatedUser } = response.data;
      setToken(newToken);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
