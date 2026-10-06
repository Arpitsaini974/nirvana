import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Team from './pages/Team';
import MemberVerification from './pages/MemberVerification';
import Alumni from './pages/Alumni';
import AlumniProfile from './pages/AlumniProfile';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfessors from './pages/admin/AdminProfessors';
import AdminTeam from './pages/admin/AdminTeam';
import AdminAlumni from './pages/admin/AdminAlumni';

// Layout wrapper for public pages with Navbar & Footer
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#2B231D]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            
            {/* Public Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/team/:id" element={<MemberVerification />} />
              <Route path="/member/:memberId" element={<MemberVerification />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/alumni/:id" element={<AlumniProfile />} />
            </Route>

            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Console Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="professors" element={<AdminProfessors />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="alumni" element={<AdminAlumni />} />
            </Route>

            {/* 404 Fallback */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
