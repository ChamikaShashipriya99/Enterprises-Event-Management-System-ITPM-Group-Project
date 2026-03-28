import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
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
import AdminLostFound from './pages/AdminLostFound';
import AllEvents from './pages/AllEvents';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import OrganizerEvents from './pages/OrganizerEvents';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EditEvent from './pages/EditEvent';
import VerifyEmail from './pages/VerifyEmail';
import LostAndFoundFeed from './pages/LostAndFoundFeed';
import ReportItem from './pages/ReportItem';
import ChatPage from './pages/ChatPage';
import AuditLogs from './pages/AuditLogs';
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';

// Layout Wrappers
const MainLayout = () => (
  <>
    <Navbar />
    <div className="main-content-wrapper">
      <Outlet />
    </div>
  </>
);

const DashboardLayout = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) return null; // Wait for auth to initialize
  
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <Outlet />
      </main>
    </div>
  );
};

// A smart wrapper to decide the layout for common pages like Profile/Chat
const CommonLayoutWrapper = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) return null; // Wait for auth to initialize
  
  if (!currentUser) return <Navigate to="/login" replace />;
  
  if (currentUser.role === 'admin' || currentUser.role === 'organizer') {
    return <DashboardLayout />;
  }
  return <MainLayout />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Routes (No Navbar/Layout or custom for Landing) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/events" element={<AllEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />
          </Route>

          {/* Student Dedicated Routes */}
          <Route element={<MainLayout />}>
            <Route path="/student-dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lost-and-found" element={
              <ProtectedRoute>
                <LostAndFoundFeed />
              </ProtectedRoute>
            } />
            <Route path="/report-item" element={
              <ProtectedRoute>
                <ReportItem />
              </ProtectedRoute>
            } />
          </Route>

          {/* Organizer Dedicated Routes */}
          <Route element={<DashboardLayout />}>
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
          </Route>

          {/* Admin Dedicated Routes */}
          <Route element={<DashboardLayout />}>
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
            <Route path="/admin/lost-found" element={
              <ProtectedRoute role="admin">
                <AdminLostFound />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute role="admin">
                <AuditLogs />
              </ProtectedRoute>
            } />
          </Route>

          {/* Common Protected Routes (Dynamic Layout) */}
          <Route element={<CommonLayoutWrapper />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* Standard Lost and Found for Organizer/Admin too if needed */}
            <Route path="/lost-and-found" element={<LostAndFoundFeed />} />
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
