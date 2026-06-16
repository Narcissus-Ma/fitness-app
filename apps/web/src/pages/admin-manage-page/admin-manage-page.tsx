import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Layout, Menu, Modal, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ResourceItem, ResourceName } from '@fitness/shared';

import { adminResourceConfigs } from '@/features/admin/admin-resource-config';
import ResourceForm from '@/features/admin/components/resource-form';
import { adminService } from '@/services/admin.service';

import styles from './admin-manage-page.module.css';

const formId = 'resource-form';

const AdminManagePage = () => {
  const navigate = useNavigate();
  const [activeResource, setActiveResource] = useState<ResourceName>('exercises');
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const config = useMemo(
    () => adminResourceConfigs.find((item) => item.resource === activeResource)!,
    [activeResource],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminService.list(activeResource));
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '加载失败');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  }, [activeResource, messageApi, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingItem) {
        await adminService.update(activeResource, editingItem.id, values);
      } else {
        await adminService.create(activeResource, values);
      }
      messageApi.success('保存成功');
      setDrawerOpen(false);
      setEditingItem(undefined);
      await load();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '保存失败');
    }
  };

  const handleDelete = (item: ResourceItem) => {
    Modal.confirm({
      title: `确认删除「${item.name}」？`,
      content: '删除后前台将不再展示该内容。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await adminService.remove(activeResource, item.id);
        await load();
      },
    });
  };

  const columns: ColumnsType<ResourceItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 220,
      render: (value: string, record) => (
        <div>
          <strong>{value}</strong>
          <p className={styles.summary}>{record.summary}</p>
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => tags.map((tag) => <Tag key={tag}>{tag}</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => <Tag color={value === 'enabled' ? 'green' : 'default'}>{value}</Tag>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
    },
    {
      title: '操作',
      width: 230,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              setDrawerOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            icon={<PoweroffOutlined />}
            onClick={async () => {
              await adminService.setStatus(
                activeResource,
                record.id,
                record.status === 'enabled' ? 'disabled' : 'enabled',
              );
              await load();
            }}
          >
            {record.status === 'enabled' ? '停用' : '启用'}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <Layout className={styles.page}>
      {contextHolder}
      <Layout.Sider width={220} className={styles.sider}>
        <div className={styles.brand}>健康减脂后台</div>
        <Menu
          theme="dark"
          selectedKeys={[activeResource]}
          items={adminResourceConfigs.map((item) => ({ key: item.resource, label: item.title }))}
          onClick={({ key }) => setActiveResource(key as ResourceName)}
        />
      </Layout.Sider>
      <Layout className={styles.contentLayout}>
        <header className={styles.header}>
          <div>
            <h1>{config.title}</h1>
            <p>结构化维护前台展示内容，保存后将同步写入 Workers KV。</p>
          </div>
          <Space>
            <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
              回到主页
            </Button>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setEditingItem(undefined);
                setDrawerOpen(true);
              }}
            >
              新增
            </Button>
            <Button
              onClick={() => {
                adminService.logout();
                navigate('/admin');
              }}
            >
              退出
            </Button>
          </Space>
        </header>
        <main className={styles.main}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={items}
            scroll={{ x: 900 }}
            pagination={{ pageSize: 8 }}
          />
        </main>
      </Layout>
      <Drawer
        width={560}
        title={editingItem ? `编辑${config.title}` : `新增${config.title}`}
        open={drawerOpen}
        destroyOnHidden
        onClose={() => {
          setDrawerOpen(false);
          setEditingItem(undefined);
        }}
        extra={
          <Button type="primary" htmlType="submit" form={formId}>
            保存
          </Button>
        }
      >
        <ResourceForm config={config} item={editingItem} formId={formId} onSubmit={handleSubmit} />
      </Drawer>
    </Layout>
  );
};

export default AdminManagePage;
