import { describe, expect, it } from 'vitest';

import { adminResourceConfigs } from '../admin-resource-config';
import { normalizeSubmitValue } from './resource-form';

describe('后台资源表单归一化', () => {
  it('将标签和多行文本转换为结构化数组', () => {
    const config = adminResourceConfigs.find((item) => item.resource === 'exercises')!;

    const payload = normalizeSubmitValue(
      {
        name: '快走',
        tags: '有氧, 入门',
        methodSteps: '热身 5 分钟\n快走 30 分钟',
        sourceUrls: 'https://example.com\n',
      },
      config,
    );

    expect(payload.tags).toEqual(['有氧', '入门']);
    expect(payload.methodSteps).toEqual(['热身 5 分钟', '快走 30 分钟']);
    expect(payload.sourceUrls).toEqual(['https://example.com']);
  });
});
