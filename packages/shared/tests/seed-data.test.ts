import { describe, expect, it } from 'vitest';

import { seedCatalog } from '../src/index';

describe('初始结构化内容', () => {
  it('包含运动、食物、菜谱、辅助药物四类数据', () => {
    expect(seedCatalog.exercises.length).toBeGreaterThanOrEqual(3);
    expect(seedCatalog.foods.length).toBeGreaterThanOrEqual(4);
    expect(seedCatalog.recipes.length).toBeGreaterThanOrEqual(3);
    expect(seedCatalog.medicines.length).toBeGreaterThanOrEqual(4);
  });

  it('药物数据只保留科普信息和风险提示', () => {
    const names = seedCatalog.medicines.map((item) => item.name);

    expect(names).toEqual(expect.arrayContaining(['奥利司他', '左旋肉碱', '白芸豆', '替尔泊肽']));
    seedCatalog.medicines.forEach((item) => {
      expect(item.medicalWarning.length).toBeGreaterThan(0);
      expect(item.sideEffects.length).toBeGreaterThan(0);
      expect(item.sourceUrls.length).toBeGreaterThan(0);
      expect('personalDoseRule' in item).toBe(false);
    });
  });
});
