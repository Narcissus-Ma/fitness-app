import { Form, Input, InputNumber, Select } from 'antd';
import { useEffect } from 'react';

import type { ResourceItem } from '@fitness/shared';

import type { AdminResourceConfig } from '../admin-resource-config';

interface ResourceFormProps {
  config: AdminResourceConfig;
  item?: ResourceItem;
  formId: string;
  onSubmit: (values: Record<string, unknown>) => void;
}

const arrayToText = (value: unknown) => (Array.isArray(value) ? value.join('\n') : value);

const normalizeInitialValue = (item?: ResourceItem) => {
  if (!item) return { status: 'enabled', sortOrder: 100 };
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join('\n') : value,
    ]),
  );
};

export const normalizeSubmitValue = (
  values: Record<string, unknown>,
  config: AdminResourceConfig,
) => {
  const payload = { ...values };
  config.fields.forEach((field) => {
    const value = payload[field.name];
    if (field.type === 'lines') {
      payload[field.name] = String(value ?? '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (field.type === 'tags') {
      payload[field.name] = String(value ?? '')
        .split(/[,，\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  });

  if (config.resource === 'recipes') {
    payload.macros = { protein: 0, fat: 0, carbs: 0 };
  }

  return payload;
};

const ResourceForm = ({ config, item, formId, onSubmit }: ResourceFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(normalizeInitialValue(item));
  }, [form, item]);

  return (
    <Form
      id={formId}
      form={form}
      layout="vertical"
      onFinish={(values) => onSubmit(normalizeSubmitValue(values, config))}
    >
      {config.fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          getValueProps={(value) => ({ value: arrayToText(value) })}
          rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined}
        >
          {field.type === 'number' ? (
            <InputNumber min={0} style={{ width: '100%' }} />
          ) : field.type === 'textarea' || field.type === 'lines' || field.type === 'tags' ? (
            <Input.TextArea rows={field.type === 'textarea' ? 3 : 4} />
          ) : field.type === 'status' ? (
            <Select
              options={[
                { label: '启用', value: 'enabled' },
                { label: '停用', value: 'disabled' },
              ]}
            />
          ) : (
            <Input placeholder="请输入内容" />
          )}
        </Form.Item>
      ))}
    </Form>
  );
};

export default ResourceForm;
