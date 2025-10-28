import React from 'react';
import { Drawer, Grid } from 'antd';
import InputPanel from './InputPanel.tsx';
import HintText from './HintText.tsx';
import './InputDrawer.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onResult?: (data: any) => void;
  containerEl?: HTMLElement | null; // 抽屉挂载容器（用于放在标题栏下方）
};

const InputDrawer: React.FC<Props> = ({ open, onClose, onResult, containerEl }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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

  // 在输入处理成功（onResult 被调用）后，自动关闭抽屉
  const handleResult = React.useCallback(
    (data: any) => {
      onResult?.(data);
      onClose();
    },
    [onResult, onClose]
  );

  return (
    <Drawer
      className="input-drawer"
      placement="right"
      width={isMobile ? '100%' : '33%'}
      open={open}
      onClose={onClose}
      mask={false}
      getContainer={containerEl ? () => containerEl : undefined}
      closable={false}
      zIndex={1500}
      rootStyle={{ top: topbarHeight, height: `calc(100% - ${topbarHeight}px)` }}
      styles={{
        header: { display: 'none' },
        body: {
          padding: 16,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        mask: { top: topbarHeight, height: `calc(100% - ${topbarHeight}px)` },
      }}
    >
      <div className="input-drawer-inner">
        <div className="input-drawer-title">AI FIND U</div>
        <div className="input-drawer-box">
          <InputPanel onResult={handleResult} />
          <HintText />
        </div>
      </div>
    </Drawer>
  );
};

export default InputDrawer;