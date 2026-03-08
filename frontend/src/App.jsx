import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"     element={!user ? <LoginPage />    : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
      <Route path="/register"  element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<PrivateRoute role="user"><UserDashboard /></PrivateRoute>} />
      <Route path="/admin"     element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
      <Route path='/settings' element={<PrivateRoute role='admin'><SettingsPage /></PrivateRoute>} />
      <Route path="*"          element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}