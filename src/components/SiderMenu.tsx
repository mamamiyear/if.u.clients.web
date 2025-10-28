import React from 'react';
import { Layout, Menu, Grid, Drawer, Button } from 'antd';
import { CodeOutlined, HomeOutlined, UnorderedListOutlined, MenuOutlined } from '@ant-design/icons';
import './SiderMenu.css';

const { Sider } = Layout;

// 新增：支持外部导航回调 + 受控选中态
type Props = {
  onNavigate?: (key: string) => void;
  selectedKey?: string;
  mobileOpen?: boolean; // 外部控制移动端抽屉开关
  onMobileToggle?: (open: boolean) => void; // 顶栏触发开关
};

const SiderMenu: React.FC<Props> = ({ onNavigate, selectedKey, mobileOpen, onMobileToggle }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(['home']);
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  // 根据外部 selectedKey 同步选中态
  React.useEffect(() => {
    if (selectedKey) {
      setSelectedKeys([selectedKey]);
    }
  }, [selectedKey]);

  const items = [
    { key: 'home', label: '注册', icon: <HomeOutlined /> },
    { key: 'menu1', label: '列表', icon: <UnorderedListOutlined /> },
    // { key: 'menu2', label: '菜单2', icon: <AppstoreOutlined /> },
  ];

  // 移动端：使用 Drawer 覆盖主内容
  if (isMobile) {
    const open = mobileOpen ?? internalMobileOpen;
    const setOpen = (v: boolean) => (onMobileToggle ? onMobileToggle(v) : setInternalMobileOpen(v));
    const showInternalTrigger = !onMobileToggle; // 若无外部控制，则显示内部按钮
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
          styles={{ body: { padding: 0 } }}
        >
          <div className="sider-header">
            <CodeOutlined style={{ fontSize: 22 }} />
            <div>
              <div className="sider-title">单身管理</div>
              <div className="sider-desc">录入、展示与搜索你的单身资源</div>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            onClick={({ key }) => {
              const k = String(key);
              setSelectedKeys([k]);
              setOpen(false); // 选择后自动收起
              onNavigate?.(k);
            }}
            items={items}
          />
        </Drawer>
      </>
    );
  }

  // PC 端：保持 Sider 行为不变
  return (
    <Sider
      width={260}
      collapsible
      collapsed={collapsed}
      onCollapse={(c) => setCollapsed(c)}
      breakpoint="md"
      collapsedWidth={64}
      theme="dark"
    >
      <div className={`sider-header ${collapsed ? 'collapsed' : ''}`}>
        <CodeOutlined style={{ fontSize: 22 }} />
        {!collapsed && (
          <div>
            <div className="sider-title">单身管理</div>
            <div className="sider-desc">录入、展示与搜索你的单身资源</div>
          </div>
        )}
      </div>
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
    </Sider>
  );
};

export default SiderMenu;