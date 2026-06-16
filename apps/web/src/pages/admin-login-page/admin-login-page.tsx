import { LockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminService } from '@/services/admin.service';

import styles from './admin-login-page.module.css';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: { password: string }) => {
    setLoading(true);
    setError('');
    try {
      await adminService.login(values.password);
      navigate('/admin/manage');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <h1>管理后台</h1>
        <p>维护运动、饮食和辅助药物科普数据。</p>
        {error && <Alert type="error" message={error} showIcon className={styles.alert} />}
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="password"
            label="管理员密码"
            rules={[{ required: true, message: '请输入管理员密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入管理员密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form>
      </Card>
    </main>
  );
};

export default AdminLoginPage;
