import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

import { routes } from '@/constants/routes';

import styles from './public-layout.module.css';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { key: routes.home, label: <Link to={routes.home}>健康评估</Link> },
  { key: routes.exercises, label: <Link to={routes.exercises}>运动方法</Link> },
  { key: routes.foods, label: <Link to={routes.foods}>食物热量</Link> },
  { key: routes.recipes, label: <Link to={routes.recipes}>减脂菜谱</Link> },
  { key: routes.medicines, label: <Link to={routes.medicines}>辅助药物</Link> },
];

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const location = useLocation();
  const selectedKey = navItems.find(
    (item) => location.pathname.startsWith(item.key) && item.key !== '/',
  )?.key;

  return (
    <Layout className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>减</span>
          <span>
            <strong>健康减脂百科</strong>
            <small>评估、运动、饮食与药物科普</small>
          </span>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey || location.pathname]}
          items={navItems}
          className={styles.nav}
        />
        <Link to="/admin" className={styles.adminLink}>
          后台
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
    </Layout>
  );
};

export default PublicLayout;
