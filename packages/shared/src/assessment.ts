import type {
  ActivityLevel,
  AssessmentInput,
  AssessmentResult,
  BmiCategory,
  BmiCategoryKey,
} from './types';

export const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

export const bmiCategories: BmiCategory[] = [
  {
    key: 'underweight',
    label: '偏瘦',
    range: '< 18.5',
    advice: '当前 BMI 偏低，减重前建议优先关注营养均衡和力量训练。',
  },
  {
    key: 'normal',
    label: '正常',
    range: '18.5 - 24.9',
    advice: '当前 BMI 位于成人常见正常范围，可通过规律运动和饮食结构保持健康状态。',
  },
  {
    key: 'overweight',
    label: '超重',
    range: '25.0 - 29.9',
    advice: '当前 BMI 偏高，可从温和热量缺口、低冲击有氧和力量训练开始。',
  },
  {
    key: 'obese',
    label: '肥胖',
    range: '>= 30.0',
    advice: '当前 BMI 较高，建议结合医生或营养师建议制定减重方案。',
  },
];

export const getBmiCategory = (bmi: number): BmiCategory => {
  if (bmi < 18.5) return bmiCategories[0];
  if (bmi < 25) return bmiCategories[1];
  if (bmi < 30) return bmiCategories[2];
  return bmiCategories[3];
};

export const getRecommendedCalorieDeficit = (category: BmiCategoryKey): number => {
  const deficits: Record<BmiCategoryKey, number> = {
    underweight: 0,
    normal: 200,
    overweight: 400,
    obese: 500,
  };

  return deficits[category];
};

export const calculateAssessment = (input: AssessmentInput): AssessmentResult => {
  const heightM = input.heightCm / 100;
  const bmi = input.weightKg / heightM ** 2;
  const genderOffset = input.gender === 'male' ? 5 : -161;
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + genderOffset;
  const tdee = bmr * activityFactors[input.activityLevel];
  const bmiCategory = getBmiCategory(bmi);
  const calorieDeficit = getRecommendedCalorieDeficit(bmiCategory.key);

  return {
    bmi: Number(bmi.toFixed(2)),
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommendedDailyCalories: Math.max(Math.round(tdee - calorieDeficit), 1200),
    calorieDeficit,
    disclaimer: '以上结果为成人健康科普估算，不构成诊断、处方或个体化医疗建议。',
  };
};
