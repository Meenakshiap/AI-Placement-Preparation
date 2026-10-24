import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { IQuestion } from '../../types/index.js';
import confetti from 'canvas-confetti';
import { 
  BrainCircuit, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  Target, 
  BarChart3, 
  RotateCcw,
  Zap,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DiagnosticAssessmentPage: React.FC = () => {
  const { user, skillProfile, updateProfileState } = useAuth();
  const navigate = useNavigate();

  // Test states: 'intro' | 'active' | 'evaluating' | 'result'
  const [stage, setStage] = useState<'intro' | 'active' | 'evaluating' | 'result'>('intro');
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 mins
  const [showHint, setShowHint] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);

  // Result state
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const res = await api.getDiagnosticQuestions();
        if (res.success && res.questions) {
          setQuestions(res.questions);
        }
      } catch (err) {
        console.error('Error fetching questions', err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (stage === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, timeRemaining]);

  const startAssessment = () => {
    setStage('active');
    setTimeRemaining(15 * 60);
    setCurrentIdx(0);
    setAnswers({});
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitAssessment = async () => {
    setStage('evaluating');

    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] || '',
      timeSpentSeconds: 30
    }));

    try {
      const res = await api.submitDiagnosticAssessment(formattedAnswers);
      if (res.success) {
        setAssessmentResult(res);
        if (res.profile) {
          updateProfileState(res.profile);
        }
        setStage('result');
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti in headless
        }
      } else {
        alert(res.message || 'Error submitting assessment');
        setStage('active');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
      setStage('active');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  // ---------------- STAGE: INTRO ----------------
  if (stage === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4 pb-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20 mb-2">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">Placement Diagnostic Assessment</h1>
          <p className="text-sm text-ink-500 max-w-xl mx-auto">
            Take a 10-question adaptive assessment to establish your baseline placement readiness and benchmark against{' '}
            <span className="text-amber-700 font-semibold">{user?.targetCompany || 'Google'}</span> hiring standards.
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-800 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Duration</span>
            </div>
            <p className="text-xl font-bold text-ink-900">15 Minutes</p>
            <p className="text-xs text-ink-500">10 Multi-domain diagnostic questions</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Target Benchmark</span>
            </div>
            <p className="text-xl font-bold text-ink-900">{user?.targetCompany || 'Google'}</p>
            <p className="text-xs text-ink-500">Role: {user?.targetRole || 'SDE-1'}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Outcome</span>
            </div>
            <p className="text-xl font-bold text-ink-900">Readiness Score %</p>
            <p className="text-xs text-ink-500">Adaptive daily roadmap & weakness drills</p>
          </div>
        </div>

        {/* Coverage Checklist */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider text-[11px] text-amber-700">
            Assessed Skill Dimensions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Quantitative & Numerical Problem Solving</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Logical Deductions & Sequence Patterns</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Programming Language Scoping & Memory Models</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Data Structures & Algorithmic Complexity (Floyd, Hashing)</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Core CS Fundamentals (Deadlocks, SQL Normalization)</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>High-Throughput System Architecture & Caching</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center pt-2">
          <button
            onClick={startAssessment}
            disabled={loadingQuestions || questions.length === 0}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 inline-flex items-center space-x-2.5 transition transform hover:scale-105 disabled:opacity-50"
          >
            <span>Start 10-Question Diagnostic Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------------- STAGE: EVALUATING ----------------
  if (stage === 'evaluating') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-ink-900">Evaluating Diagnostic Submission...</h2>
        <p className="text-xs text-ink-500 max-w-sm">
          Recommendation engine is benchmarking your answers against {user?.targetCompany || 'Google'} skill rubrics and generating your personalized daily missions.
        </p>
      </div>
    );
  }

  // ---------------- STAGE: ACTIVE TEST ROOM ----------------
  if (stage === 'active' && currentQ) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Top bar: Question counter + Countdown Timer */}
        <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs text-ink-600 hidden sm:inline">
              Answered: <strong className="text-ink-900">{answeredCount}</strong> / {questions.length}
            </span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Palette Pill Navigator */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setShowHint(false);
                }}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 uppercase">
                {currentQ.category}
              </span>
              <span className="text-xs text-ink-600">• {currentQ.subTopic}</span>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
              currentQ.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-900' :
              currentQ.difficulty === 'Medium' ? 'bg-amber-100 text-amber-900' :
              'bg-rose-100 text-rose-900'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>

          <h2 className="text-lg font-bold text-ink-900">{currentQ.title}</h2>

          {/* Description / Code formatting */}
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
            {currentQ.description}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((opt, oIdx) => {
              const isSelected = answers[currentQ.id] === opt;
              const optionLetter = String.fromCharCode(65 + oIdx);
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-xl text-sm font-medium transition flex items-start space-x-3.5 border ${
                    isSelected
                      ? 'bg-indigo-900 border-indigo-700 text-white ring-2 ring-indigo-500 shadow-md shadow-indigo-900/20'
                      : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Hint Accordion */}
          {currentQ.hints && currentQ.hints.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-indigo-800 hover:text-indigo-900 flex items-center space-x-1.5 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                  💡 {currentQ.hints[0]}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation & Submit footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentIdx > 0) {
                setCurrentIdx(currentIdx - 1);
                setShowHint(false);
              }
            }}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 transition flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIdx(currentIdx + 1);
                  setShowHint(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center space-x-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish & Generate Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------- STAGE: RESULTS ----------------
  if (stage === 'result' && assessmentResult) {
    const profile = assessmentResult.profile;
    const summary = assessmentResult.scoreSummary;
    const targetComp = user?.targetCompany || 'Google';

    return (
      <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
        {/* Results Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/20 mb-2">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">Diagnostic Benchmark Complete!</h1>
          <p className="text-sm text-ink-600 max-w-xl mx-auto">
            Your personalized skill profile and adaptive curriculum have been calibrated for <strong className="text-indigo-800">{targetComp}</strong>.
          </p>
        </div>

        {/* Readiness Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-3 flex flex-col justify-center items-center">
            <p className="text-xs uppercase font-bold tracking-wider text-ink-600">Placement Readiness Score</p>
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-slate-800 flex items-center justify-center">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 via-purple-800 to-emerald-800">
                  {profile.overallReadinessScore}%
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
              {profile.targetCompanyFit.readinessTier}
            </span>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider text-[11px] text-amber-700">
                Category Competency Breakdown
              </h3>
              <span className="text-xs text-ink-600">
                Score: {summary.totalCorrect} / {summary.totalQuestions} Correct ({summary.percentageScore}%)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-ink-700 mb-1">
                  <span>Aptitude (Quantitative & Logical)</span>
                  <span className="font-semibold text-amber-800">{profile.categories.aptitude}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${profile.categories.aptitude}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-ink-700 mb-1">
                  <span>Programming Languages (Scoping & OOP)</span>
                  <span className="font-semibold text-emerald-800">{profile.categories.languages}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${profile.categories.languages}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-ink-700 mb-1">
                  <span>Data Structures & Algorithmic Problem Solving</span>
                  <span className="font-semibold text-indigo-800">{profile.categories.dsa}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${profile.categories.dsa}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-ink-700 mb-1">
                  <span>Core CS Fundamentals (OS & DBMS)</span>
                  <span className="font-semibold text-purple-800">{profile.categories.coreCs}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${profile.categories.coreCs}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-ink-700 mb-1">
                  <span>System Architecture & High Scale Caching</span>
                  <span className="font-semibold text-cyan-900">{profile.categories.interview}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${profile.categories.interview}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Gap Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Identified Strengths</span>
            </div>
            {profile.strongTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.strongTopics.map((topic: string) => (
                  <span key={topic} className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-medium">
                    ✓ {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-600">Foundation established. Daily practice will solidify core strengths.</p>
            )}
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-rose-800 text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Priority Gap Areas ({targetComp} Cutoff)</span>
            </div>
            {profile.weakTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.weakTopics.map((topic: string) => (
                  <span key={topic} className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 text-xs font-medium">
                    ! {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-800 font-medium">No major deficits detected! Ready for advanced mock tests.</p>
            )}
          </div>
        </div>

        {/* In-depth Question-by-Question Review */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-ink-900 uppercase tracking-wider text-[11px] text-amber-700">
            Detailed Diagnostic Review & Explanations
          </h3>
          <div className="space-y-3">
            {summary.evaluatedAnswers?.map((item: any, idx: number) => {
              const isExpanded = expandedExplanation === item.questionId;
              return (
                <div key={item.questionId} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedExplanation(isExpanded ? null : item.questionId)}
                  >
                    <div className="flex items-center space-x-2.5">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-200">
                        Q{idx + 1}: {item.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        item.isCorrect ? 'bg-emerald-900 text-emerald-100' : 'bg-rose-900 text-rose-100'
                      }`}>
                        {item.isCorrect ? 'Correct (+10)' : 'Missed (0)'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-slate-300">
                      <p>
                        <strong>Your Selected Answer:</strong>{' '}
                        <span className={item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.selectedOption || 'Skipped'}
                        </span>
                      </p>
                      {!item.isCorrect && (
                        <p>
                          <strong>Correct Answer:</strong>{' '}
                          <span className="text-emerald-400 font-semibold">{item.correctAnswer}</span>
                        </p>
                      )}
                      <p className="bg-slate-950 p-3 rounded-lg text-slate-300 leading-relaxed font-sans">
                        💡 <strong>Explanation:</strong> {item.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setStage('intro')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Diagnostic</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
          >
            <span>Enter Personalized Dashboard & Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
