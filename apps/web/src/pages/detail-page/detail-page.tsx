import { Alert, Card, Descriptions, Skeleton, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import type { Exercise, Food, Medicine, Recipe, ResourceItem } from '@fitness/shared';

import { catalogConfigs, isCatalogResource } from '@/features/catalog/catalog-config';
import PublicLayout from '@/layouts/public-layout';
import { catalogService } from '@/services/catalog.service';
import { formatCalories, joinText, toTextList } from '@/utils/format';

import styles from './detail-page.module.css';

const renderExtra = (resource: string, item: ResourceItem) => {
  if (resource === 'exercises') {
    const exercise = item as Exercise;
    return [
      ['分类', exercise.category],
      ['难度', exercise.difficulty],
      ['建议时长', `${exercise.durationMinutes} 分钟`],
      ['参考消耗', formatCalories(exercise.caloriesReference)],
      ['方法', joinText(exercise.methodSteps)],
      ['坚持建议', joinText(exercise.persistenceTips)],
      ['注意事项', joinText(exercise.contraindications)],
    ];
  }
  if (resource === 'foods') {
    const food = item as Food;
    return [
      ['分类', food.category],
      ['每 100g 热量', formatCalories(food.caloriesPer100g)],
      ['蛋白质', `${food.protein}g`],
      ['脂肪', `${food.fat}g`],
      ['碳水', `${food.carbs}g`],
      ['食用建议', food.servingSuggestion],
    ];
  }
  if (resource === 'recipes') {
    const recipe = item as Recipe;
    return [
      ['餐别', recipe.mealType],
      ['每份热量', formatCalories(recipe.caloriesPerServing)],
      ['食材', joinText(recipe.ingredients)],
      ['步骤', joinText(recipe.steps)],
      ['适合人群', joinText(recipe.suitableFor)],
    ];
  }
  const medicine = item as Medicine;
  return [
    ['类型', medicine.type],
    ['作用机制', medicine.mechanism],
    ['适用说明', medicine.suitableDescription],
    ['使用说明', medicine.usageNote],
    ['副作用', joinText(medicine.sideEffects)],
    ['禁忌/慎用', joinText(medicine.contraindications)],
    ['医疗提示', medicine.medicalWarning],
  ];
};

const DetailPage = () => {
  const { resource = '', id = '' } = useParams();
  const [item, setItem] = useState<ResourceItem>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  if (!isCatalogResource(resource)) return <Navigate to="/" replace />;

  useEffect(() => {
    setLoading(true);
    catalogService
      .getItem(resource, id)
      .then(setItem)
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : '加载失败'),
      )
      .finally(() => setLoading(false));
  }, [id, resource]);

  return (
    <PublicLayout>
      {loading && <Skeleton active />}
      {error && <Alert type="error" message={error} showIcon />}
      {item && (
        <article className={styles.detail}>
          <div className={styles.heading}>
            <span>{catalogConfigs[resource].title}</span>
            <h1>{item.name}</h1>
            <p>{item.summary}</p>
            <div>
              {toTextList(item.tags).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
          <Card>
            <Descriptions column={1} bordered>
              {renderExtra(resource, item).map(([label, value]) => (
                <Descriptions.Item key={label} label={label}>
                  {value}
                </Descriptions.Item>
              ))}
              <Descriptions.Item label="来源">
                {toTextList(item.sourceUrls).map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          {resource === 'medicines' && (
            <Alert
              className={styles.warning}
              type="warning"
              showIcon
              message="辅助药物栏目仅做科普，不提供个人用药建议。"
            />
          )}
        </article>
      )}
    </PublicLayout>
  );
};

export default DetailPage;
