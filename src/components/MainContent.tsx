import React from 'react';
import { Layout, Typography } from 'antd';
import PeopleForm from './PeopleForm.tsx';
import InputPanel from './InputPanel.tsx';
import HintText from './HintText.tsx';
import './MainContent.css';

const { Content } = Layout;

const MainContent: React.FC = () => {
  const [formData, setFormData] = React.useState<any>(null);

  const handleInputResult = (data: any) => {
    setFormData(data);
  };

  return (
    <Content className="main-content">
      <div className="content-body">
        <Typography.Title level={3} style={{ color: '#e5e7eb', marginBottom: 12 }}>
          ✨ 有新资源了吗?
        </Typography.Title>
        <Typography.Paragraph style={{ color: '#a6adbb', marginBottom: 0 }}>
          输入个人信息描述，上传图片，我将自动整理资源信息
        </Typography.Paragraph>

        <PeopleForm initialData={formData} />
      </div>

      <div className="input-panel-wrapper">
        <InputPanel onResult={handleInputResult} />
        <HintText />
      </div>
    </Content>
  );
};

export default MainContent;