import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminUsers from './pages/AdminUsers';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AllEvents from './pages/AllEvents';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import OrganizerEvents from './pages/OrganizerEvents';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EditEvent from './pages/EditEvent';

const LandingPage = () => {
  const { currentUser } = useContext(AuthContext);

  if (currentUser) {
    if (currentUser.role === 'admin') return <Navigate to="/admin-dashboard" />;
    if (currentUser.role === 'organizer') return <Navigate to="/organizer-dashboard" />;
    return <Navigate to="/student-dashboard" />;
  }

  return (
    <div style={{
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 10%'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', fontWeight: '800' }}>
        Next-Gen <span style={{ color: '#6366f1' }}>EventBuddy</span>
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        The complete project orchestration platform for managing events, registrations, and delivering verified certificates with seamless collaboration.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => window.location.href = '/register'} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          Get Started
        </button>
        <button onClick={() => window.location.href = '/login'} style={{
          padding: '16px 32px',
          fontSize: '1.1rem',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Live Demo
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Organizer Routes */}
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute role="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/create-event" element={
            <ProtectedRoute role="organizer">
              <CreateEvent />
            </ProtectedRoute>
          } />

          <Route path="/organizer-events" element={
            <ProtectedRoute role="organizer">
              <OrganizerEvents />
            </ProtectedRoute>
          } />

          <Route path="/edit-event/:id" element={
            <ProtectedRoute role="organizer">
              <EditEvent />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />

          <Route path="/admin/events" element={
            <ProtectedRoute role="admin">
              <AdminEvents />
            </ProtectedRoute>
          } />

          <Route path="/events" element={<AllEvents />} />
          <Route path="/events/:id" element={<EventDetail />} />

          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
