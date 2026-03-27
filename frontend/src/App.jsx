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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Navbar />
        <Routes>
          {/* ... existing routes ... */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
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

          <Route path="/events" element={<AllEvents />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Smart Lost & Found Recovery Hub */}
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

          <Route path="/chat" element={
            <ProtectedRoute role={['student', 'admin', 'organizer']}>
              <ChatPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
