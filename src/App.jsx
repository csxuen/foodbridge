import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/AppDataContext';
import { ToastProvider } from './contexts/ToastContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ErrorBoundary } from './ErrorBoundary';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role } = useAuth();
  if (!user || role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import React, { useEffect } from 'react';

// ... (in App component)
function App() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <AuthProvider>
      <AppDataProvider>
        <ToastProvider>
          <ErrorBoundary>
          <div className="min-h-screen bg-background font-body text-textDark selection:bg-primary-tint selection:text-primary-dark">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Sign-up onboarding wizard */}
                <Route path="/register" element={
                  <OnboardingProvider>
                    <RegisterPage />
                  </OnboardingProvider>
                } />

                {/* Protected Routes */}
                <Route path="/donor" element={
                  <ProtectedRoute allowedRole="donor">
                    <DonorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/receiver" element={
                  <ProtectedRoute allowedRole="receiver">
                    <ReceiverDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </div>
          </ErrorBoundary>
        </ToastProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
