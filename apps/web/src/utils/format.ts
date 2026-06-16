export const formatCalories = (value: number) => `${Math.round(value)} 千卡`;

export const joinText = (items: string[]) => items.filter(Boolean).join('、');
