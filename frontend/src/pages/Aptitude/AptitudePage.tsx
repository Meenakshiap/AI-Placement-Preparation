import React from 'react';
import { Calculator, Clock, CheckCircle2, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const APTITUDE_TESTS = [
  { id: 'tcs_nqt', title: 'TCS NQT Cognitive Simulation', questions: 30, duration: '45 mins', focus: 'Numerical Ability, Reasoning, Verbal', difficulty: 'Moderate' },
  { id: 'quant_speed', title: 'Quantitative Speed Drill: Time & Work, Speed Distance', questions: 15, duration: '20 mins', focus: 'Work & Efficiency, Relative Speed', difficulty: 'Medium' },
  { id: 'logical_ded', title: 'Logical Reasoning: Syllogisms & Seating Arrangements', questions: 20, duration: '25 mins', focus: 'Linear/Circular Arrangement, Deductions', difficulty: 'Hard' },
  { id: 'di_charts', title: 'Data Interpretation: Graphs & Tables Mastery', questions: 15, duration: '20 mins', focus: 'Pie Charts, Bar Graphs, Percentages', difficulty: 'Medium' }
];

export const AptitudePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Placement Aptitude Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Aptitude & Speed Training</h1>
          <p className="text-sm text-ink-500 mt-1">
            Timed mock tests, topic quizzes, negative marking simulator, and speed-accuracy analytics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {APTITUDE_TESTS.map(t => (
          <div key={t.id} className="panel p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-amber-300 transition">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {t.difficulty}
                </span>
                <span className="text-xs text-ink-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.duration}</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink-900">{t.title}</h3>
              <p className="text-xs text-ink-500">Coverage: {t.focus}</p>
            </div>

            <div className="pt-4 border-t border-line-100 flex items-center justify-between">
              <span className="text-xs text-ink-500">{t.questions} Questions</span>
              <button
                onClick={() => alert(`Starting ${t.title} timed assessment test...`)}
                className="btn-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition shadow-md"
              >
                <span>Start Timed Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
