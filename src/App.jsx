import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from './context/ThemeContext';

const LandingPage = lazy(() => import("./components/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const Profile = lazy(() => import('./components/Profile'));

// ✅ ITO YUNG MGA BAGONG IMPORTS!
const SuperAdminLogin = lazy(() => import("./pages/SuperAdminLogin"));
const SuperAdminDashboard = lazy(() => import("./components/SuperAdminDashboard"));

// 🔧 TEMPORARY — CEFR Migration Tool (DELETE AFTER USE)
const AdminMigrate = lazy(() => import("./pages/AdminMigrate"));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--color-bg)',
    color: 'var(--color-text-secondary)',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* ✅ MGA ROUTES PARA SA SUPER ADMIN! */}
            <Route path="/super-admin-login" element={<SuperAdminLogin />} />
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            
            {/* 🔧 TEMPORARY — DELETE THIS ROUTE AFTER MIGRATION */}
            <Route path="/admin-migrate" element={<AdminMigrate />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 
