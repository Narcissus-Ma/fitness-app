import type { ActivityLevel, AssessmentInput, Gender, SiteSettings } from './types';

const validGenders: Gender[] = ['female', 'male'];

const validActivityLevels: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very-active',
];

export const defaultAssessmentDefaults: AssessmentInput = {
  heightCm: 170,
  weightKg: 70,
  age: 30,
  gender: 'female',
  activityLevel: 'light',
};

export const defaultSiteSettings: SiteSettings = {
  assessmentDefaults: defaultAssessmentDefaults,
  updatedAt: '2026-06-16T00:00:00.000Z',
};

const readNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) return fallback;
  return Math.round(numberValue);
};

export const normalizeAssessmentDefaults = (
  defaults: Partial<AssessmentInput> = {},
): AssessmentInput => ({
  heightCm: readNumber(defaults.heightCm, defaultAssessmentDefaults.heightCm, 120, 230),
  weightKg: readNumber(defaults.weightKg, defaultAssessmentDefaults.weightKg, 30, 250),
  age: readNumber(defaults.age, defaultAssessmentDefaults.age, 18, 100),
  gender: validGenders.includes(defaults.gender as Gender)
    ? (defaults.gender as Gender)
    : defaultAssessmentDefaults.gender,
  activityLevel: validActivityLevels.includes(defaults.activityLevel as ActivityLevel)
    ? (defaults.activityLevel as ActivityLevel)
    : defaultAssessmentDefaults.activityLevel,
});

export const normalizeSiteSettings = (settings: Partial<SiteSettings> = {}): SiteSettings => ({
  assessmentDefaults: normalizeAssessmentDefaults(settings.assessmentDefaults),
  updatedAt: settings.updatedAt || new Date().toISOString(),
});
