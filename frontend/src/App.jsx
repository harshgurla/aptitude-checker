import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navigation } from './components/Navigation';
import { PrivateRoute } from './components/PrivateRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TestPage } from './pages/TestPage';
import { ResultsPage } from './pages/ResultsPage';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRole="student">
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/test"
            element={
              <PrivateRoute requiredRole="student">
                <TestPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/results/:testId"
            element={
              <PrivateRoute requiredRole="student">
                <ResultsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<div className="text-center py-20">Page not found</div>} />
        </Routes>
      </AuthProvider>      </ThemeProvider>    </BrowserRouter>
  );
}

export default App;
