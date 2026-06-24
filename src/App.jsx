import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import Bills from './pages/Bills';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import About from './pages/About';
import PlaceholderPage from './pages/PlaceholderPage';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EditEvent from './pages/EditEvent';
import AddEvent from './pages/AddEvent';
import LostAndFound from './pages/LostAndFound';
import LostItems from './pages/LostItems';
import ViewUsers from './pages/ViewUsers';
import PostAnnouncement from './pages/PostAnnouncement';
import ViewAnnouncements from './pages/ViewAnnouncements';
import VisitorLog from './pages/VisitorLog';
import PastVisitors from './pages/PastVisitors';
import DeliveryReminder from './pages/DeliveryReminder';
import DeliveryLog from './pages/DeliveryLog';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
          </Route>
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/edit/:id" element={<EditEvent />} />
            <Route path="/events/past" element={<Events isPast={true} />} />
            <Route path="/events/add" element={<AddEvent />} />
            <Route path="/lost-and-found" element={<LostAndFound />} />
            <Route path="/lost-items" element={<LostItems />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/users" element={<ViewUsers />} />
            <Route path="/admin/announcement/add" element={<PostAnnouncement />} />
            <Route path="/admin/announcements" element={<ViewAnnouncements />} />
            
            {/* Security Routes */}
            <Route path="/security/visitor-log" element={<VisitorLog />} />
            <Route path="/security/past-visitors" element={<PastVisitors />} />
            <Route path="/security/delivery-reminder" element={<DeliveryReminder />} />
            <Route path="/security/delivery-log" element={<DeliveryLog />} />
            <Route path="/security/announcements" element={<ViewAnnouncements />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
