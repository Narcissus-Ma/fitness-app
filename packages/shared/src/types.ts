export type ContentStatus = 'enabled' | 'disabled';

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

export type BmiCategoryKey = 'underweight' | 'normal' | 'overweight' | 'obese';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BaseContent {
  id: string;
  name: string;
  summary: string;
  tags: string[];
  status: ContentStatus;
  sortOrder: number;
  sourceUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise extends BaseContent {
  category: string;
  difficulty: Difficulty;
  methodSteps: string[];
  durationMinutes: number;
  metValue: number;
  caloriesReference: number;
  persistenceTips: string[];
  contraindications: string[];
}

export interface Food extends BaseContent {
  category: string;
  caloriesPer100g: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSuggestion: string;
}

export interface Recipe extends BaseContent {
  mealType: string;
  ingredients: string[];
  steps: string[];
  caloriesPerServing: number;
  macros: {
    protein: number;
    fat: number;
    carbs: number;
  };
  suitableFor: BmiCategoryKey[];
}

export interface Medicine extends BaseContent {
  type: string;
  mechanism: string;
  suitableDescription: string;
  usageNote: string;
  sideEffects: string[];
  contraindications: string[];
  medicalWarning: string;
}

export interface Catalog {
  exercises: Exercise[];
  foods: Food[];
  recipes: Recipe[];
  medicines: Medicine[];
}

export interface AssessmentInput {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
}

export interface SiteSettings {
  assessmentDefaults: AssessmentInput;
  updatedAt: string;
}

export interface BmiCategory {
  key: BmiCategoryKey;
  label: string;
  range: string;
  advice: string;
}

export interface AssessmentResult {
  bmi: number;
  bmiCategory: BmiCategory;
  bmr: number;
  tdee: number;
  recommendedDailyCalories: number;
  calorieDeficit: number;
  disclaimer: string;
}

export type ResourceName = 'exercises' | 'foods' | 'recipes' | 'medicines';

export type ResourceItem = Exercise | Food | Recipe | Medicine;
