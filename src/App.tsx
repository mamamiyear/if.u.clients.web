import LayoutWrapper from './components/LayoutWrapper';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <LayoutWrapper />
    </ConfigProvider>
  );
}

export default App;
