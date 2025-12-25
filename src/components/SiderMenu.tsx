import React from 'react';
import { Layout, Menu, Grid, Button } from 'antd';
import { FormOutlined, UnorderedListOutlined, UserOutlined, TeamOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import UserAvatar from './UserAvatar';
import './SiderMenu.css';

const { Sider } = Layout;

type Props = {
  onNavigate?: (key: string) => void;
  selectedKey?: string;
  mobileOpen?: boolean;
  onMobileToggle?: (open: boolean) => void;
};

const SiderMenu: React.FC<Props> = ({ onNavigate, selectedKey }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(['home']);

  React.useEffect(() => {
    if (selectedKey) {
      setSelectedKeys([selectedKey]);
    }
  }, [selectedKey]);

  const items = [
    { key: 'custom-list', label: '客户', icon: <TeamOutlined /> },
    { key: 'custom', label: '录入', icon: <UserOutlined /> },
    { key: 'home', label: '添加', icon: <FormOutlined /> },
    { key: 'batch', label: '批量', icon: <CopyOutlined /> },
    { key: 'menu1', label: '资源', icon: <UnorderedListOutlined /> },
  ];

  const handleNavigate = (key: string) => {
    setSelectedKeys([key]);
    onNavigate?.(key);
  };

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <>
        <div className="mobile-bottom-nav">
          {items.map(item => (
            <button
              key={item.key}
              className={`nav-item ${selectedKeys.includes(item.key) ? 'active' : ''}`}
              onClick={() => handleNavigate(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          {/* User Profile Tab */}
          <button
            className="nav-item"
            onClick={() => isAuthenticated ? navigate('/user') : setIsLoginModalOpen(true)}
          >
            {isAuthenticated && user ? (
              <UserAvatar user={user} size={24} />
            ) : (
              <UserOutlined />
            )}
            <span>{isAuthenticated ? '我的' : '登录'}</span>
          </button>
        </div>
        
        <LoginModal
          open={isLoginModalOpen}
          onCancel={() => setIsLoginModalOpen(false)}
          onOk={async (values) => {
            await login(values);
            setIsLoginModalOpen(false);
          }}
          title="登录"
        />
        <RegisterModal open={isRegisterModalOpen} onCancel={() => setIsRegisterModalOpen(false)} />
      </>
    );
  }

  // Desktop Floating Sider
  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="sider-menu"
      width={240}
    >
      <div className={`sider-header ${collapsed ? 'collapsed' : ''}`}>
         {isAuthenticated && user ? (
            <div 
              className="sider-user" 
              onClick={() => navigate('/user')}
              role="button"
              tabIndex={0}
              title="查看个人资料"
            >
              <div className="sider-avatar-container">
                <div className="sider-avatar-frame">
                  <UserAvatar user={user} size={collapsed ? 32 : 56} />
                </div>
              </div>
              {!collapsed && (
                <div className="sider-info">
                  <div className="sider-title">{user.nickname}</div>
                  {user.organization && <div className="sider-org">{user.organization.name}</div>}
                </div>
              )}
            </div>
         ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              {!collapsed && (
                 <>
                  <Button type="primary" block onClick={() => setIsLoginModalOpen(true)}>登录</Button>
                  <Button block onClick={() => setIsRegisterModalOpen(true)}>注册</Button>
                 </>
              )}
              {collapsed && (
                 <Button type="primary" shape="circle" icon={<UserOutlined />} onClick={() => setIsLoginModalOpen(true)} />
              )}
            </div>
         )}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={({ key }) => handleNavigate(String(key))}
        items={items}
      />
       <LoginModal
          open={isLoginModalOpen}
          onCancel={() => setIsLoginModalOpen(false)}
          onOk={async (values) => {
            await login(values);
            setIsLoginModalOpen(false);
          }}
          title="登录"
        />
      <RegisterModal open={isRegisterModalOpen} onCancel={() => setIsRegisterModalOpen(false)} />
    </Sider>
  );
};

export default SiderMenu;
