import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../contexts/useAuth';
import React from 'react';
import { Layout, Menu, Grid, Drawer, Button } from 'antd';
import { FormOutlined, UnorderedListOutlined, MenuOutlined, CopyOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import './SiderMenu.css';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

type Props = {
  onNavigate?: (key: string) => void;
  selectedKey?: string;
  mobileOpen?: boolean; // 外部控制移动端抽屉开关
  onMobileToggle?: (open: boolean) => void; // 顶栏触发开关
};

const SiderMenu: React.FC<Props> = ({ onNavigate, selectedKey, mobileOpen, onMobileToggle }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(['home']);
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);
  const [topbarHeight, setTopbarHeight] = React.useState<number>(56);

  React.useEffect(() => {
    const update = () => {
      const el = document.querySelector('.topbar') as HTMLElement | null;
      const h = el?.clientHeight || 56;
      setTopbarHeight(h);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  React.useEffect(() => {
    if (selectedKey) {
      setSelectedKeys([selectedKey]);
    }
  }, [selectedKey]);

  const items = [
    { key: 'home', label: '录入资源', icon: <FormOutlined /> },
    { key: 'batch', label: '批量录入', icon: <CopyOutlined /> },
    { key: 'menu1', label: '资源列表', icon: <UnorderedListOutlined /> },
  ];

  const renderSiderHeader = (options?: { setOpen?: (v: boolean) => void; collapsed?: boolean }) => (
    <div className={`sider-header ${options?.collapsed ? 'collapsed' : ''}`}>
      {isAuthenticated && user ? (
        <>
          <div className="sider-user">
            <div className="sider-avatar-container">
              <div className="sider-avatar-frame">
                {user.avatar_link ? (
                  <img src={user.avatar_link} alt="avatar" className="sider-avatar" />
                ) : (
                  <UserOutlined className="sider-avatar-icon" />
                )}
              </div>
            </div>
            <div className="sider-title">{user.nickname}</div>
          </div>
          <button type="button" className="sider-settings-btn" aria-label="设置" onClick={() => { navigate('/user'); options?.setOpen?.(false); }}>
            <SettingOutlined />
          </button>
        </>
      ) : (
        <>
          <Button type="primary" style={{ marginRight: 8 }} onClick={() => setIsLoginModalOpen(true)}>登录</Button>
          <Button onClick={() => setIsRegisterModalOpen(true)}>注册</Button>
        </>
      )}
    </div>
  );

  if (isMobile) {
    const open = mobileOpen ?? internalMobileOpen;
    const setOpen = (v: boolean) => (onMobileToggle ? onMobileToggle(v) : setInternalMobileOpen(v));
    const showInternalTrigger = !onMobileToggle;
    return (
      <>
        {showInternalTrigger && (
          <Button
            className="mobile-menu-trigger"
            type="default"
            icon={<MenuOutlined />}
            onClick={() => setInternalMobileOpen((o) => !o)}
          />
        )}
        <Drawer
          className="mobile-menu-drawer"
          placement="left"
          width="100%"
          open={open}
          onClose={() => setOpen(false)}
          rootStyle={{ top: topbarHeight, height: `calc(100% - ${topbarHeight}px)` }}
          styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        >
          {renderSiderHeader({ setOpen })}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            onClick={({ key }) => {
              const k = String(key);
              setSelectedKeys([k]);
              setOpen(false);
              onNavigate?.(k);
            }}
            items={items}
          />
        </Drawer>
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

  return (
    <Sider
      theme="dark"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="sider-menu"
      width={240}
    >
      {renderSiderHeader({ collapsed })}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={({ key }) => {
          const k = String(key);
          setSelectedKeys([k]);
          onNavigate?.(k);
        }}
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