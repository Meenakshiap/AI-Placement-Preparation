import React from 'react';
import { calculateAllCompanyFits, SkillScores } from '../data/companyFit.js';

type CompanyFitPanelProps = {
  studentScores: SkillScores;
};

export const CompanyFitPanel: React.FC<CompanyFitPanelProps> = ({ studentScores }) => {
  const results = Object.values(calculateAllCompanyFits(studentScores)).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink-900">Company-Fit Score</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {results.map((result) => (
          <div
            key={result.company}
            className="panel-muted rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-ink-900">{result.company}</h4>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                {result.score}%
              </span>
            </div>

            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${result.score}%` }}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Weak Skills</p>
              {result.weakSkills.length > 0 ? (
                <ul className="space-y-1 text-sm text-warn-500">
                  {result.weakSkills.map((skill) => (
                    <li key={skill}>• {skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-success-500">No major weak skills for this company.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
