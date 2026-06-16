import type { ResourceName } from '@fitness/shared';

export interface AdminField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'tags' | 'lines' | 'status';
  required?: boolean;
}

export interface AdminResourceConfig {
  resource: ResourceName;
  title: string;
  fields: AdminField[];
}

const baseFields: AdminField[] = [
  { name: 'name', label: '名称', type: 'text', required: true },
  { name: 'summary', label: '摘要', type: 'textarea', required: true },
  { name: 'tags', label: '标签（逗号分隔）', type: 'tags' },
  { name: 'sortOrder', label: '排序', type: 'number' },
  { name: 'sourceUrls', label: '来源链接（每行一个）', type: 'lines' },
  { name: 'status', label: '状态', type: 'status' },
];

export const adminResourceConfigs: AdminResourceConfig[] = [
  {
    resource: 'exercises',
    title: '运动方法',
    fields: [
      ...baseFields,
      { name: 'category', label: '分类', type: 'text' },
      { name: 'difficulty', label: '难度 easy/medium/hard', type: 'text' },
      { name: 'durationMinutes', label: '建议时长（分钟）', type: 'number' },
      { name: 'metValue', label: 'MET 值', type: 'number' },
      { name: 'caloriesReference', label: '参考消耗（千卡）', type: 'number' },
      { name: 'methodSteps', label: '方法步骤（每行一个）', type: 'lines' },
      { name: 'persistenceTips', label: '坚持建议（每行一个）', type: 'lines' },
      { name: 'contraindications', label: '注意事项（每行一个）', type: 'lines' },
    ],
  },
  {
    resource: 'foods',
    title: '食物热量',
    fields: [
      ...baseFields,
      { name: 'category', label: '分类', type: 'text' },
      { name: 'caloriesPer100g', label: '每 100g 热量', type: 'number' },
      { name: 'protein', label: '蛋白质（g）', type: 'number' },
      { name: 'fat', label: '脂肪（g）', type: 'number' },
      { name: 'carbs', label: '碳水（g）', type: 'number' },
      { name: 'servingSuggestion', label: '食用建议', type: 'textarea' },
    ],
  },
  {
    resource: 'recipes',
    title: '减脂菜谱',
    fields: [
      ...baseFields,
      { name: 'mealType', label: '餐别', type: 'text' },
      { name: 'ingredients', label: '食材（每行一个）', type: 'lines' },
      { name: 'steps', label: '步骤（每行一个）', type: 'lines' },
      { name: 'caloriesPerServing', label: '每份热量', type: 'number' },
      { name: 'suitableFor', label: '适合 BMI 分类（逗号分隔）', type: 'tags' },
    ],
  },
  {
    resource: 'medicines',
    title: '辅助药物',
    fields: [
      ...baseFields,
      { name: 'type', label: '类型', type: 'text' },
      { name: 'mechanism', label: '作用机制', type: 'textarea' },
      { name: 'suitableDescription', label: '适用说明', type: 'textarea' },
      { name: 'usageNote', label: '使用说明', type: 'textarea' },
      { name: 'sideEffects', label: '副作用（每行一个）', type: 'lines' },
      { name: 'contraindications', label: '禁忌/慎用（每行一个）', type: 'lines' },
      { name: 'medicalWarning', label: '医疗提示', type: 'textarea' },
    ],
  },
];
