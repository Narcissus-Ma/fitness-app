import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import AppRouter from './router';

const App = () => (
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {
        colorPrimary: '#1f8a70',
        borderRadius: 8,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      },
    }}
  >
    <AppRouter />
  </ConfigProvider>
);

export default App;
