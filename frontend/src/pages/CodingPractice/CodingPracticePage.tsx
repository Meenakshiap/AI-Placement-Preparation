import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Code2, Play, RotateCw } from 'lucide-react';
import { api } from '../../services/api.js';
import { IProblem } from '../../types/index.js';

export const CodingPracticePage: React.FC = () => {
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    api.getProblems()
      .then(response => {
        if (active) setProblems(Array.isArray(response.problems) ? response.problems : []);
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load coding problems.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [retryCount]);

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header className="border-b border-line-100 pb-5">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
          <Code2 className="h-4 w-4 text-amber-600" />
          <span>LeetCode-Style Practice</span>
        </div>
        <h1 className="text-2xl font-bold">Algorithmic Coding Arena</h1>
        <p className="mt-1 text-sm text-ink-500">Choose a challenge and run your solution against the test suite.</p>
      </header>

      {isLoading ? (
        <div className="panel space-y-4 p-6" role="status" aria-live="polite">
          <p className="flex items-center gap-3 text-sm text-ink-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />Loading challenges...</p>
          <div className="h-24 animate-pulse rounded-lg bg-stone-200" />
          <div className="h-24 animate-pulse rounded-lg bg-stone-200" />
        </div>
      ) : error ? (
        <div className="panel p-7" role="alert">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-warn-500" />
            <div>
              <h2 className="font-semibold">Challenges could not be loaded</h2>
              <p className="mt-1 text-sm text-ink-500">{error}</p>
              <button type="button" onClick={() => setRetryCount(count => count + 1)} className="btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
                <RotateCw className="h-4 w-4" />Retry
              </button>
            </div>
          </div>
        </div>
      ) : problems.length === 0 ? (
        <div className="panel p-8 text-center">
          <Code2 className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 font-semibold">No challenges available</h2>
          <p className="mt-1 text-sm text-ink-500">New coding challenges will appear here when available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map(problem => (
            <article key={problem.id} className="panel flex flex-col gap-4 p-5 transition hover:border-amber-300 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                    problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                    problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>{problem.difficulty}</span>
                  <span className="text-xs text-ink-500">{problem.topic}</span>
                  {problem.isSolved && <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-500"><CheckCircle2 className="h-3.5 w-3.5" />Solved</span>}
                </div>
                <h2 className="text-base font-bold">{problem.title}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {problem.companies.map(company => <span key={company} className="rounded-md border border-line-100 bg-stone-100 px-2 py-0.5 text-[11px] text-ink-700">{company}</span>)}
                </div>
              </div>
              <Link to={`/coding/${encodeURIComponent(problem.id)}`} className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-sm">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{problem.isSolved ? 'Practice Again' : 'Solve Challenge'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
