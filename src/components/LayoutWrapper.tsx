import React from 'react';
import { Layout } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SiderMenu from './SiderMenu.tsx';
import MainContent from './MainContent.tsx';
import ResourceList from './ResourceList.tsx';
import TopBar from './TopBar.tsx';
import '../styles/base.css';
import '../styles/layout.css';

const LayoutWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [inputOpen, setInputOpen] = React.useState(false);
  const isHome = location.pathname === '/';
  const layoutShellRef = React.useRef<HTMLDivElement>(null);

  const pathToKey = (path: string) => {
    switch (path) {
      case '/resources':
        return 'menu1';
      case '/menu2':
        return 'menu2';
      default:
        return 'home';
    }
  };

  const selectedKey = pathToKey(location.pathname);

  const handleNavigate = (key: string) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'menu1':
        navigate('/resources');
        break;
      case 'menu2':
        navigate('/menu2');
        break;
      default:
        navigate('/');
        break;
    }
    // 切换页面时收起输入抽屉
    setInputOpen(false);
  };

  return (
    <Layout className="layout-wrapper app-root">
      {/* 顶部标题栏，位于左侧菜单栏之上 */}
      <TopBar
        onToggleMenu={() => {setInputOpen(false); setMobileMenuOpen((v) => !v);}}
        onToggleInput={() => {if (isHome) {setMobileMenuOpen(false); setInputOpen((v) => !v);}}}
        isHome={isHome}
      />
      {/* 下方为主布局：左侧菜单 + 右侧内容 */}
      <Layout ref={layoutShellRef as any}>
        <SiderMenu
          onNavigate={handleNavigate}
          selectedKey={selectedKey}
          mobileOpen={mobileMenuOpen}
          onMobileToggle={(open) => setMobileMenuOpen(open)}
        />
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <MainContent
                  inputOpen={inputOpen}
                  onCloseInput={() => setInputOpen(false)}
                  containerEl={layoutShellRef.current}
                />
              }
            />
            <Route path="/resources" element={<ResourceList />} />
            <Route path="/menu2" element={<div style={{ padding: 32, color: '#cbd5e1' }}>菜单2的内容暂未实现</div>} />
          </Routes>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutWrapper;