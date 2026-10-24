import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, BookOpen, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ILanguageTrack } from '../../types/index.js';

export const LanguageLearnPage: React.FC = () => {
  const [tracks, setTracks] = useState<ILanguageTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    api.getTracks()
      .then(response => { if (active) setTracks(Array.isArray(response.tracks) ? response.tracks : []); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load language tracks.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [retryCount]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Interactive Learning Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Programming Language Tracks</h1>
          <p className="text-sm text-ink-500 mt-1">
            Level-based interactive lessons, code playground, and placement-focused mistake analysis.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel space-y-4 p-6" role="status"><p className="flex items-center gap-3 text-sm text-ink-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />Loading language tracks...</p><div className="h-36 animate-pulse rounded-lg bg-stone-200" /><div className="h-36 animate-pulse rounded-lg bg-stone-200" /></div>
      ) : error ? (
        <div className="panel p-7" role="alert"><div className="flex gap-3"><AlertCircle className="h-5 w-5 shrink-0 text-warn-500" /><div><h2 className="font-semibold">Language tracks could not be loaded</h2><p className="mt-1 text-sm text-ink-500">{error}</p><button type="button" onClick={() => setRetryCount(count => count + 1)} className="btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"><RotateCw className="h-4 w-4" />Retry</button></div></div></div>
      ) : tracks.length === 0 ? (
        <div className="panel p-8 text-center"><BookOpen className="mx-auto h-8 w-8 text-amber-600" /><h2 className="mt-3 font-semibold">No language tracks available</h2><p className="mt-1 text-sm text-ink-500">Learning tracks will appear here when they are ready.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {tracks.map(track => {
            const progress = Math.round((track.completedCount || 0) / track.totalModules * 100);
            return (
              <article key={track.id} className="panel flex flex-col justify-between space-y-4 p-6 transition hover:border-amber-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3"><span className="rounded-md border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">{track.level}</span><span className="text-xs text-ink-500">{track.totalModules} Modules</span></div>
                  <h2 className="text-lg font-bold text-ink-900">{track.name}</h2>
                  <div className="space-y-1.5 pt-1"><p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Key syllabus topics</p><div className="flex flex-wrap gap-1.5">{track.topics.map(topic => <span key={topic} className="rounded-lg border border-line-100 bg-stone-100 px-2.5 py-1 text-xs text-ink-700">{topic}</span>)}</div></div>
                </div>
                <div className="space-y-3 border-t border-line-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-ink-600"><span>{track.completedCount || 0} of {track.totalModules} modules complete</span><span>{progress}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${progress}%` }} /></div>
                  <div className="flex items-center justify-between"><span className="text-xs text-ink-500">Live quizzes and code practice</span><Link to={`/learn/${track.id}`} className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold"><span>{track.started ? 'Continue' : 'Start Track'}</span><ArrowRight className="h-3.5 w-3.5" /></Link></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
