import React from 'react';
import { Input, Upload, message, Button } from 'antd';
import { PictureOutlined, SendOutlined } from '@ant-design/icons';
import './InputPanel.css';

const { TextArea } = Input;

const InputPanel: React.FC = () => {
  const [value, setValue] = React.useState('');
  const [fileList, setFileList] = React.useState<any[]>([]);

  const send = () => {
    const hasText = value.trim().length > 0;
    const hasImage = fileList.length > 0;
    if (!hasText && !hasImage) {
      message.info('请输入内容或上传图片');
      return;
    }
    // 此处替换为真实发送逻辑
    console.log('发送内容:', { text: value, files: fileList });
    setValue('');
    setFileList([]);
    message.success('已发送');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter 换行（保持默认行为）
        return;
      }
      // Enter 发送
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="input-panel">
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="请输入个人信息描述，或点击右侧上传图片…"
        autoSize={{ minRows: 3, maxRows: 6 }}
        onKeyDown={onKeyDown}
      />
      <div className="input-actions">
        <Upload
          accept="image/*"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList as any)}
          maxCount={9}
          showUploadList={{ showPreviewIcon: false }}
        >
          <Button type="text" icon={<PictureOutlined />} />
        </Upload>
        <Button type="primary" icon={<SendOutlined />} onClick={send} />
      </div>
    </div>
  );
};

export default InputPanel;