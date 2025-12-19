import React from 'react';
import { Layout, Grid } from 'antd';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import SiderMenu from './SiderMenu.tsx';
import MainContent from './MainContent.tsx';
import CustomRegister from './CustomRegister.tsx';
import ResourceList from './ResourceList.tsx';
import CustomList from './CustomList.tsx';
import BatchRegister from './BatchRegister.tsx';
import TopBar from './TopBar.tsx';
import '../styles/base.css';
import '../styles/layout.css';
import UserProfile from './UserProfile.tsx';

const LayoutWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [inputOpen, setInputOpen] = React.useState(false);
  const isResourceInput = location.pathname === '/resource/register';
  const isList = location.pathname === '/resources';
  const isBatch = location.pathname === '/resources/register';
  const layoutShellRef = React.useRef<HTMLDivElement>(null);

  const pathToKey = (path: string) => {
    switch (path) {
      case '/custom/register':
        return 'custom';
      case '/resources':
        return 'menu1';
      case '/resources/register':
        return 'batch';
      case '/customs':
        return 'custom-list';
      case '/menu2':
        return 'menu2';
      case '/resource/register':
        return 'home';
      default:
        // 根路径重定向到客户列表，所以默认可以选中 custom-list，或者不做处理
        if (path === '/') return 'custom-list';
        return 'custom-list';
    }
  };

  const selectedKey = pathToKey(location.pathname);

  const handleNavigate = (key: string) => {
    switch (key) {
      case 'home':
        navigate('/resource/register');
        break;
      case 'custom':
        navigate('/custom/register');
        break;
      case 'batch':
        navigate('/resources/register');
        break;
      case 'custom-list':
        navigate('/customs');
        break;
      case 'menu1':
        navigate('/resources');
        break;
      case 'menu2':
        navigate('/menu2');
        break;
      default:
        navigate('/customs');
        break;
    }
    // 切换页面时收起输入抽屉
    setInputOpen(false);
  };

  return (
    <Layout className={`layout-wrapper app-root ${isMobile ? 'layout-mobile' : 'layout-desktop'}`}>
      {/* 顶部标题栏，位于左侧菜单栏之上 */}
      <TopBar
        onToggleMenu={() => {setInputOpen(false); setMobileMenuOpen((v) => !v);}}
        onToggleInput={() => {if (isResourceInput || isList || isBatch) {setMobileMenuOpen(false); setInputOpen((v) => !v);}}}
        showInput={isResourceInput || isList || isBatch}
      />
      {/* 下方为主布局：左侧菜单 + 右侧内容 */}
      <Layout ref={layoutShellRef} className="layout-shell">
        <SiderMenu
          onNavigate={handleNavigate}
          selectedKey={selectedKey}
          mobileOpen={mobileMenuOpen}
          onMobileToggle={(open) => setMobileMenuOpen(open)}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/customs" replace />} />
            <Route
              path="/resource/register"
              element={
                <MainContent
                  inputOpen={inputOpen}
                  onCloseInput={() => setInputOpen(false)}
                  containerEl={layoutShellRef.current}
                />
              }
            />
            <Route
              path="/custom/register"
              element={
                <CustomRegister
                  inputOpen={inputOpen}
                  onCloseInput={() => setInputOpen(false)}
                  containerEl={layoutShellRef.current}
                />
              }
            />
            <Route
              path="/resources/register"
              element={
                <BatchRegister
                  inputOpen={inputOpen}
                  onCloseInput={() => setInputOpen(false)}
                  containerEl={layoutShellRef.current}
                />
              }
            />
            <Route
              path="/customs"
              element={
                <CustomList />
              }
            />
            <Route
              path="/resources"
              element={
                <ResourceList
                  inputOpen={inputOpen}
                  onCloseInput={() => setInputOpen(false)}
                  containerEl={layoutShellRef.current}
                />
              }
            />
            <Route path="/menu2" element={<div style={{ padding: 32, color: '#cbd5e1' }}>菜单2的内容暂未实现</div>} />
            <Route path="/user" element={<UserProfile />} />
          </Routes>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutWrapper;
