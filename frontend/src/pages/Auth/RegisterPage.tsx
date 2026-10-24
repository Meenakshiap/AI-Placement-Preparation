import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { BrainCircuit, Sparkles, ArrowRight, Lock, Mail, User, Building2, Briefcase, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Goldman Sachs', 'Wipro', 'Accenture'];
const ROLES = [
  'Software Development Engineer (SDE-1)',
  'Full Stack Software Engineer',
  'Data Analyst / Data Engineer',
  'DevOps & Cloud Engineer',
  'Systems / Specialist Programmer'
];
const TECH_OPTIONS = ['Python', 'Java', 'JavaScript', 'C++', 'SQL', 'TypeScript', 'Go'];

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [preferredTechStack, setPreferredTechStack] = useState<string[]>(['Python', 'JavaScript']);
  const [experienceLevel, setExperienceLevel] = useState<'Final Year' | 'Pre-final Year' | 'Fresher' | '1-2 Years'>('Final Year');
  const [graduationYear, setGraduationYear] = useState(2026);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleTech = (tech: string) => {
    if (preferredTechStack.includes(tech)) {
      if (preferredTechStack.length > 1) {
        setPreferredTechStack(preferredTechStack.filter(t => t !== tech));
      }
    } else {
      setPreferredTechStack([...preferredTechStack, tech]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await register({
      name,
      email,
      password,
      targetCompany,
      targetRole,
      preferredTechStack,
      experienceLevel,
      graduationYear
    });

    setIsSubmitting(false);

    if (res.success) {
      // Direct newly registered candidates to diagnostic baseline assessment!
      navigate('/assessment');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 shadow-soft mb-3">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Create Your Placement Profile</h1>
          <p className="text-sm text-ink-500 mt-1">Configure your dream company goals to generate an adaptive syllabus</p>
        </div>

        {/* Card Body */}
        <div className="panel rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-warn-100 border border-warn-500/20 text-warn-500 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-warn-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@university.edu"
                    className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                />
              </div>
            </div>

            {/* Target Company & Role Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line-100">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Target Company</span>
                </label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                >
                  {COMPANIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span>Target Role</span>
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Graduation Year & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5 flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Experience / Year</span>
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e: any) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                >
                  <option value="Final Year">Final Year (Graduating Soon)</option>
                  <option value="Pre-final Year">Pre-final Year</option>
                  <option value="Fresher">Recent Graduate (Fresher)</option>
                  <option value="1-2 Years">1-2 Years Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1.5">Graduation Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  min={2024}
                  max={2030}
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                />
              </div>
            </div>

            {/* Preferred Tech Stack Chips */}
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-2">
                Preferred Tech Stack (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map(tech => {
                  const isSelected = preferredTechStack.includes(tech);
                  return (
                    <button
                      type="button"
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-amber-500 text-white border border-amber-500 shadow-sm'
                          : 'bg-stone-100 text-ink-500 border border-line-100 hover:border-amber-300 hover:text-ink-800'
                      }`}
                    >
                      {tech} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-4 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account & Start Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-700 hover:text-amber-800 font-semibold ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
