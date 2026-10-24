import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { ICompanyBlueprint } from '../../types/index.js';
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Target, 
  Sparkles,
  Layers,
  ArrowRight,
  Activity,
  BrainCircuit,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TECH_OPTIONS = ['Python', 'Java', 'JavaScript', 'C++', 'SQL', 'TypeScript', 'Go'];
type ProgressTrack = 'programming' | 'aptitude';

interface ActivityRecord {
  date: string;
  solvedCount: number;
  attemptedCount: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface TrackStats {
  score: number;
  attempted: number;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  activeDays: number;
  activity: number[];
}

const emptyStats = (): TrackStats => ({
  score: 0,
  attempted: 0,
  solved: 0,
  easy: 0,
  medium: 0,
  hard: 0,
  activeDays: 0,
  activity: Array(84).fill(0)
});

const buildStats = (
  activity: ActivityRecord[],
  fallbackScore: number
): TrackStats => {
  const stats = emptyStats();
  stats.attempted = activity.reduce((total, day) => total + day.attemptedCount, 0);
  stats.solved = activity.reduce((total, day) => total + day.solvedCount, 0);
  stats.score = stats.attempted ? Math.round((stats.solved / stats.attempted) * 100) : fallbackScore;
  activity.forEach((day, index) => {
    stats.easy += day.difficulty.easy;
    stats.medium += day.difficulty.medium;
    stats.hard += day.difficulty.hard;
    stats.activity[index] = day.attemptedCount;
  });
  stats.activeDays = stats.activity.filter(value => value > 0).length;
  return stats;
};

const ProgressTrackCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  stats: TrackStats;
}> = ({ title, description, icon, accentClass, stats }) => (
  <div className="panel rounded-2xl p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentClass}`}>{icon}</div>
        <div>
          <h3 className="font-bold text-ink-900">{title}</h3>
          <p className="text-[11px] text-ink-500 mt-0.5">{description}</p>
        </div>
      </div>
      <span className="text-2xl font-bold text-ink-900">{stats.score}%</span>
    </div>

    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
      <div className="rounded-xl bg-stone-100 p-2.5">
        <p className="text-lg font-bold text-ink-900">{stats.solved}</p>
        <p className="text-[10px] uppercase tracking-wide text-ink-500">Solved</p>
      </div>
      <div className="rounded-xl bg-stone-100 p-2.5">
        <p className="text-lg font-bold text-ink-900">{stats.attempted}</p>
        <p className="text-[10px] uppercase tracking-wide text-ink-500">Attempted</p>
      </div>
      <div className="rounded-xl bg-stone-100 p-2.5">
        <p className="text-lg font-bold text-ink-900">{stats.activeDays}</p>
        <p className="text-[10px] uppercase tracking-wide text-ink-500">Active days</p>
      </div>
    </div>

    <div className="mt-4">
      <div className="flex justify-between text-[11px] text-ink-500 mb-1.5">
        <span>Overall progress</span>
        <span>{stats.solved}/{stats.attempted || 0} correct</span>
      </div>
      <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
        <div className={`h-full rounded-full ${accentClass.split(' ')[0]}`} style={{ width: `${stats.score}%` }} />
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between text-[11px]">
      <span className="text-emerald-600">Easy {stats.easy}</span>
      <span className="text-amber-600">Medium {stats.medium}</span>
      <span className="text-rose-600">Hard {stats.hard}</span>
    </div>

    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-ink-700">Activity · last 12 weeks</span>
        <span className="text-[10px] text-ink-500">{stats.activeDays} active days</span>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {stats.activity.map((value, index) => (
          <div
            key={index}
            title={`${value} ${title.toLowerCase()} attempt${value === 1 ? '' : 's'}`}
            className={`h-3 rounded-[3px] ${
              value === 0 ? 'bg-stone-200' : value === 1 ? 'bg-emerald-200' : value <= 3 ? 'bg-emerald-400' : 'bg-emerald-600'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { user, skillProfile, updateUser, updateProfileState } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [targetCompany, setTargetCompany] = useState(user?.targetCompany || 'Google');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer (SDE-1)');
  const [preferredTechStack, setPreferredTechStack] = useState<string[]>(user?.preferredTechStack || ['Python', 'JavaScript']);
  const [experienceLevel, setExperienceLevel] = useState<any>(user?.experienceLevel || 'Final Year');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || 2026);
  const [college, setCollege] = useState(user?.college || 'National Institute of Technology');

  const [companies, setCompanies] = useState<ICompanyBlueprint[]>([]);
  const [selectedCompanyData, setSelectedCompanyData] = useState<ICompanyBlueprint | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programmingStats, setProgrammingStats] = useState<TrackStats>(emptyStats);
  const [aptitudeStats, setAptitudeStats] = useState<TrackStats>(emptyStats);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [programming, aptitude] = await Promise.all([
          api.getActivity('programming'),
          api.getActivity('aptitude')
        ]);

        if (programming.success && Array.isArray(programming.activity)) {
          setProgrammingStats(buildStats(programming.activity, Math.round(
            ((skillProfile?.categories.languages || 0) +
              (skillProfile?.categories.dsa || 0) +
              (skillProfile?.categories.coreCs || 0)) / 3
          )));
        }
        if (aptitude.success && Array.isArray(aptitude.activity)) {
          setAptitudeStats(buildStats(aptitude.activity, skillProfile?.categories.aptitude || 0));
        }
      } catch (err) {
        console.error('Error fetching progress activity', err);
      }
    };
    fetchProgress();
  }, [skillProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTargetCompany(user.targetCompany);
      setTargetRole(user.targetRole);
      setPreferredTechStack(user.preferredTechStack || ['Python', 'JavaScript']);
      setExperienceLevel(user.experienceLevel || 'Final Year');
      setGraduationYear(user.graduationYear || 2026);
      setCollege(user.college || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.getCompanies();
        if (res.success && res.companies) {
          setCompanies(res.companies);
          const found = res.companies.find((c: ICompanyBlueprint) => c.name.toLowerCase() === (user?.targetCompany || 'google').toLowerCase());
          setSelectedCompanyData(found || res.companies[0]);
        }
      } catch (err) {
        console.error('Error fetching companies', err);
      }
    };
    fetchCompanies();
  }, [user?.targetCompany]);

  const handleCompanyChange = (companyName: string) => {
    setTargetCompany(companyName);
    const found = companies.find(c => c.name === companyName);
    if (found) {
      setSelectedCompanyData(found);
      if (found.targetRoles && found.targetRoles.length > 0) {
        setTargetRole(found.targetRoles[0]);
      }
    }
  };

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
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await api.updateProfile({
        name,
        targetCompany,
        targetRole,
        preferredTechStack,
        experienceLevel,
        graduationYear,
        college
      });

      if (res.success && res.user) {
        updateUser(res.user);
        if (res.skillProfile) {
          updateProfileState(res.skillProfile);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Placement Profile & Targets</h1>
          <p className="text-sm text-ink-500 mt-1">
            Configure your target placement company, primary tech stack, and evaluation benchmark.
          </p>
        </div>
        
        {/* Status CTA */}
        {skillProfile?.assessmentCompleted ? (
          <div className="flex items-center space-x-3 bg-success-100 border border-success-500/20 px-4 py-2 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
            <div>
              <p className="font-semibold text-success-500">Baseline Assessment Calibrated</p>
              <p className="text-ink-500">Readiness Score: {skillProfile.overallReadinessScore}%</p>
            </div>
            <Link
              to="/assessment"
              className="ml-2 text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2"
            >
              Retake
            </Link>
          </div>
        ) : (
          <Link
            to="/assessment"
            className="btn-primary flex items-center space-x-2 font-bold px-4 py-2.5 rounded-xl text-xs transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Take Diagnostic Assessment</span>
          </Link>
        )}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-amber-600" />
          <div>
            <h2 className="text-sm font-bold text-ink-900">Candidate Progress Tracks</h2>
            <p className="text-xs text-ink-500">Programming and aptitude progress are tracked separately.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressTrackCard
            title="Programming"
            description="Coding, languages, DSA and core computer science"
            icon={<Code2 className="w-5 h-5 text-white" />}
            accentClass="bg-amber-500"
            stats={programmingStats}
          />
          <ProgressTrackCard
            title="Aptitude"
            description="Quantitative, logical reasoning and verbal practice"
            icon={<BrainCircuit className="w-5 h-5 text-white" />}
            accentClass="bg-cyan-500"
            stats={aptitudeStats}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="panel rounded-2xl p-6">
            {saveSuccess && (
              <div className="mb-6 p-3.5 rounded-xl bg-success-100 border border-success-500/20 text-success-500 text-xs flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-success-500" />
                <span>Profile preferences updated successfully! Your adaptive curriculum has recalibrated.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-warn-100 border border-warn-500/20 text-warn-500 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-warn-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider text-[11px] text-amber-700 flex items-center space-x-1.5">
                  <span>Candidate Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1.5">College / Institution</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. National Institute of Tech"
                      className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1.5">Experience / Academic Year</label>
                    <select
                      value={experienceLevel}
                      onChange={(e: any) => setExperienceLevel(e.target.value)}
                      className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                    >
                      <option value="Final Year">Final Year Student</option>
                      <option value="Pre-final Year">Pre-final Year Student</option>
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
              </div>

              {/* Placement Goals */}
              <div className="space-y-4 pt-4 border-t border-line-100">
                <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider text-[11px] text-amber-700 flex items-center space-x-1.5">
                  <span>Target Placement Criteria</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1.5 flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Target Dream Company</span>
                    </label>
                    <select
                      value={targetCompany}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                    >
                      {companies.map(c => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name} ({c.tier})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1.5 flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                      <span>Target Role</span>
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                    />
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-2 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-amber-600" />
                    <span>Primary Programming Languages & Tech</span>
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
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Selected Company Blueprint Card */}
        <div className="space-y-6">
          {selectedCompanyData ? (
            <div className="panel rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-line-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                    {selectedCompanyData.tier} Tier
                  </span>
                  <h3 className="text-xl font-bold text-ink-900 mt-1.5">{selectedCompanyData.name}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-100 border border-line-100">
                  <Building2 className="w-6 h-6 text-amber-600" />
                </div>
              </div>

              <p className="text-xs text-ink-600 leading-relaxed">
                {selectedCompanyData.description}
              </p>

              {/* Skill Weightage Meters */}
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                  Skill Evaluation Weightage
                </p>
                
                <div className="space-y-2">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-ink-700">
                      <span>Data Structures & Algorithmic Coding</span>
                      <span className="font-semibold text-amber-700">{selectedCompanyData.skillWeightage.dsa}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedCompanyData.skillWeightage.dsa}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-ink-700">
                      <span>Aptitude & Quantitative Problem Solving</span>
                      <span className="font-semibold text-amber-800">{selectedCompanyData.skillWeightage.aptitude}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedCompanyData.skillWeightage.aptitude}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-ink-700">
                      <span>Core CS (OS, DBMS, Networks)</span>
                      <span className="font-semibold text-amber-700">{selectedCompanyData.skillWeightage.coreCs}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedCompanyData.skillWeightage.coreCs}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-ink-700">
                      <span>Language Scoping & OOP</span>
                      <span className="font-semibold text-emerald-800">{selectedCompanyData.skillWeightage.languages}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedCompanyData.skillWeightage.languages}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-ink-700">
                      <span>Live Technical Interview & Communication</span>
                      <span className="font-semibold text-cyan-900">{selectedCompanyData.skillWeightage.interview}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${selectedCompanyData.skillWeightage.interview}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frequently Asked Topics */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-2">
                  High Frequency Topics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCompanyData.frequentlyAskedTopics.map(topic => (
                    <span key={topic} className="px-2 py-1 rounded-md bg-stone-100 text-[11px] text-ink-700 border border-line-100">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hiring Rounds */}
              <div className="pt-2 border-t border-line-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-3">
                  Selection Process ({selectedCompanyData.hiringRounds.length} Rounds)
                </p>
                <div className="space-y-2.5">
                  {selectedCompanyData.hiringRounds.map(round => (
                    <div key={round.roundNumber} className="p-2.5 rounded-xl bg-stone-100 border border-line-100 text-xs">
                      <div className="flex items-center space-x-2 font-semibold text-ink-800">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">
                          {round.roundNumber}
                        </span>
                        <span>{round.name}</span>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-1 pl-7">{round.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
