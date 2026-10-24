import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { CompanyFitPanel } from '../../components/CompanyFitPanel.js';
import { IDashboardData, IDailyMission } from '../../types/index.js';
import { 
  BrainCircuit, 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  Award, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Code2, 
  Calculator, 
  Video, 
  Building2,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, skillProfile, updateProfileState } = useAuth();
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardOverview();
      if (res.success && res.dashboard) {
        setDashboardData(res.dashboard);
        if (res.dashboard.skillProfile) {
          updateProfileState(res.dashboard.skillProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleMission = async (missionId: string) => {
    try {
      const res = await api.toggleMission(missionId);
      if (res.success) {
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error toggling mission', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 bg-stone-50">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-xs text-ink-500">Loading placement dashboard & analytics...</p>
      </div>
    );
  }

  const profile = dashboardData?.skillProfile || skillProfile;
  const company = dashboardData?.targetCompany;
  const recommendation = dashboardData?.recommendation;
  const isAssessed = profile?.assessmentCompleted;
  const readiness = profile?.overallReadinessScore || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 bg-stone-50 text-ink-900">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden panel rounded-3xl p-6 sm:p-8 border border-line-100 bg-[linear-gradient(135deg,#fffdf9_0%,#f8f1e5_100%)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>AI Placement OS</span>
              </span>
              <span className="text-xs text-ink-500">• Target: <strong className="text-ink-800">{user?.targetCompany || 'Google'}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!
            </h1>
            <p className="text-xs sm:text-sm text-ink-600 max-w-xl leading-relaxed">
              {isAssessed
                ? `Your placement readiness is at ${readiness}%. Follow your daily recommended tasks to hit ${user?.targetCompany}'s hiring cutoff.`
                : 'Take your initial 10-minute diagnostic assessment to calibrate your placement readiness score and custom roadmap.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isAssessed ? (
              <Link
                to="/assessment"
                className="btn-primary px-6 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition transform hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4" />
                <span>Take Diagnostic Test</span>
              </Link>
            ) : (
              <Link
                to="/interview"
                className="btn-primary px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition"
              >
                <Video className="w-4 h-4" />
                <span>AI Face-to-Face Mock</span>
              </Link>
            )}

            <Link
              to="/profile"
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>Change Goals</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row: Readiness Score + Company Fit + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Overall Readiness Meter */}
        <div className="panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-ink-500">Readiness Score</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>

          <div className="flex items-center space-x-5 my-1">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-stone-300 flex items-center justify-center bg-stone-50">
                <span className={`text-2xl font-extrabold ${readiness >= 75 ? 'text-success-500' : readiness >= 50 ? 'text-amber-600' : 'text-amber-500'}`}>
                  {readiness}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-ink-800">
                {readiness >= 75 ? 'Tier-1 Placement Ready' : readiness >= 50 ? 'Moderate Readiness' : 'Foundational'}
              </p>
              <p className="text-xs text-ink-500">
                {readiness >= 75 ? 'Meets Top Tech cutoffs' : 'Complete recommended drills'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-line-100 text-xs text-ink-500 flex justify-between">
            <span>Target: <strong>85%+</strong></span>
            <Link to="/assessment" className="text-amber-700 hover:underline">
              {isAssessed ? 'Retake Benchmark' : 'Take Test'}
            </Link>
          </div>
        </div>

        {/* Metric 2: Company Fit Index */}
        <div className="panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-ink-500">Target Company Match</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold text-ink-900">{company?.name || user?.targetCompany || 'Google'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                {company?.tier || 'Super Dream'}
              </span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${profile?.targetCompanyFit?.score || 35}%` }}
              ></div>
            </div>
            <p className="text-xs text-ink-600 leading-snug">
              Fit Index: <strong className="text-ink-800">{profile?.targetCompanyFit?.score || 35}%</strong> ({profile?.targetCompanyFit?.matchLevel || 'Needs Work'})
            </p>
          </div>

          <div className="pt-2 border-t border-line-100 text-xs text-ink-500 flex justify-between">
            <span>Rounds: <strong>{company?.hiringRounds?.length || 4} Stages</strong></span>
            <Link to="/company-prep" className="text-amber-700 hover:underline">View Blueprint</Link>
          </div>
        </div>

        {/* Metric 3: Active Preparation Status */}
        <div className="panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-ink-500">Adaptive Trajectory</span>
            <TrendingUp className="w-4 h-4 text-success-500" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink-900">Daily Focus Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {profile?.weakTopics && profile.weakTopics.length > 0 ? (
                profile.weakTopics.slice(0, 3).map((w: string) => (
                  <span key={w} className="px-2 py-1 rounded bg-warn-100 text-warn-500 border border-warn-200 text-[11px]">
                    {w}
                  </span>
                ))
              ) : (
                <span className="text-xs text-ink-500">Arrays, Quantitative Math, Scoping</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-line-100 text-xs text-ink-500 flex justify-between items-center">
            <span>Missions Active: <strong>{recommendation?.dailyMissions?.length || 4}</strong></span>
            <span className="text-success-500 font-semibold">AI Calibrated</span>
          </div>
        </div>
      </div>

      <div className="panel rounded-2xl p-6">
        <CompanyFitPanel
          studentScores={{
            aptitude: profile?.categories?.aptitude || 0,
            dsa: profile?.categories?.dsa || 0,
            languages: profile?.categories?.languages || 0,
            coreCs: profile?.categories?.coreCs || 0,
            interview: profile?.categories?.interview || 0
          }}
        />
      </div>

      {/* Main Grid: Skill Category Radar / Bars + Daily Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Skill Breakdown & Strengths/Weaknesses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Breakdown */}
          <div className="panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[11px] text-amber-700">
                  Skill Competency Distribution
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">Real-time mastery across placement domains</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Aptitude */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-700">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-3.5 h-3.5 text-amber-800" />
                    <span>Aptitude (Quantitative, Logical, Verbal)</span>
                  </div>
                  <span className="font-semibold text-amber-800">{profile?.categories?.aptitude || 0}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.categories?.aptitude || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-700">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Programming Language Scoping & OOP</span>
                  </div>
                  <span className="font-semibold text-emerald-800">{profile?.categories?.languages || 0}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.categories?.languages || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* DSA */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-700">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-3.5 h-3.5 text-indigo-800" />
                    <span>Data Structures & Algorithmic Problem Solving</span>
                  </div>
                  <span className="font-semibold text-indigo-800">{profile?.categories?.dsa || 0}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.categories?.dsa || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Core CS */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-700">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-purple-800" />
                    <span>Core CS Fundamentals (OS, DBMS, Networks)</span>
                  </div>
                  <span className="font-semibold text-purple-800">{profile?.categories?.coreCs || 0}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.categories?.coreCs || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* AI Interview */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-700">
                  <div className="flex items-center space-x-2">
                    <Video className="w-3.5 h-3.5 text-cyan-900" />
                    <span>Face-to-Face Technical & Behavioral Interview</span>
                  </div>
                  <span className="font-semibold text-cyan-900">{profile?.categories?.interview || 0}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.categories?.interview || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths and Gap Topics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="panel p-5 rounded-2xl space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strong Competencies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile?.strongTopics && profile.strongTopics.length > 0 ? (
                  profile.strongTopics.map((t: string) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-success-100 text-success-500 border border-success-500/20 text-xs font-medium">
                      ✓ {t}
                    </span>
                  ))
                ) : (
                    <span className="text-xs text-ink-500">Complete assessment to populate strengths.</span>
                )}
              </div>
            </div>

              <div className="panel p-5 rounded-2xl space-y-2.5">
              <div className="flex items-center space-x-2 text-rose-800 text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Focus Areas ({user?.targetCompany})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile?.weakTopics && profile.weakTopics.length > 0 ? (
                  profile.weakTopics.map((t: string) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-warn-100 text-warn-500 border border-warn-200 text-xs font-medium">
                      ! {t}
                    </span>
                  ))
                ) : (
                    <span className="text-xs text-ink-500">Take diagnostic test to identify weakness areas.</span>
                )}
              </div>
            </div>
          </div>

          {/* 4-Week Structured Roadmap */}
            <div className="panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[11px] text-amber-700 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Personalized 4-Week Placement Roadmap</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendation?.roadmap?.map((stage: any) => (
                <div
                  key={stage.weekNumber}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    stage.status === 'in_progress'
                      ? 'bg-amber-50 border-amber-200'
                      : stage.status === 'completed'
                      ? 'bg-success-100 border-success-500/20'
                      : 'bg-stone-100 border-line-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-800">Week {stage.weekNumber}: {stage.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      stage.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-ink-500'
                    }`}>
                      {stage.status === 'in_progress' ? 'Active' : stage.status === 'completed' ? 'Done' : 'Upcoming'}
                    </span>
                  </div>

                  <p className="text-[11px] text-ink-500">{stage.focusArea}</p>

                  <div className="space-y-1">
                    {stage.milestones?.map((m: any, mIdx: number) => (
                      <div key={mIdx} className="flex items-center space-x-2 text-[11px] text-ink-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${m.completed ? 'text-success-500' : 'text-ink-400'}`} />
                        <span className={m.completed ? 'line-through text-ink-500' : ''}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily Missions Checklist */}
        <div className="space-y-6">
          <div className="panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[11px] text-amber-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Adaptive Daily Missions</span>
                </h3>
                <p className="text-[11px] text-ink-500 mt-0.5">High-gain actions curated for you today</p>
              </div>
            </div>

            {recommendation?.summaryInsight && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                💡 {recommendation.summaryInsight}
              </div>
            )}

            <div className="space-y-3">
              {recommendation?.dailyMissions?.map((mission: IDailyMission) => (
                <div
                  key={mission.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                    mission.isCompleted
                      ? 'bg-stone-100 border-line-100 opacity-70'
                      : 'bg-white border-line-100 hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => handleToggleMission(mission.id)}
                      className="mt-0.5 text-ink-500 hover:text-success-500 transition"
                    >
                      {mission.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-success-500" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${mission.isCompleted ? 'line-through text-ink-500' : 'text-ink-800'}`}>
                          {mission.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-1 leading-normal">{mission.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-line-100 text-[11px]">
                    <span className="flex items-center space-x-1 text-ink-500">
                      <Clock className="w-3 h-3 text-ink-500" />
                      <span>{mission.estimatedMinutes} mins</span>
                    </span>

                    <Link
                      to={mission.actionUrl}
                      className="text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
                    >
                      <span>Start Drill</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Launch Cards */}
          <div className="panel rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-ink-500">
              Quick Practice Launch
            </h4>
            <div className="space-y-2">
              <Link
                to="/coding"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-line-100 hover:border-amber-200 transition group"
              >
                <div className="flex items-center space-x-2.5 text-ink-700 group-hover:text-ink-900">
                  <Code2 className="w-4 h-4 text-indigo-800" />
                  <span>LeetCode-Style Coding Arena</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-500 group-hover:text-amber-700 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/interview"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-line-100 hover:border-amber-200 transition group"
              >
                <div className="flex items-center space-x-2.5 text-ink-700 group-hover:text-ink-900">
                  <Video className="w-4 h-4 text-purple-800" />
                  <span>Face-to-Face AI Mock Interview</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-500 group-hover:text-amber-700 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/aptitude"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-line-100 hover:border-amber-200 transition group"
              >
                <div className="flex items-center space-x-2.5 text-ink-700 group-hover:text-ink-900">
                  <Calculator className="w-4 h-4 text-amber-800" />
                  <span>Timed Aptitude Test Portal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-500 group-hover:text-amber-700 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
