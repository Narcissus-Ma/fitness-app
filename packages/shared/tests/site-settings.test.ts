import { describe, expect, it } from 'vitest';

import { defaultSiteSettings, normalizeAssessmentDefaults } from '../src/index';

describe('站点配置', () => {
  it('提供首页健康评估默认值', () => {
    expect(defaultSiteSettings.assessmentDefaults).toEqual({
      heightCm: 170,
      weightKg: 70,
      age: 30,
      gender: 'female',
      activityLevel: 'light',
    });
  });

  it('归一化非法默认值并保留合法输入', () => {
    expect(
      normalizeAssessmentDefaults({
        heightCm: 300,
        weightKg: 80,
        age: 15,
        gender: 'male',
        activityLevel: 'moderate',
      }),
    ).toEqual({
      heightCm: 170,
      weightKg: 80,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
    });
  });
});
