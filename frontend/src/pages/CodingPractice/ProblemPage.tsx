import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Circle, Clock3, Code2, Lightbulb, Play, RotateCw, Send, XCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { CodeLanguage, IProblem, ISkillProfile } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';

type CaseResult = {
  caseNumber: number;
  hidden: boolean;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  runtimeMs: number;
  error?: string;
};

type ExecutionResult = {
  submitted: boolean;
  solved: boolean;
  passedCount: number;
  totalTestCases: number;
  results: CaseResult[];
  compileError?: string;
  runtimeError?: string;
};

const languageLabels: Record<CodeLanguage, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  javascript: 'JavaScript'
};

const monacoLanguages: Record<CodeLanguage, string> = {
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  javascript: 'javascript'
};

export const ProblemPage: React.FC = () => {
  const { problemId = '' } = useParams();
  const { updateProfileState } = useAuth();
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [drafts, setDrafts] = useState<Partial<Record<CodeLanguage, string>>>({});
  const [showHints, setShowHints] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeAction, setActiveAction] = useState<'run' | 'submit' | null>(null);
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);
    setExecution(null);
    setRequestError(null);
    api.getProblem(problemId)
      .then(response => {
        if (active) {
          setProblem(response.problem);
          setDrafts({});
          setLanguage('python');
          setShowHints(false);
        }
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load this problem.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [problemId, retryCount]);

  const code = problem ? drafts[language] ?? problem.starterCode[language] : '';

  const handleRun = async (submit: boolean) => {
    if (!problem || activeAction) return;
    setActiveAction(submit ? 'submit' : 'run');
    setExecution(null);
    setRequestError(null);
    try {
      const payload = { problemId: problem.id, language, code };
      const response = submit ? await api.submitCode(payload) : await api.runCode(payload);
      setExecution(response as ExecutionResult);
      if (response.skillProfile) updateProfileState(response.skillProfile as ISkillProfile);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to execute this solution.');
    } finally {
      setActiveAction(null);
    }
  };

  const ResultIcon: React.FC<{ passed: boolean }> = ({ passed }) => passed
    ? <CheckCircle2 className="h-4 w-4 text-success-500" />
    : <XCircle className="h-4 w-4 text-warn-500" />;

  if (isLoading) {
    return <div className="panel mx-auto max-w-6xl p-8 text-sm text-ink-500" role="status"><span className="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600 align-middle" />Loading challenge...</div>;
  }

  if (loadError || !problem) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link to="/coding" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"><ArrowLeft className="h-4 w-4" />Back to Coding Arena</Link>
        <div className="panel p-7" role="alert">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-warn-500" />
            <div>
              <h1 className="font-semibold">Challenge could not be loaded</h1>
              <p className="mt-1 text-sm text-ink-500">{loadError || 'This challenge is unavailable.'}</p>
              <button type="button" onClick={() => setRetryCount(count => count + 1)} className="btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"><RotateCw className="h-4 w-4" />Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-100 pb-4">
        <Link to="/coding" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline"><ArrowLeft className="h-4 w-4" />Back to Coding Arena</Link>
        <span className="inline-flex items-center gap-2 text-xs text-ink-500"><Code2 className="h-4 w-4 text-amber-600" />Coding Arena</span>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(540px,1.1fr)]">
        <section className="space-y-4">
          <article className="panel space-y-5 p-5 sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{problem.difficulty}</span>
                <span className="text-xs font-medium text-ink-500">{problem.topic}</span>
              </div>
              <h1 className="mt-3 text-xl font-bold">{problem.title}</h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {problem.companies.map(company => <span key={company} className="rounded-md border border-line-100 bg-stone-100 px-2 py-1 text-[11px] text-ink-700">{company}</span>)}
              </div>
            </div>
            <div className="border-t border-line-100 pt-4">
              <h2 className="text-sm font-semibold">Problem statement</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{problem.description}</p>
            </div>
            <div className="space-y-3 border-t border-line-100 pt-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4 text-amber-600" />Examples</h2>
              {problem.examples.map((example, index) => (
                <div key={index} className="panel-muted rounded-lg p-3 text-xs">
                  <p><span className="font-semibold text-ink-800">Input:</span> <code className="break-all text-ink-600">{example.input || '""'}</code></p>
                  <p className="mt-1"><span className="font-semibold text-ink-800">Output:</span> <code className="break-all text-ink-600">{example.output || '""'}</code></p>
                  <p className="mt-1 text-ink-500">{example.explanation}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-line-100 pt-4">
              <h2 className="text-sm font-semibold">Constraints</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-ink-600">
                {problem.constraints.map(constraint => <li key={constraint}>{constraint}</li>)}
              </ul>
            </div>
            <div className="border-t border-line-100 pt-4">
              <button type="button" onClick={() => setShowHints(value => !value)} aria-expanded={showHints} className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Lightbulb className="h-4 w-4" />Hints {showHints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showHints && <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-ink-600">{problem.hints.map(hint => <li key={hint}>{hint}</li>)}</ol>}
            </div>
          </article>
        </section>

        <section className="panel min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-100 px-4 py-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink-700" htmlFor="code-language">
              Language
              <select id="code-language" value={language} onChange={event => setLanguage(event.target.value as CodeLanguage)} className="rounded-lg border border-line-200 bg-white px-3 py-2 text-xs font-medium text-ink-800 outline-none focus:border-amber-500">
                {(Object.keys(languageLabels) as CodeLanguage[]).map(key => <option key={key} value={key}>{languageLabels[key]}</option>)}
              </select>
            </label>
            <span className="text-[10px] text-ink-500">5s per test · 192 MB memory cap</span>
          </div>
          <div className="h-[440px] min-h-[360px] border-b border-line-100 sm:h-[520px]">
            <Editor
              height="100%"
              language={monacoLanguages[language]}
              value={code}
              onChange={value => setDrafts(current => ({ ...current, [language]: value ?? '' }))}
              theme="vs"
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 14 }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <p className="text-[11px] text-ink-500">Your code runs against isolated test input.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleRun(false)} disabled={!!activeAction} className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-50">
                {activeAction === 'run' ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-200 border-t-amber-700" /> : <Play className="h-3.5 w-3.5" />}
                Run
              </button>
              <button type="button" onClick={() => handleRun(true)} disabled={!!activeAction} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold disabled:opacity-50">
                {activeAction === 'submit' ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-3.5 w-3.5" />}
                Submit
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="panel p-5 sm:p-6" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold"><Clock3 className="h-4 w-4 text-amber-600" />Results</h2>
            <p className="mt-1 text-xs text-ink-500">{execution ? `${execution.passedCount} of ${execution.totalTestCases} test cases passed` : 'Run or submit your code to see test results.'}</p>
          </div>
          {execution?.solved && <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Problem solved</span>}
        </div>

        {requestError && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800" role="alert">{requestError}</div>}
        {execution?.compileError && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3" role="alert"><h3 className="text-xs font-bold text-rose-800">Compile / toolchain error</h3><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-rose-800">{execution.compileError}</pre></div>}
        {execution?.runtimeError && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3" role="alert"><h3 className="text-xs font-bold text-rose-800">Runtime error</h3><pre className="mt-2 whitespace-pre-wrap break-words text-xs text-rose-800">{execution.runtimeError}</pre></div>}
        {execution && execution.results.length > 0 && (
          <div className="mt-4 space-y-3">
            {execution.results.map(result => (
              <article key={result.caseNumber} className={`rounded-lg border p-4 ${result.passed ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-ink-800"><ResultIcon passed={result.passed} />{result.hidden ? `Hidden test ${result.caseNumber}` : `Test case ${result.caseNumber}`}</h3>
                  <span className="text-[11px] text-ink-500">{result.runtimeMs} ms · {result.passed ? 'Passed' : 'Failed'}</span>
                </div>
                {result.hidden ? (
                  <p className="mt-3 text-xs text-ink-500">Private test details are hidden.</p>
                ) : (
                  <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
                    <div className="min-w-0"><p className="font-semibold text-ink-700">Input</p><pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-white/80 p-2 text-ink-600">{result.input || '""'}</pre></div>
                    <div className="min-w-0"><p className="font-semibold text-ink-700">Expected</p><pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-white/80 p-2 text-ink-600">{result.expectedOutput || '""'}</pre></div>
                    <div className="min-w-0"><p className="font-semibold text-ink-700">Actual</p><pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-white/80 p-2 text-ink-600">{result.actualOutput || '""'}</pre></div>
                  </div>
                )}
                {result.error && !result.hidden && <pre className="mt-3 whitespace-pre-wrap break-words rounded-md bg-white/80 p-2 text-xs text-rose-800">{result.error}</pre>}
              </article>
            ))}
          </div>
        )}
        {execution && execution.results.length === 0 && !execution.compileError && !execution.runtimeError && <p className="mt-4 text-xs text-ink-500">No test cases were returned.</p>}
      </section>
    </div>
  );
};
