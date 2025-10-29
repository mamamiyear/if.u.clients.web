import React from 'react';
import { Grid } from 'antd';
import { MenuOutlined, RobotOutlined } from '@ant-design/icons';
import './TopBar.css';

type Props = {
  onToggleMenu?: () => void;
  onToggleInput?: () => void;
  showInput?: boolean;
};

const TopBar: React.FC<Props> = ({ onToggleMenu, onToggleInput, showInput }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div className="topbar">
      <div className="topbar-left">
        {isMobile && (
          <button className="icon-btn" onClick={onToggleMenu} aria-label="打开/收起菜单">
            <MenuOutlined />
          </button>
        )}
      </div>

      <div className="topbar-title" role="heading" aria-level={1}>
        I FIND U
      </div>

      <div className="topbar-right">
        {showInput && (
          <button className="icon-btn" onClick={onToggleInput} aria-label="打开/收起输入">
            <RobotOutlined />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;