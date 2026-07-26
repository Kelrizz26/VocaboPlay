import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from './context/ThemeContext';

// Route-level code splitting
const LandingPage = lazy(() => import("./components/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Admindashboard = lazy(() => import("./components/Admindashboard"));
const Profile = lazy(() => import('./components/Profile'));

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
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Student Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Admin Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Admindashboard />} />
            
            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;