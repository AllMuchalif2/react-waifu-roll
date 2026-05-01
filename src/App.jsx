import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Public Pages
import Home from './pages/public/Home';
import Waifus from './pages/public/Waifus';
import Changelog from './pages/public/Changelog';
import NotFound from './pages/public/NotFound';

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
import Album from './pages/player/Album';

// Admin Pages
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWaifus from './pages/admin/AdminWaifus';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import GachaSimulator from './pages/admin/GachaSimulator';
import AdminSettings from './pages/admin/Settings';
import RickRedirect from './components/RickRedirect';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              border: '2px solid #1a1a1a',
              padding: '16px',
              color: '#1a1a1a',
              fontWeight: '900',
              borderRadius: '12px',
              boxShadow: '4px 4px 0px #1a1a1a',
              background: '#fff',
            },
          }}
        />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/waifus" element={<Waifus />} />
              <Route path="/rank" element={<Rank />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/free" element={<RickRedirect />} />

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
              <Route path="/album" element={<Album />} />

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
              <Route
                path="/admin/simulator"
                element={
                  <AdminRoute>
                    <GachaSimulator />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
