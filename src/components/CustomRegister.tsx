import React from 'react';
import { Layout } from 'antd';
import CustomForm from './CustomForm.tsx';
import InputDrawer from './InputDrawer.tsx';
import './MainContent.css'; // Reuse MainContent styles

const { Content } = Layout;

type Props = { inputOpen?: boolean; onCloseInput?: () => void; containerEl?: HTMLElement | null };

const CustomRegister: React.FC<Props> = ({ inputOpen = false, onCloseInput, containerEl }) => {
  // 暂时不需要反向填充表单，或者后续如果有需求再加
  const handleInputResult = (_data: unknown) => {
    // setFormData(data as Partial<Custom>);
    // TODO: 如果需要支持从 InputDrawer 自动填充 CustomForm，可以在这里实现
    console.log('InputDrawer result for custom:', _data);
  };

  return (
    <Content className="main-content">
      <div className="content-body">
        {/* 标题在 CustomForm 内部已经有了，或者在这里统一控制？
            CustomForm 内部写了 Title 和 Paragraph，这里就不重复了。
            PeopleForm 内部没有 Title，是在 MainContent 里写的。
            刚才我在 CustomForm 里加了 Title。
         */}
        <CustomForm />
      </div>

      {/* 复用 InputDrawer，虽然可能暂时没用 */}
      <InputDrawer
        open={inputOpen}
        onClose={onCloseInput || (() => {})}
        onResult={handleInputResult}
        containerEl={containerEl}
        targetModel="custom"
      />
    </Content>
  );
};

export default CustomRegister;
