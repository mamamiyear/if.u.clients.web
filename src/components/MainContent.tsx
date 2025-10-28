import React from 'react';
import { Layout, Typography } from 'antd';
import PeopleForm from './PeopleForm.tsx';
import InputDrawer from './InputDrawer.tsx';
import './MainContent.css';

const { Content } = Layout;

type Props = { inputOpen?: boolean; onCloseInput?: () => void; containerEl?: HTMLElement | null };
const MainContent: React.FC<Props> = ({ inputOpen = false, onCloseInput, containerEl }) => {
  const [formData, setFormData] = React.useState<any>(null);

  const handleInputResult = (data: any) => {
    setFormData(data);
  };

  return (
    <Content className="main-content">
      <div className="content-body">
        <Typography.Title level={3} style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
          ✨ 有新资源了吗?
        </Typography.Title>
        <Typography.Paragraph style={{ color: 'var(--muted)', marginBottom: 0 }}>
          点击右上角可以直接输入个人信息描述或上传图片，我将自动整理TA的信息
        </Typography.Paragraph>

        <PeopleForm initialData={formData} />
      </div>

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