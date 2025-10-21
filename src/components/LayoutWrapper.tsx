import React from 'react';
import { Layout } from 'antd';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SiderMenu from './SiderMenu.tsx';
import MainContent from './MainContent.tsx';
import ResourceList from './ResourceList.tsx';
import '../styles/base.css';
import '../styles/layout.css';

const LayoutWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  return (
    <Layout className="layout-wrapper app-root">
      <SiderMenu onNavigate={handleNavigate} selectedKey={selectedKey} />
      <Layout>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/resources" element={<ResourceList />} />
          <Route path="/menu2" element={<div style={{ padding: 32, color: '#cbd5e1' }}>菜单2的内容暂未实现</div>} />
        </Routes>
      </Layout>
    </Layout>
  );
};

export default LayoutWrapper;