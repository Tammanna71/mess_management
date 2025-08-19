import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundry';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardStudent from './pages/DashboardStudent';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Messes from './pages/Messes';
import MessDetails from './pages/MessDetails';
import MealSlots from './pages/MealSlots';
import Bookings from './pages/Bookings';
import BookingHistory from './pages/BookingHistory';
import Coupons from './pages/Coupons';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import RoleTest from './pages/RoleTest';
import PermissionTest from './pages/PermissionTest';
import HomePage from './pages/HomePage';

// Component to handle authenticated dashboard redirect
const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while auth is being checked
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = user.is_superuser || user.is_staff;

  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/student" replace />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Don't show navigation on auth pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const showNavigation = isAuthenticated && !isAuthPage && !loading;

  return (
    <>
      {showNavigation && <Navigation />}
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route path="/admin" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><DashboardAdmin /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute requiredRoles={["student"]}><DashboardStudent /></ProtectedRoute>} />

        {/* User Management */}
        <Route path="/users" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><Users /></ProtectedRoute>} />
        <Route path="/user/:userId" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><UserDetails /></ProtectedRoute>} />

        {/* Mess Management */}
        <Route path="/messes" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><Messes /></ProtectedRoute>} />
        <Route path="/mess/:messId" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><MessDetails /></ProtectedRoute>} />

        {/* Meal Slots */}
        <Route path="/meal-slots" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><MealSlots /></ProtectedRoute>} />

        {/* Bookings */}
        <Route path="/bookings" element={<ProtectedRoute requiredRoles={["student", "admin", "superuser"]}><Bookings /></ProtectedRoute>} />
        <Route path="/booking-history" element={<ProtectedRoute requiredRoles={["student", "admin", "superuser"]}><BookingHistory /></ProtectedRoute>} />

        {/* Coupons */}
        <Route path="/coupons" element={<ProtectedRoute requiredRoles={["student", "admin", "superuser"]}><Coupons /></ProtectedRoute>} />

        {/* Notifications */}
        <Route path="/notifications" element={<ProtectedRoute requiredRoles={["student", "admin", "superuser"]}><Notifications /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><Reports /></ProtectedRoute>} />

        {/* Audit Logs */}
        <Route path="/audit-logs" element={<ProtectedRoute requiredRoles={["admin", "superuser"]}><AuditLogs /></ProtectedRoute>} />

        {/* Profile */}
        <Route path="/profile" element={<ProtectedRoute requiredRoles={["student", "admin", "superuser"]}><Profile /></ProtectedRoute>} />

        {/* Role/Permission Test */}
        <Route path="/role-test" element={<ProtectedRoute><RoleTest /></ProtectedRoute>} />
        <Route path="/permission-test" element={<ProtectedRoute><PermissionTest /></ProtectedRoute>} />

        {/* Home Page and Default routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;