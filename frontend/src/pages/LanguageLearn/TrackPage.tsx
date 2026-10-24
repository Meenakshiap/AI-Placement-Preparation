import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, Circle, CircleCheck, CirclePlay, Clock3, Code2, LockKeyhole, Play, RotateCw, Send, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { CodeLanguage, ILanguageTrack, ITrackModule, ITrackProgress, ISkillProfile } from '../../types/index.js';

type QuizFeedback = {
  questionId: string;
  topic: string;
  prompt: string;
  selectedOption: string;
  correctAnswer: string;
  correct: boolean;
  explanation: string;
};

type QuizResult = {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  passMark: number;
  feedback: QuizFeedback[];
};

type RunResult = {
  results: { passed: boolean; actualOutput: string; expectedOutput: string; runtimeMs: number; error?: string }[];
  compileError?: string;
  runtimeError?: string;
};

const languageLabels: Record<CodeLanguage, string> = {
  python: 'python', java: 'java', cpp: 'cpp', javascript: 'javascript'
};

export const TrackPage: React.FC = () => {
  const { trackId = '' } = useParams();
  const { updateProfileState } = useAuth();
  const [track, setTrack] = useState<ILanguageTrack | null>(null);
  const [progress, setProgress] = useState<ITrackProgress | null>(null);
  const [activeModuleId, setActiveModuleId] = useState('');
  const [code, setCode] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadTrack = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await api.startTrack(trackId);
      const response = await api.getTrack(trackId);
      const loadedTrack = response.track as ILanguageTrack;
      const loadedProgress = response.progress as ITrackProgress;
      setTrack(loadedTrack);
      setProgress(loadedProgress);
      setActiveModuleId(loadedProgress.currentModuleId || loadedTrack.modules?.[0]?.id || '');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load this learning track.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrack();
  }, [trackId, retryCount]);

  const activeModule = track?.modules?.find(module => module.id === activeModuleId) || null;

  useEffect(() => {
    setCode(activeModule?.playground?.starterCode || '');
    setAnswers({});
    setQuizResult(null);
    setRunResult(null);
    setActionError(null);
  }, [activeModuleId, trackId]);

  const completed = new Set(progress?.completedModuleIds || []);
  const completedCount = completed.size;
  const progressPercent = track ? Math.round(completedCount / track.totalModules * 100) : 0;

  const selectModule = (module: ITrackModule) => {
    if (module.comingSoon) return;
    const previous = track?.modules?.[module.number - 2];
    if (previous && !completed.has(previous.id)) return;
    setActiveModuleId(module.id);
  };

  const handleRun = async () => {
    if (!track || !activeModule || isRunning || !code.trim()) return;
    setIsRunning(true);
    setRunResult(null);
    setActionError(null);
    try {
      const result = await api.runTrackModule(track.id, activeModule.id, code);
      setRunResult(result as RunResult);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to run this example.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!track || !activeModule || isSubmitting) return;
    setIsSubmitting(true);
    setQuizResult(null);
    setActionError(null);
    try {
      const result = await api.submitTrackQuiz(track.id, activeModule.id, answers);
      setQuizResult(result as QuizResult);
      if (result.skillProfile) updateProfileState(result.skillProfile as ISkillProfile);
      const refreshed = await api.getTrack(track.id);
      setProgress(refreshed.progress as ITrackProgress);
      setTrack(refreshed.track as ILanguageTrack);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to submit this quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="panel mx-auto max-w-6xl p-8 text-sm text-ink-500" role="status"><span className="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600 align-middle" />Loading learning track...</div>;
  }

  if (loadError || !track || !activeModule) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"><ArrowLeft className="h-4 w-4" />Back to Language Tracks</Link>
        <div className="panel p-7" role="alert"><div className="flex gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-warn-500" /><div><h1 className="font-semibold">Track could not be loaded</h1><p className="mt-1 text-sm text-ink-500">{loadError || 'This learning track is unavailable.'}</p><button type="button" onClick={() => setRetryCount(count => count + 1)} className="btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"><RotateCw className="h-4 w-4" />Retry</button></div></div></div>
      </div>
    );
  }

  const mistakes = [...(progress?.mistakes || [])].reverse();
  const moduleAttempts = progress?.quizAttempts?.filter(attempt => attempt.moduleId === activeModule.id) || [];
  const currentAttempt = moduleAttempts[moduleAttempts.length - 1];

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-100 pb-4">
        <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"><ArrowLeft className="h-4 w-4" />Back to Language Tracks</Link>
        <span className="inline-flex items-center gap-2 text-xs text-ink-500"><BookOpen className="h-4 w-4 text-amber-600" />{track.name}</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="panel p-4">
            <div className="flex items-center justify-between gap-2"><div><h1 className="text-sm font-bold">Course modules</h1><p className="mt-1 text-xs text-ink-500">{completedCount} of {track.totalModules} complete</p></div><span className="text-xs font-bold text-amber-800">{progressPercent}%</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${progressPercent}%` }} /></div>
            <ol className="mt-4 max-h-[55vh] space-y-1 overflow-y-auto pr-1">
              {track.modules?.map(module => {
                const isComplete = completed.has(module.id);
                const previous = track.modules?.[module.number - 2];
                const isLocked = module.comingSoon || !!(previous && !completed.has(previous.id));
                const isCurrent = module.id === progress?.currentModuleId && !isComplete;
                const isSelected = module.id === activeModule.id;
                return (
                  <li key={module.id}>
                    <button type="button" disabled={isLocked} onClick={() => selectModule(module)} aria-current={isSelected ? 'step' : undefined} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${isSelected ? 'border-amber-300 bg-amber-50' : 'border-transparent hover:bg-stone-100'} ${isLocked ? 'text-ink-400' : 'text-ink-800'}`}>
                      <span className="mt-0.5 shrink-0">{module.comingSoon || isLocked ? <LockKeyhole className="h-4 w-4 text-ink-400" /> : isComplete ? <CircleCheck className="h-4 w-4 text-success-500" /> : isCurrent ? <CirclePlay className="h-4 w-4 text-amber-700" /> : <Circle className="h-4 w-4 text-ink-400" />}</span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{String(module.number).padStart(2, '0')}. {module.title}</span><span className="mt-1 block text-[10px] text-ink-500">{module.comingSoon ? 'Coming soon' : isComplete ? 'Completed' : isCurrent ? 'Current' : isLocked ? 'Locked' : 'Unlocked'}</span></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="panel p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold"><AlertCircle className="h-4 w-4 text-amber-700" />Review your mistakes</h2>
            {mistakes.length === 0 ? <p className="mt-2 text-xs leading-relaxed text-ink-500">Missed quiz questions will collect here with their topics and explanations.</p> : (
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {mistakes.slice(0, 8).map((mistake, index) => <li key={`${mistake.moduleId}-${mistake.questionId}-${index}`} className="rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-[10px] font-bold uppercase text-rose-800">{mistake.topic}</p><p className="mt-1 text-xs font-medium text-ink-800">{mistake.prompt}</p><p className="mt-1 text-[11px] text-ink-600">Your answer: {mistake.selectedOption}</p><p className="mt-1 text-[11px] font-semibold text-success-500">Review: {mistake.correctAnswer}</p></li>)}
              </ul>
            )}
          </section>
        </aside>

        <main className="min-w-0 space-y-5">
          {activeModule.comingSoon ? (
            <section className="panel p-8"><span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">Coming soon</span><h2 className="mt-4 text-xl font-bold">{activeModule.title}</h2><p className="mt-2 text-sm text-ink-500">This module’s lesson and quiz are being prepared.</p></section>
          ) : (
            <>
              <section className="panel space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-100 pb-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Module {activeModule.number} · {activeModule.topic}</p><h2 className="mt-2 text-xl font-bold">{activeModule.title}</h2></div>{completed.has(activeModule.id) && <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4" />Completed</span>}</div>
                <div><h3 className="text-sm font-semibold">Concept</h3><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">{activeModule.concept}</p></div>

                <div className="space-y-3"><h3 className="text-sm font-semibold">Code examples</h3><div className="grid gap-3 xl:grid-cols-2">{activeModule.examples?.map((example, index) => <article key={`${example.title}-${index}`} className="overflow-hidden rounded-lg border border-line-100"><div className="border-b border-line-100 bg-stone-100 px-3 py-2"><h4 className="text-xs font-semibold">{example.title}</h4></div><Editor height={`${Math.min(220, Math.max(74, example.code.split('\n').length * 19 + 24))}px`} language={languageLabels[track.language]} value={example.code} theme="vs" options={{ readOnly: true, automaticLayout: true, minimap: { enabled: false }, lineNumbers: 'off', scrollBeyondLastLine: false, wordWrap: 'on', folding: false, scrollbar: { vertical: 'hidden', horizontal: 'hidden' }, padding: { top: 10 } }} /><p className="border-t border-line-100 px-3 py-2 text-xs leading-relaxed text-ink-600">{example.explanation}</p></article>)}</div></div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900"><AlertCircle className="h-4 w-4" />Common mistakes</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-ink-700">{activeModule.commonMistakes?.map(mistake => <li key={mistake}>{mistake}</li>)}</ul></div>

                <div className="overflow-hidden rounded-lg border border-line-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-100 bg-stone-100 px-4 py-3"><div><h3 className="flex items-center gap-2 text-sm font-semibold"><Code2 className="h-4 w-4 text-amber-700" />Code playground</h3><p className="mt-1 text-[11px] text-ink-500">Run this snippet in an isolated test input.</p></div><button type="button" onClick={handleRun} disabled={isRunning} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-50">{isRunning ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Play className="h-3.5 w-3.5" />}Run</button></div>
                  <div className="h-[240px]"><Editor height="100%" language={languageLabels[track.language]} value={code} onChange={value => setCode(value || '')} theme="vs" options={{ automaticLayout: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }} /></div>
                  {runResult && <div className={`border-t p-3 text-xs ${runResult.results?.[0]?.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`} role="status"><p className="font-semibold">{runResult.results?.[0]?.passed ? 'Output matches the example.' : 'Output does not match yet.'}</p>{runResult.results?.[0] && <p className="mt-1 break-all">Expected: {runResult.results[0].expectedOutput || 'empty'} · Actual: {runResult.results[0].actualOutput || 'empty'} · {runResult.results[0].runtimeMs} ms</p>}{(runResult.compileError || runResult.runtimeError || runResult.results?.[0]?.error) && <pre className="mt-2 whitespace-pre-wrap break-words">{runResult.compileError || runResult.runtimeError || runResult.results?.[0]?.error}</pre>}</div>}
                </div>
              </section>

              <section className="panel space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold">Module quiz</h2><p className="mt-1 text-xs text-ink-500">Answer all {activeModule.quiz?.length} questions. Pass mark: 60%.</p></div>{currentAttempt && <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${currentAttempt.passed ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>Last score: {currentAttempt.score}%</span>}</div>
                <div className="space-y-4">{activeModule.quiz?.map((question, index) => {
                  const feedback = quizResult?.feedback.find(item => item.questionId === question.id);
                  return <fieldset key={question.id} className="rounded-lg border border-line-100 p-4"><legend className="px-1 text-[10px] font-semibold uppercase text-amber-800">Question {index + 1} · {question.topic}</legend><p className="text-sm font-semibold text-ink-900">{question.prompt}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map(option => {
                    const selected = answers[question.id] === option.id;
                    const correct = feedback?.correct && feedback.correctAnswer === option.text;
                    const wrong = feedback && selected && !feedback.correct;
                    return <button key={option.id} type="button" disabled={!!quizResult?.passed} onClick={() => { setQuizResult(null); setAnswers(current => ({ ...current, [question.id]: option.id })); }} className={`rounded-lg border p-3 text-left text-xs transition ${correct ? 'border-emerald-500 bg-emerald-100 text-emerald-900' : wrong ? 'border-rose-500 bg-rose-100 text-rose-900' : selected ? 'border-amber-500 bg-amber-50 text-ink-900 ring-1 ring-amber-300' : 'border-line-100 bg-white text-ink-700 hover:border-amber-300'}`}>{option.text}</button>;
                  })}</div>{feedback && <div className={`mt-3 rounded-md p-3 text-xs leading-relaxed ${feedback.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}><p className="font-semibold">{feedback.correct ? 'Correct' : `Review: ${feedback.correctAnswer}`}</p><p className="mt-1">{feedback.explanation}</p></div>}</fieldset>;
                })}</div>
                {actionError && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">{actionError}</p>}
                {quizResult && <div className={`rounded-lg border p-4 ${quizResult.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`} role="status"><p className={`text-sm font-bold ${quizResult.passed ? 'text-emerald-900' : 'text-amber-900'}`}>{quizResult.passed ? 'Module complete. The next module is unlocked.' : 'Not quite yet. Review the explanations and try again.'}</p><p className="mt-1 text-xs text-ink-700">Score: {quizResult.score}% ({quizResult.correctCount}/{quizResult.totalQuestions}) · pass mark {quizResult.passMark}%</p></div>}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-100 pt-4"><span className="text-xs text-ink-500">Passing this quiz unlocks the next module.</span><button type="button" onClick={handleQuizSubmit} disabled={isSubmitting || !!quizResult?.passed} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-3.5 w-3.5" />}{quizResult?.passed ? 'Quiz passed' : quizResult ? 'Try quiz again' : 'Submit quiz'}</button></div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
