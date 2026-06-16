import { Card, Tag } from 'antd';
import { Link } from 'react-router-dom';

import type { Exercise, Food, Medicine, Recipe, ResourceItem, ResourceName } from '@fitness/shared';

import { formatCalories, joinText } from '@/utils/format';

import styles from './content-card.module.css';

interface ContentCardProps {
  resource: ResourceName;
  item: ResourceItem;
}

const getMeta = (resource: ResourceName, item: ResourceItem) => {
  if (resource === 'exercises') {
    const exercise = item as Exercise;
    return [
      `${exercise.category} / ${exercise.difficulty}`,
      `${exercise.durationMinutes} 分钟`,
      formatCalories(exercise.caloriesReference),
    ];
  }
  if (resource === 'foods') {
    const food = item as Food;
    return [
      food.category,
      `每 100g ${formatCalories(food.caloriesPer100g)}`,
      `蛋白质 ${food.protein}g`,
    ];
  }
  if (resource === 'recipes') {
    const recipe = item as Recipe;
    return [
      recipe.mealType,
      `每份 ${formatCalories(recipe.caloriesPerServing)}`,
      `适合：${joinText(recipe.suitableFor)}`,
    ];
  }
  const medicine = item as Medicine;
  return [medicine.type, medicine.mechanism];
};

const ContentCard = ({ resource, item }: ContentCardProps) => (
  <Link to={`/${resource}/${encodeURIComponent(item.id)}`}>
    <Card className={styles.card} hoverable>
      <div className={styles.topLine}>
        <strong>{item.name}</strong>
        <Tag color={item.status === 'enabled' ? 'green' : 'default'}>{item.status}</Tag>
      </div>
      <p>{item.summary}</p>
      <div className={styles.meta}>
        {getMeta(resource, item).map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className={styles.tags}>
        {item.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Card>
  </Link>
);

export default ContentCard;
