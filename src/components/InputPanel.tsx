import React from 'react';
import { Input, Upload, message, Button, Spin } from 'antd';
import { PictureOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { postInput, postInputImage } from '../apis';
import './InputPanel.css';

const { TextArea } = Input;

interface InputPanelProps {
  onResult?: (data: any) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onResult }) => {
  const [value, setValue] = React.useState('');
  const [fileList, setFileList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const send = async () => {
    const hasText = value.trim().length > 0;
    const hasImage = fileList.length > 0;
    if (!hasText && !hasImage) {
      message.info('请输入内容或上传图片');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      // 如果有图片，优先处理图片上传
      if (hasImage) {
        const file = fileList[0].originFileObj || fileList[0];
        if (!file) {
          message.error('图片文件无效，请重新选择');
          return;
        }
        
        console.log('上传图片:', file.name);
        response = await postInputImage(file);
      } else {
        // 只有文本时，调用文本处理 API
        console.log('处理文本:', value.trim());
        response = await postInput(value.trim());
      }
      
      console.log('API响应:', response);
      if (response.error_code === 0 && response.data) {
        message.success('处理完成！已自动填充表单');
        // 将结果传递给父组件
        onResult?.(response.data);
        
        message.info('输入已清空');
        // 清空输入
        setValue('');
        setFileList([]);
      } else {
        message.error(response.error_info || '处理失败，请重试');
      }
    } catch (error) {
      console.error('API调用失败:', error);
      message.error('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (loading) return; // 加载中时禁用快捷键
    
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
      <Spin 
        spinning={loading} 
        tip="正在处理中，请稍候..."
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      >
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="请输入个人信息描述，或点击右侧上传图片…"
          autoSize={{ minRows: 3, maxRows: 6 }}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
      </Spin>
      <div className="input-actions">
        <Upload
          accept="image/*"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList as any)}
          maxCount={9}
          showUploadList={{ showPreviewIcon: false }}
          disabled={loading}
        >
          <Button type="text" icon={<PictureOutlined />} disabled={loading} />
        </Upload>
        <Button 
          type="primary" 
          icon={loading ? <LoadingOutlined /> : <SendOutlined />} 
          onClick={send}
          loading={loading}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default InputPanel;