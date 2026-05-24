import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminCatalogPage from "./pages/AdminCatalogPage";
import AdminModuleDetailPage from "./pages/AdminModuleDetailPage";
import AdminAddModulePage from "./pages/AdminAddModulePage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentCatalogPage from "./pages/StudentCatalogPage";
import StudentModuleDetailPage from "./pages/StudentModuleDetailPage";
import NoteDetailPage from "./pages/NoteDetailPage";
import EditProfilePage from "./pages/EditProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-surface-page">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/admin/modules" element={<ProtectedRoute role="ADMIN"><AdminCatalogPage /></ProtectedRoute>} />
              <Route path="/admin/modules/new" element={<ProtectedRoute role="ADMIN"><AdminAddModulePage /></ProtectedRoute>} />
              <Route path="/admin/modules/:id" element={<ProtectedRoute role="ADMIN"><AdminModuleDetailPage /></ProtectedRoute>} />

              <Route path="/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboardPage /></ProtectedRoute>} />
              <Route path="/modules" element={<ProtectedRoute role="STUDENT"><StudentCatalogPage /></ProtectedRoute>} />
              <Route path="/modules/:id" element={<ProtectedRoute role="STUDENT"><StudentModuleDetailPage /></ProtectedRoute>} />
              <Route path="/notes/:moduleId" element={<ProtectedRoute role="STUDENT"><NoteDetailPage /></ProtectedRoute>} />

              <Route path="/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
