import { describe, expect, it } from 'vitest';

import { calculateAssessment, getBmiCategory, getRecommendedCalorieDeficit } from '../src/index';

describe('健康评估计算', () => {
  it('根据身高体重计算 BMI 并返回成人分类', () => {
    expect(getBmiCategory(17.8).label).toBe('偏瘦');
    expect(getBmiCategory(22.5).label).toBe('正常');
    expect(getBmiCategory(27.2).label).toBe('超重');
    expect(getBmiCategory(32.1).label).toBe('肥胖');
  });

  it('使用 Mifflin-St Jeor 和活动系数计算 BMR 与 TDEE', () => {
    const result = calculateAssessment({
      heightCm: 170,
      weightKg: 80,
      age: 35,
      gender: 'male',
      activityLevel: 'light',
    });

    expect(result.bmi).toBe(27.68);
    expect(result.bmiCategory.label).toBe('超重');
    expect(result.bmr).toBe(1693);
    expect(result.tdee).toBe(2327);
  });

  it('根据 BMI 分类返回保守热量缺口建议', () => {
    expect(getRecommendedCalorieDeficit('underweight')).toBe(0);
    expect(getRecommendedCalorieDeficit('normal')).toBe(200);
    expect(getRecommendedCalorieDeficit('overweight')).toBe(400);
    expect(getRecommendedCalorieDeficit('obese')).toBe(500);
  });
});
