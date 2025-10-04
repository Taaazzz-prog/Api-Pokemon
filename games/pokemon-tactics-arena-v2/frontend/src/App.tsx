import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/RealAuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPageNew from './pages/DashboardPageNew';
import RosterPageNew from './pages/RosterPageNew';
import ShopPageReal from './pages/ShopPageReal';
import TeamBuilderPage from './pages/TeamBuilderPage';
import BattlePage from './pages/BattlePage';
import ArenaPageNew from './pages/ArenaPageNew';
import TournamentsPage from './pages/TournamentsPage';
import SurvivalPage from './pages/SurvivalPage';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './styles/globals.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPageNew />} />
                <Route path="roster" element={<RosterPageNew />} />
                <Route path="shop" element={<ShopPageReal />} />
                <Route path="team-builder" element={<TeamBuilderPage />} />
                <Route path="battle" element={<BattlePage />} />
                <Route path="arena" element={<ArenaPageNew />} />
                <Route path="tournaments" element={<TournamentsPage />} />
                <Route path="survival" element={<SurvivalPage />} />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
                success: {
                  style: {
                    background: '#065f46',
                    color: '#ecfdf5',
                    border: '1px solid #10b981',
                  },
                },
                error: {
                  style: {
                    background: '#7f1d1d',
                    color: '#fef2f2',
                    border: '1px solid #ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;