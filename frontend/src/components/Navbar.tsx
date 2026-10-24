import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  Sparkles, 
  LogOut, 
  User, 
  Target, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  Building2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, skillProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const readinessScore = skillProfile?.overallReadinessScore || 0;
  const isAssessed = skillProfile?.assessmentCompleted || false;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-300 bg-[#f9f5f0]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm group-hover:translate-y-[-1px] transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-heading text-lg font-semibold text-ink-900 tracking-tight">PlaceAI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                  Adaptive
                </span>
              </div>
              <p className="text-[11px] text-ink-500 hidden sm:block">AI Placement Prep Engine</p>
            </div>
          </Link>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/profile"
              className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-ink-700 hover:border-amber-300 transition-colors"
              title="Target Placement Company"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Target:</span>
              <span className="text-amber-700 font-semibold">{user.targetCompany || 'Google'}</span>
            </Link>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-stone-300 bg-white">
              <div className="relative flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${readinessScore >= 75 ? 'bg-success-500' : readinessScore >= 50 ? 'bg-amber-500' : 'bg-amber-300'} animate-ping opacity-75 absolute`}></div>
                <div className={`w-2.5 h-2.5 rounded-full ${readinessScore >= 75 ? 'bg-success-500' : readinessScore >= 50 ? 'bg-amber-500' : 'bg-amber-300'}`}></div>
              </div>
              <div className="text-xs">
                <span className="text-ink-500 font-medium mr-1 hidden sm:inline">Readiness:</span>
                <span className={`font-semibold ${readinessScore >= 75 ? 'text-success-500' : readinessScore >= 50 ? 'text-amber-700' : 'text-amber-600'}`}>
                  {isAssessed ? `${readinessScore}%` : 'Unassessed'}
                </span>
              </div>
            </div>

            {!isAssessed && (
              <Link
                to="/assessment"
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Take Diagnostic Test</span>
              </Link>
            )}

            <div className="flex items-center space-x-2 pl-2 border-l border-stone-300">
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-stone-100 text-ink-700 transition"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 object-cover"
                />
                <span className="text-xs font-medium text-ink-800 hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-ink-500 hover:text-amber-700 hover:bg-amber-50 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-medium text-ink-700 hover:text-ink-900 px-3 py-1.5 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
