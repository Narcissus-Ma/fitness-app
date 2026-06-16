import {
  ActivityLevel,
  AssessmentInput,
  calculateAssessment,
  defaultAssessmentDefaults,
} from '@fitness/shared';
import { Alert, Button, Card, Form, InputNumber, Radio, Select, Statistic, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import styles from './assessment-panel.module.css';

const activityOptions: Array<{ label: string; value: ActivityLevel }> = [
  { label: '久坐少动', value: 'sedentary' },
  { label: '轻度活动', value: 'light' },
  { label: '中等活动', value: 'moderate' },
  { label: '高活动量', value: 'active' },
  { label: '很高活动量', value: 'very-active' },
];

interface AssessmentPanelProps {
  initialValues?: AssessmentInput;
  onCategoryChange: (category: string) => void;
}

const AssessmentPanel = ({
  initialValues = defaultAssessmentDefaults,
  onCategoryChange,
}: AssessmentPanelProps) => {
  const [form] = Form.useForm<AssessmentInput>();
  const [formValues, setFormValues] = useState<AssessmentInput>(initialValues);
  const result = useMemo(() => calculateAssessment(formValues), [formValues]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
    setFormValues(initialValues);
    onCategoryChange(calculateAssessment(initialValues).bmiCategory.key);
  }, [form, initialValues, onCategoryChange]);

  const handleFinish = (values: AssessmentInput) => {
    setFormValues(values);
    onCategoryChange(calculateAssessment(values).bmiCategory.key);
  };

  return (
    <section className={styles.panel}>
      <Card className={styles.formCard}>
        <div className={styles.heading}>
          <span>健康状态评估</span>
          <p>输入基础信息，估算 BMI、基础代谢和每日总消耗。</p>
        </div>
        <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish}>
          <div className={styles.formGrid}>
            <Form.Item
              label="身高（cm）"
              name="heightCm"
              rules={[{ required: true, message: '请输入身高' }]}
            >
              <InputNumber min={120} max={230} className={styles.fullWidth} />
            </Form.Item>
            <Form.Item
              label="体重（kg）"
              name="weightKg"
              rules={[{ required: true, message: '请输入体重' }]}
            >
              <InputNumber min={30} max={250} className={styles.fullWidth} />
            </Form.Item>
            <Form.Item label="年龄" name="age" rules={[{ required: true, message: '请输入年龄' }]}>
              <InputNumber min={18} max={100} className={styles.fullWidth} />
            </Form.Item>
            <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
              <Radio.Group
                options={[
                  { label: '女性', value: 'female' },
                  { label: '男性', value: 'male' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item label="日常活动水平" name="activityLevel" rules={[{ required: true }]}>
            <Select options={activityOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            重新计算
          </Button>
        </Form>
      </Card>

      <Card className={styles.resultCard}>
        <Tag color="green">成人科普估算</Tag>
        <div className={styles.stats}>
          <Statistic title="BMI" value={result.bmi} suffix={result.bmiCategory.label} />
          <Statistic title="基础代谢 BMR" value={result.bmr} suffix="千卡/日" />
          <Statistic title="每日总消耗 TDEE" value={result.tdee} suffix="千卡/日" />
          <Statistic
            title="建议摄入参考"
            value={result.recommendedDailyCalories}
            suffix="千卡/日"
          />
        </div>
        <Alert
          type="info"
          showIcon
          message={result.bmiCategory.advice}
          description={result.disclaimer}
        />
      </Card>
    </section>
  );
};

export default AssessmentPanel;
