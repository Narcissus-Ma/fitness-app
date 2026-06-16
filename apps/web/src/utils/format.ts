export const formatCalories = (value: number) => `${Math.round(value)} 千卡`;

export const toTextList = (items: unknown): string[] =>
  Array.isArray(items)
    ? items.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];

export const joinText = (items: unknown) => {
  const textList = toTextList(items);
  return textList.length > 0 ? textList.join('、') : '暂无';
};
