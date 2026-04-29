import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import Pool from './pages/public/Pool';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Player Pages
import PlayerDashboard from './pages/player/PlayerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWaifus from './pages/admin/AdminWaifus';

// Placeholder Pages sementara (Nanti kita pisah ke folder src/pages/...)
const AdminLogin = () => (
  <div className="p-4 text-center mt-10">
    <h1>Admin Login</h1>
  </div>
);

const RollGacha = () => (
  <div className="p-4 text-center mt-10">
    <h1>Roll Gacha</h1>
  </div>
);
const History = () => (
  <div className="p-4 text-center mt-10">
    <h1>Gacha History</h1>
  </div>
);
const Scoreboard = () => (
  <div className="p-4 text-center mt-10">
    <h1>Scoreboard</h1>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pool" element={<Pool />} />
          <Route path="/scoreboard" element={<Scoreboard />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Player Routes (Nanti kita proteksi khusus yang sudah login) */}
          <Route path="/dashboard" element={<PlayerDashboard />} />
          <Route path="/roll" element={<RollGacha />} />
          <Route path="/history" element={<History />} />

          {/* Admin Routes (Nanti kita proteksi khusus admin) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/waifus" element={<AdminWaifus />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
