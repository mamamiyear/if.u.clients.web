import React from 'react';
import { RobotOutlined } from '@ant-design/icons';
import './TopBar.css';

type Props = {
  onToggleMenu?: () => void; // Deprecated but kept for type safety if needed elsewhere
  onToggleInput?: () => void;
  showInput?: boolean;
};

const TopBar: React.FC<Props> = ({ onToggleInput, showInput }) => {
  // const screens = Grid.useBreakpoint();
  // const isMobile = !screens.md;

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Menu button removed as we use Bottom Navigation on Mobile */}
      </div>

      <div className="topbar-title" role="heading" aria-level={1}>
        鹊桥引擎
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
