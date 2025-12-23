import LayoutWrapper from './components/LayoutWrapper';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuth } from './contexts/useAuth';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f7fa',
        }}
      >
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1677ff', 
          marginBottom: '24px',
          letterSpacing: '2px'
        }}>
          I FIND U
        </div>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#999', fontSize: '14px' }}>
          正在加载用户信息...
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <LayoutWrapper />
    </ConfigProvider>
  );
}

export default App;
