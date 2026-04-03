// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminEvents from './pages/AdminEvents';
import AdminLostFound from './pages/AdminLostFound';
import AllEvents from './pages/AllEvents';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import OrganizerEvents from './pages/OrganizerEvents';
import LostAndFoundFeed from './pages/LostAndFoundFeed';
import ReportItem from './pages/ReportItem';
import ChatPage from './pages/ChatPage';
import AuditLogs from './pages/AuditLogs';
import Gallery from './pages/Gallery';
import VolunteerRegistration from './pages/VolunteerRegistration';

// Booking Engine pages (Induwari's module)
import MyBookings from './pages/bookings/MyBookings';
import BookingDetail from './pages/bookings/BookingDetail';
import CheckIn from './pages/bookings/CheckIn';
import AdminBookings from './pages/bookings/AdminBookings';

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
  const { loading } = useContext(AuthContext);
  if (loading) return null;
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
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  
  if (currentUser.role === 'admin' || currentUser.role === 'organizer') {
    return <DashboardLayout />;
  }
  return <MainLayout />;
};

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          {/* Public Routes with Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<AllEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Auth Routes (No Navbar for Login/Register usually, but MainLayout is fine if preferred) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Dedicated Routes (MainLayout) */}
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
            {/* Booking Engine for Students */}
            <Route path="/my-bookings" element={
              <ProtectedRoute role="student">
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/volunteer-register" element={
              <ProtectedRoute role="student">
                <VolunteerRegistration />
              </ProtectedRoute>
            } />
          </Route>

          {/* Organizer Dedicated Routes (DashboardLayout) */}
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

          {/* Admin Dedicated Routes (DashboardLayout) */}
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
            <Route path="/admin/bookings" element={
              <ProtectedRoute role="admin">
                <AdminBookings />
              </ProtectedRoute>
            } />
          </Route>

          {/* Common Protected Routes (Dynamic Layout) */}
          <Route element={<CommonLayoutWrapper />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/bookings/:bookingId" element={<BookingDetail />} />
            <Route path="/checkin" element={<CheckIn />} />
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
