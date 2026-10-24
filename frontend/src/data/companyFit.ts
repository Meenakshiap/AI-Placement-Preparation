export type SkillName = 'aptitude' | 'dsa' | 'languages' | 'coreCs' | 'interview';

export type CompanyFitWeights = Record<SkillName, number>;

export type SkillScores = Partial<Record<SkillName, number>>;

export type CompanyFitResult = {
  company: string;
  score: number;
  weakSkills: SkillName[];
  strengths: SkillName[];
};

export const companyFitConfig: Record<string, CompanyFitWeights> = {
  TCS: {
    aptitude: 0.4,
    dsa: 0.15,
    languages: 0.15,
    coreCs: 0.15,
    interview: 0.15
  },
  Amazon: {
    aptitude: 0.08,
    dsa: 0.45,
    languages: 0.15,
    coreCs: 0.17,
    interview: 0.15
  },
  Google: {
    aptitude: 0.08,
    dsa: 0.35,
    languages: 0.12,
    coreCs: 0.15,
    interview: 0.3
  }
};

export const calculateCompanyFit = (
  companyName: string,
  studentScores: SkillScores,
  threshold = 65
): CompanyFitResult => {
  const weights = companyFitConfig[companyName];

  if (!weights) {
    return {
      company: companyName,
      score: 0,
      weakSkills: [],
      strengths: []
    };
  }

  const skillEntries = Object.entries(weights) as [SkillName, number][];

  const safeScore = (value: number) => {
    const numeric = Number.isFinite(value) ? value : 0;
    return Math.min(100, Math.max(0, numeric));
  };

  let weightedTotal = 0;
  let totalWeight = 0;

  for (const [skill, weight] of skillEntries) {
    const score = safeScore(studentScores[skill] ?? 0);
    weightedTotal += score * weight;
    totalWeight += weight;
  }

  const rawScore = totalWeight > 0 ? weightedTotal / totalWeight : 0;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  const weakSkills = skillEntries
    .filter(([skill, _weight]) => safeScore(studentScores[skill] ?? 0) < threshold)
    .map(([skill]) => skill);

  const strengths = skillEntries
    .filter(([skill, _weight]) => safeScore(studentScores[skill] ?? 0) >= threshold)
    .map(([skill]) => skill);

  return {
    company: companyName,
    score,
    weakSkills,
    strengths
  };
};

export const calculateAllCompanyFits = (studentScores: SkillScores): Record<string, CompanyFitResult> => {
  const companyNames = Object.keys(companyFitConfig);

  const results: Record<string, CompanyFitResult> = {};

  for (const companyName of companyNames) {
    results[companyName] = calculateCompanyFit(companyName, studentScores);
  }

  return results;
};
