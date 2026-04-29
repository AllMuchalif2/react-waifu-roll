import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import Waifus from './pages/public/Waifus';
import Changelog from './pages/public/Changelog';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Player Pages
import PlayerDashboard from './pages/player/PlayerDashboard';
import Gacha from './pages/player/Gacha';
import History from './pages/player/History';
import Rank from './pages/player/Rank';
import Suggestions from './pages/player/Suggestions';

// Admin Pages
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWaifus from './pages/admin/AdminWaifus';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/waifus" element={<Waifus />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/changelog" element={<Changelog />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Player Routes (Sudah ada proteksi di dalam komponen) */}
          <Route path="/dashboard" element={<PlayerDashboard />} />
          <Route path="/gacha" element={<Gacha />} />
          <Route path="/history" element={<History />} />
          <Route path="/suggestions" element={<Suggestions />} />

          {/* Admin Routes (Proteksi Level Route) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/waifus"
            element={
              <AdminRoute>
                <AdminWaifus />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/suggestions"
            element={
              <AdminRoute>
                <AdminSuggestions />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
