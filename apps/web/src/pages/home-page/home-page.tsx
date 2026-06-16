import { Button, Card, Skeleton } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { BmiCategoryKey } from '@fitness/shared';

import AssessmentPanel from '@/features/assessment/components/assessment-panel';
import ContentCard from '@/features/catalog/components/content-card';
import PublicLayout from '@/layouts/public-layout';
import { catalogService } from '@/services/catalog.service';
import { useCatalog } from '@/hooks/use-catalog';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { toTextList } from '@/utils/format';

import styles from './home-page.module.css';

const HomePage = () => {
  const [category, setCategory] = useState<BmiCategoryKey>('normal');
  const exercises = useCatalog({ loader: catalogService.listExercises });
  const recipes = useCatalog({ loader: catalogService.listRecipes });
  const siteSettings = useSiteSettings();
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value as BmiCategoryKey);
  }, []);

  const recommendedRecipes = useMemo(
    () =>
      recipes.items.filter((item) => toTextList(item.suitableFor).includes(category)).slice(0, 2),
    [category, recipes.items],
  );

  return (
    <PublicLayout>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>成人减脂科普工具</span>
          <h1>先评估，再选择能长期坚持的减脂方式</h1>
          <p>
            通过 BMI、基础代谢和每日总消耗估算，连接运动方法、食物热量、减脂菜谱和辅助药物科普。
          </p>
        </div>
      </section>

      <AssessmentPanel
        initialValues={siteSettings.settings.assessmentDefaults}
        onCategoryChange={handleCategoryChange}
      />

      <section className={styles.recommendations}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>基于评估的内容入口</h2>
            <p>首版采用基础联动：优先展示低门槛运动和适合当前 BMI 分类的菜谱。</p>
          </div>
          <Button>
            <Link to="/recipes">查看全部菜谱</Link>
          </Button>
        </div>
        <div className={styles.grid}>
          {exercises.loading || recipes.loading ? (
            <Skeleton active />
          ) : (
            <>
              {exercises.items.slice(0, 2).map((item) => (
                <ContentCard key={item.id} resource="exercises" item={item} />
              ))}
              {recommendedRecipes.map((item) => (
                <ContentCard key={item.id} resource="recipes" item={item} />
              ))}
            </>
          )}
        </div>
      </section>

      <Card className={styles.warning}>
        <strong>药物与补剂提醒：</strong>
        辅助药物栏目仅做科普信息整理，不提供个人用药建议。涉及处方药、基础疾病、孕期或正在用药时，请咨询医生。
      </Card>
    </PublicLayout>
  );
};

export default HomePage;
