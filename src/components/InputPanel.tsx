import React from 'react';
import { Input, Upload, message, Button, Spin } from 'antd';
import { PictureOutlined, SendOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { postInput, postInputImage, getPeoples } from '../apis';
import './InputPanel.css';

const { TextArea } = Input;

interface InputPanelProps {
  onResult?: (data: any) => void;
  showUpload?: boolean; // 是否显示图片上传按钮，默认显示
  mode?: 'input' | 'search'; // 输入面板工作模式，默认为表单填写（input）
}

const InputPanel: React.FC<InputPanelProps> = ({ onResult, showUpload = true, mode = 'input' }) => {
  const [value, setValue] = React.useState('');
  const [fileList, setFileList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const send = async () => {
    const trimmed = value.trim();
    const hasText = trimmed.length > 0;
    const hasImage = showUpload && fileList.length > 0;

    // 搜索模式：仅以文本触发检索，忽略图片
    if (mode === 'search') {
      if (!hasText) {
        message.info('请输入内容');
        return;
      }

      setLoading(true);
      try {
        console.log('检索文本:', trimmed);
        const response = await getPeoples({ search: trimmed, top_k: 10 });
        console.log('检索响应:', response);
        if (response.error_code === 0) {
          message.success('已获取检索结果');
          onResult?.(response.data || []);
          // 清空输入
          setValue('');
          setFileList([]);
        } else {
          message.error(response.error_info || '检索失败，请重试');
        }
      } catch (error) {
        console.error('检索调用失败:', error);
        message.error('网络错误，请检查连接后重试');
      } finally {
        setLoading(false);
      }
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
        console.log('处理文本:', trimmed);
        response = await postInput(trimmed);
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
          placeholder={showUpload ? '请输入个人信息描述，或上传图片…' : '请输入个人信息描述…'}
          autoSize={{ minRows: 6, maxRows: 12 }}
          style={{ fontSize: 14 }}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
      </Spin>
      <div className="input-actions">
        {showUpload && (
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
        )}
        <Button 
          type="primary" 
          icon={loading ? <LoadingOutlined /> : (mode === 'search' ? <SearchOutlined /> : <SendOutlined />)}
          onClick={send}
          loading={loading}
          disabled={loading}
          aria-label={mode === 'search' ? '搜索' : '发送'}
        />
      </div>
    </div>
  );
};

export default InputPanel;