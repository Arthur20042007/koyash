import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { LandingPage } from './pages/Landing/LandingPage';
import Quiz from './pages/Quiz';
import Quick from './pages/Quick';
import Results from './pages/Results';
import Login from './pages/account/Login';
import Register from './pages/account/Register';
import Offer from './pages/account/Offer';
import ForgotPassword from './pages/account/ForgotPassword';
import ResetPassword from './pages/account/ResetPassword';
import Cabinet from './pages/account/Cabinet';
import ProfileSecurity from './pages/account/ProfileSecurity';
import HowItWorks from './pages/account/HowItWorks';
import AvatarPicker from './pages/account/AvatarPicker';
import Care from './pages/account/Care';
import Replace from './pages/account/Replace';
import Tracker from './pages/account/Tracker';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quick" element={<Quick />} />
          <Route path="/results" element={<Results />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Cabinet />} />
          <Route path="/account/security" element={<ProfileSecurity />} />
          <Route path="/account/how" element={<HowItWorks />} />
          <Route path="/account/avatar" element={<AvatarPicker />} />
          <Route path="/account/care" element={<Care />} />
          <Route path="/account/care/replace/:id" element={<Replace />} />
          <Route path="/account/tracker" element={<Tracker />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
