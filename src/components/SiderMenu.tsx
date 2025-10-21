import React from 'react';
import { Layout, Menu, Grid, Drawer, Button } from 'antd';
import { CodeOutlined, HomeOutlined, UnorderedListOutlined, AppstoreOutlined, MenuOutlined } from '@ant-design/icons';
import './SiderMenu.css';

const { Sider } = Layout;

// 新增：支持外部导航回调 + 受控选中态
type Props = { onNavigate?: (key: string) => void; selectedKey?: string };

const SiderMenu: React.FC<Props> = ({ onNavigate, selectedKey }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(['home']);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
    { key: 'home', label: '首页', icon: <HomeOutlined /> },
    { key: 'menu1', label: '资源列表', icon: <UnorderedListOutlined /> },
    { key: 'menu2', label: '菜单2', icon: <AppstoreOutlined /> },
  ];

  // 移动端：使用 Drawer 覆盖主内容
  if (isMobile) {
    return (
      <>
        <Button
          className="mobile-menu-trigger"
          type="default"
          icon={<MenuOutlined />}
          onClick={() => setMobileOpen((open) => !open)}
        />
        <Drawer
          className="mobile-menu-drawer"
          placement="left"
          width="100%"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          styles={{ body: { padding: 0 } }}
        >
          <div className="sider-header">
            <CodeOutlined style={{ fontSize: 22 }} />
            <div>
              <div className="sider-title">网站标题</div>
              <div className="sider-desc">网站描述信息</div>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            onClick={({ key }) => {
              const k = String(key);
              setSelectedKeys([k]);
              setMobileOpen(false); // 选择后自动收起
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
            <div className="sider-title">网站标题</div>
            <div className="sider-desc">网站描述信息</div>
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