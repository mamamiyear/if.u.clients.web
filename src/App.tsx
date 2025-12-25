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
          background: 'linear-gradient(135deg, #FFF0F5 0%, #E0F7FA 100%)',
        }}
      >
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          fontFamily: '"Fredoka", sans-serif',
          marginBottom: '24px',
          background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD93D 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '4px'
        }}>
          鹊桥引擎
        </div>
        <Spin size="large" />
        <div style={{ 
          marginTop: '16px', 
          color: '#FF8BA7', 
          fontSize: '16px',
          fontFamily: '"Quicksand", sans-serif',
          fontWeight: 600
        }}>
          正在加载用户信息...
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#FF8BA7',
          borderRadius: 12,
          fontFamily: '"Quicksand", "Fredoka", sans-serif',
        },
      }}
    >
      <LayoutWrapper />
    </ConfigProvider>
  );
}

export default App;
