import { describe, expect, it } from 'vitest';

import { joinText, toTextList } from './format';

describe('格式化工具', () => {
  it('数组字段缺失时返回安全默认值', () => {
    expect(toTextList(undefined)).toEqual([]);
    expect(joinText(undefined)).toBe('暂无');
  });

  it('过滤非字符串和空字符串', () => {
    expect(toTextList(['早餐', '', 123, '晚餐'])).toEqual(['早餐', '晚餐']);
    expect(joinText(['早餐', '晚餐'])).toBe('早餐、晚餐');
  });
});
