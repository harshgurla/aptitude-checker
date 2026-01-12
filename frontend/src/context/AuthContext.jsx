import React, { createContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setLoading, logout as logoutAction, setCredentials } from '../store/slices/authSlice';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          dispatch(setUser(userData));
        } catch (err) {
          console.error('Failed to parse user from storage:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      dispatch(setLoading(false));
    };

    initAuth();
  }, [dispatch]);

  const login = (token, userData) => {
    dispatch(setCredentials({ token, user: userData }));
  };

  const refreshUser = async () => {
    try {
      if (!token) return;
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updatedUser = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        currentStreak: response.data.currentStreak,
        bestStreak: response.data.bestStreak,
        totalCorrect: response.data.totalCorrect,
      };
      
      dispatch(setUser(updatedUser));
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
