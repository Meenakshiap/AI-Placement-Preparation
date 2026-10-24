import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { LoginPage } from './pages/Auth/LoginPage.js';
import { RegisterPage } from './pages/Auth/RegisterPage.js';
import { ProfilePage } from './pages/Profile/ProfilePage.js';
import { DiagnosticAssessmentPage } from './pages/Assessment/DiagnosticAssessmentPage.js';
import { DashboardPage } from './pages/Dashboard/DashboardPage.js';
import { LanguageLearnPage } from './pages/LanguageLearn/LanguageLearnPage.js';
import { TrackPage } from './pages/LanguageLearn/TrackPage.js';
import { CodingPracticePage } from './pages/CodingPractice/CodingPracticePage.js';
import { ProblemPage } from './pages/CodingPractice/ProblemPage.js';
import { AptitudePage } from './pages/Aptitude/AptitudePage.js';
import { CompanyPrepPage } from './pages/CompanyPrep/CompanyPrepPage.js';
import { AIInterviewPage } from './pages/AIInterview/AIInterviewPage.js';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center space-y-4 text-ink-900">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-xs text-ink-600 font-medium">Initializing Placement OS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-ink-900">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-stone-100 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-ink-900">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-stone-100">
        {children}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/assessment" element={<ProtectedLayout><DiagnosticAssessmentPage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
          <Route path="/learn" element={<ProtectedLayout><LanguageLearnPage /></ProtectedLayout>} />
          <Route path="/learn/:trackId" element={<ProtectedLayout><TrackPage /></ProtectedLayout>} />
          <Route path="/coding" element={<ProtectedLayout><CodingPracticePage /></ProtectedLayout>} />
          <Route path="/coding/:problemId" element={<ProtectedLayout><ProblemPage /></ProtectedLayout>} />
          <Route path="/aptitude" element={<ProtectedLayout><AptitudePage /></ProtectedLayout>} />
          <Route path="/company-prep" element={<ProtectedLayout><CompanyPrepPage /></ProtectedLayout>} />
          <Route path="/interview" element={<ProtectedLayout><AIInterviewPage /></ProtectedLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
