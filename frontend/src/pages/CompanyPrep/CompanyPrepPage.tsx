import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ICompanyBlueprint } from '../../types/index.js';
import { AlertCircle, ArrowRight, BookOpen, Building2, CheckCircle2, Clock3, RotateCw, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const CompanyPrepPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [companies, setCompanies] = useState<ICompanyBlueprint[]>([]);
  const [activeCompany, setActiveCompany] = useState<ICompanyBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetMessage, setTargetMessage] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getCompanies();
        if (!Array.isArray(res.companies)) {
          throw new Error('The company blueprint response was invalid.');
        }
        if (!isCurrent) return;
        setCompanies(res.companies);
        const target = (user?.targetCompany || 'google').toLowerCase();
        const match = res.companies.find((company: ICompanyBlueprint) =>
          company.name.toLowerCase() === target || company.name.toLowerCase().startsWith(`${target} `)
        );
        setActiveCompany(match || res.companies[0] || null);
      } catch (err) {
        if (!isCurrent) return;
        setCompanies([]);
        setActiveCompany(null);
        setError(err instanceof Error ? err.message : 'Unable to load company blueprints.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchCompanies();
    return () => { isCurrent = false; };
  }, [user?.targetCompany, retryCount]);

  const setAsTarget = async () => {
    if (!activeCompany) return;
    setIsSavingTarget(true);
    setTargetMessage(null);
    setTargetError(null);
    try {
      const res = await api.updateProfile({ targetCompany: activeCompany.name });
      if (!res.success || !res.user) {
        throw new Error(res.message || 'Unable to update your target company.');
      }
      updateUser(res.user);
      setTargetMessage(`${activeCompany.name} is now your target company.`);
    } catch (err) {
      setTargetError(err instanceof Error ? err.message : 'Unable to update your target company.');
    } finally {
      setIsSavingTarget(false);
    }
  };

  const weights = activeCompany?.sde1SkillWeightage || activeCompany?.skillWeightage;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Company Intelligence Blueprints</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Company-Specific Placement Hub</h1>
          <p className="text-sm text-ink-500 mt-1">
            Role-to-skill mappings, hiring round blueprints, past interview questions, and cutoff benchmarks.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="panel p-8 text-sm text-ink-500" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" />
            Loading company blueprints...
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-lg bg-stone-200" />
            <div className="h-28 animate-pulse rounded-lg bg-stone-200" />
          </div>
        </div>
      ) : error ? (
        <div className="panel p-8" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn-500" />
            <div>
              <h2 className="font-semibold">Company blueprints could not be loaded</h2>
              <p className="mt-1 text-sm text-ink-500">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount(count => count + 1)}
                className="btn-primary mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
              >
                <RotateCw className="h-4 w-4" /> Retry
              </button>
            </div>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="panel p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-amber-600" />
          <h2 className="mt-3 font-semibold">No company blueprints yet</h2>
          <p className="mt-1 text-sm text-ink-500">Company preparation data will appear here when it is available.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 border-b border-line-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Select a company">
              {companies.map(company => (
                <button
                  key={company.id}
                  type="button"
                  aria-pressed={activeCompany?.id === company.id}
                  onClick={() => {
                    setActiveCompany(company);
                    setTargetMessage(null);
                    setTargetError(null);
                  }}
                  className={`rounded-lg border px-3 py-2 text-left transition ${activeCompany?.id === company.id
                    ? 'border-amber-600 bg-amber-100 text-ink-900 shadow-sm'
                    : 'border-line-100 bg-white text-ink-700 hover:border-amber-300'
                    }`}
                >
                  <span className="block text-sm font-semibold">{company.name}</span>
                  <span className="block text-[10px] text-ink-500">{company.tier}</span>
                </button>
              ))}
            </div>
            {activeCompany && (
              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={setAsTarget}
                  disabled={isSavingTarget || user?.targetCompany === activeCompany.name}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {user?.targetCompany === activeCompany.name ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  {isSavingTarget ? 'Saving...' : user?.targetCompany === activeCompany.name ? 'Current target' : 'Set as my target'}
                </button>
                {targetMessage && <p className="text-xs text-success-500" role="status">{targetMessage}</p>}
                {targetError && <p className="text-xs text-warn-500" role="alert">{targetError}</p>}
              </div>
            )}
          </div>

          {activeCompany && weights && (
            <div className="space-y-6">
              <section className="panel p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-700">
                      <span className="status-tag px-2 py-1">{activeCompany.tier} tier</span>
                      <span className="status-tag px-2 py-1">{activeCompany.difficultyLevel}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold">{activeCompany.name} hiring process</h2>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-500">{activeCompany.description}</p>
                  </div>
                  <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">SDE-1 blueprint</span>
                </div>

                <div className="mt-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4 text-amber-600" /> Hiring-round timeline</h3>
                  <ol className="mt-4 space-y-3">
                    {activeCompany.hiringRounds.map((round, index) => (
                      <li key={`${round.roundNumber}-${round.name}`} className="relative flex gap-4">
                        <div className="flex w-8 shrink-0 flex-col items-center">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">{round.roundNumber}</span>
                          {index < activeCompany.hiringRounds.length - 1 && <span className="mt-1 w-px flex-1 bg-amber-200" />}
                        </div>
                        <div className="panel-muted mb-2 min-w-0 flex-1 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold">{round.name}</h4>
                            <span className="status-tag px-2 py-1 text-[10px] font-semibold">{round.type}</span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-ink-500">{round.description}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {round.keyTopics.map(topic => <span key={topic} className="rounded-md border border-line-100 bg-white px-2 py-1 text-[10px] text-ink-600">{topic}</span>)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="panel p-5 sm:p-6">
                  <h3 className="text-sm font-semibold">SDE-1 skill weightage</h3>
                  <div className="mt-5 space-y-4">
                    {[
                      ['Data structures & coding', weights.dsa, 'bg-amber-600'],
                      ['Aptitude & math', weights.aptitude, 'bg-emerald-600'],
                      ['Core computer science', weights.coreCs, 'bg-sky-700'],
                      ['Programming languages', weights.languages, 'bg-rose-600'],
                      ['Technical interview', weights.interview, 'bg-indigo-600']
                    ].map(([label, value, color]) => (
                      <div key={String(label)}>
                        <div className="mb-1.5 flex justify-between gap-3 text-xs">
                          <span className="text-ink-600">{label}</span>
                          <span className="font-bold text-ink-900">{value}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-stone-200" role="meter" aria-label={`${label} weightage`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(value)}>
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-line-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase text-ink-500">Frequently asked topics</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeCompany.frequentlyAskedTopics.map(topic => <span key={topic} className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900">{topic}</span>)}
                    </div>
                  </div>
                </section>

                <section className="panel p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4 text-amber-600" /> Sample past questions</h3>
                  <div className="mt-4 space-y-3">
                    {(activeCompany.samplePastQuestions || []).map((item, index) => (
                      <article key={`${item.topic}-${index}`} className="panel-muted p-4">
                        <span className="text-[10px] font-bold uppercase text-amber-700">{item.topic}</span>
                        <p className="mt-1 text-sm leading-relaxed text-ink-800">{item.question}</p>
                      </article>
                    ))}
                  </div>
                  {activeCompany.cutoffBenchmark && (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-800"><Target className="h-4 w-4" /> Cutoff benchmark</div>
                      <p className="mt-2 text-xs font-semibold text-ink-800">{activeCompany.cutoffBenchmark.assessment}: {activeCompany.cutoffBenchmark.benchmark}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{activeCompany.cutoffBenchmark.notes}</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
