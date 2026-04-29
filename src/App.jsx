import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Placeholder Pages sementara (Nanti kita pisah ke folder src/pages/...)
const Home = () => (
  <div className="p-4 text-center mt-10">
    <h1>Halaman Beranda</h1>
  </div>
);
const Pool = () => (
  <div className="p-4 text-center mt-10">
    <h1>Waifu Pool</h1>
  </div>
);
const Login = () => (
  <div className="p-4 text-center mt-10">
    <h1>Login</h1>
  </div>
);
const Register = () => (
  <div className="p-4 text-center mt-10">
    <h1>Register</h1>
  </div>
);
const AdminLogin = () => (
  <div className="p-4 text-center mt-10">
    <h1>Admin Login</h1>
  </div>
);

const PlayerDashboard = () => (
  <div className="p-4 text-center mt-10">
    <h1>Player Dashboard</h1>
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

const AdminDashboard = () => (
  <div className="p-4 text-center mt-10">
    <h1>Admin Dashboard</h1>
  </div>
);
const AdminWaifus = () => (
  <div className="p-4 text-center mt-10">
    <h1>Kelola Waifu</h1>
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
