import { Alert, Button, Card, Form, InputNumber, Radio, Select, message } from 'antd';
import { useEffect, useState } from 'react';

import type { AssessmentInput, SiteSettings } from '@fitness/shared';

import { settingsService } from '@/services/settings.service';

const activityOptions = [
  { label: '久坐少动', value: 'sedentary' },
  { label: '轻度活动', value: 'light' },
  { label: '中等活动', value: 'moderate' },
  { label: '高活动量', value: 'active' },
  { label: '很高活动量', value: 'very-active' },
];

const SiteSettingsForm = () => {
  const [form] = Form.useForm<AssessmentInput>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const settings = await settingsService.getAdmin();
        form.setFieldsValue(settings.assessmentDefaults);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : '配置加载失败');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [form]);

  const handleFinish = async (values: AssessmentInput) => {
    setSaving(true);
    try {
      const payload: Partial<SiteSettings> = {
        assessmentDefaults: values,
      };
      const settings = await settingsService.update(payload);
      form.setFieldsValue(settings.assessmentDefaults);
      messageApi.success('首页健康评估默认数据已保存');
    } catch (requestError) {
      messageApi.error(requestError instanceof Error ? requestError.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card loading={loading}>
      {contextHolder}
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="默认身高（cm）"
          name="heightCm"
          rules={[{ required: true, message: '请输入默认身高' }]}
        >
          <InputNumber min={120} max={230} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="默认体重（kg）"
          name="weightKg"
          rules={[{ required: true, message: '请输入默认体重' }]}
        >
          <InputNumber min={30} max={250} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="默认年龄"
          name="age"
          rules={[{ required: true, message: '请输入默认年龄' }]}
        >
          <InputNumber min={18} max={100} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="默认性别" name="gender" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: '女性', value: 'female' },
              { label: '男性', value: 'male' },
            ]}
          />
        </Form.Item>
        <Form.Item label="默认活动水平" name="activityLevel" rules={[{ required: true }]}>
          <Select options={activityOptions} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          保存首页默认数据
        </Button>
      </Form>
    </Card>
  );
};

export default SiteSettingsForm;
