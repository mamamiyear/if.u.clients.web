import React from 'react';
import { Layout, Typography } from 'antd';
import { motion } from 'framer-motion';
import PeopleForm from './PeopleForm.tsx';
import InputDrawer from './InputDrawer.tsx';
import './MainContent.css';
import type { People } from '../apis';

const { Content } = Layout;

type Props = { inputOpen?: boolean; onCloseInput?: () => void; containerEl?: HTMLElement | null };
const MainContent: React.FC<Props> = ({ inputOpen = false, onCloseInput, containerEl }) => {
  const [formData, setFormData] = React.useState<Partial<People> | null>(null);

  const handleInputResult = (data: unknown) => {
    setFormData(data as Partial<People>);
  };

  return (
    <Content className="main-content">
      <motion.div 
        className="content-body"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Typography.Title 
          level={3} 
          style={{ 
            color: 'var(--color-primary-600)', 
            marginBottom: 12,
            fontFamily: '"Fredoka", sans-serif',
            letterSpacing: '1px'
          }}
        >
          ✨ 有新资源了吗?
        </Typography.Title>
        <Typography.Paragraph style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 16 }}>
          点击右上角可以直接输入描述或上传图片
        </Typography.Paragraph>

        <PeopleForm initialData={formData || undefined} />
      </motion.div>

      {/* 首页右侧输入抽屉，仅在顶栏点击后弹出；挂载到标题栏下方容器 */}
      <InputDrawer
        open={inputOpen}
        onClose={onCloseInput || (() => {})}
        onResult={handleInputResult}
        containerEl={containerEl}
      />
    </Content>
  );
};

export default MainContent;
