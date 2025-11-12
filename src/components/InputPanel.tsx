import React from 'react';
import { Input, Upload, message, Button, Spin, Tag } from 'antd';
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
  const [savedText, setSavedText] = React.useState<string>('');

  // 统一显示短文件名：image.{ext}
  const getImageExt = (file: any): string => {
    const type = file?.type || '';
    if (typeof type === 'string' && type.startsWith('image/')) {
      const sub = type.split('/')[1] || 'png';
      return sub.toLowerCase();
    }
    const name = file?.name || '';
    const dot = name.lastIndexOf('.');
    const ext = dot >= 0 ? name.slice(dot + 1) : '';
    return (ext || 'png').toLowerCase();
  };

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
        setSavedText('');
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

  // 处理剪贴板粘贴图片：将图片加入上传列表，复用现有上传流程
  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!showUpload || loading) return;

    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    let pastedImage: File | null = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.type.startsWith('image/')) {
          pastedImage = file;
          break; // 只取第一张
        }
      }
    }

    if (pastedImage) {
      // 避免图片内容以文本方式粘贴进输入框
      e.preventDefault();

      const ext = getImageExt(pastedImage);
      const name = `image.${ext}`;

      const entry = {
        uid: `${Date.now()}-${Math.random()}`,
        name,
        status: 'done',
        originFileObj: pastedImage,
      } as any;

      // 仅保留一张：新图直接替换旧图
      if (fileList.length === 0) {
        setSavedText(value);
      }
      setValue('');
      setFileList([entry]);
      message.success('已添加剪贴板图片');
    }
  };

  return (
    <div className="input-panel">
      <Spin 
        spinning={loading} 
        tip="正在处理中，请稍候..."
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      >
        {/** 根据禁用状态动态占位符文案 */}
        {(() => {
          return null;
        })()}
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            showUpload && fileList.length > 0
              ? '不可在添加图片时输入信息...'
              : (showUpload ? '请输入个人信息描述，或上传图片…' : '请输入个人信息描述…')
          }
          autoSize={{ minRows: 6, maxRows: 12 }}
          style={{ fontSize: 16 }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          disabled={loading || (showUpload && fileList.length > 0)}
        />
      </Spin>
      <div className="input-actions">
        {/* 左侧文件标签显示 */}
        {showUpload && fileList.length > 0 && (
          <Tag
            className="selected-image-tag"
            color="processing"
            closable
            onClose={() => { setFileList([]); setValue(savedText); setSavedText(''); }}
            bordered={false}
          >
            {`image.${new Date().getSeconds()}.${getImageExt(fileList[0]?.originFileObj || fileList[0])}`}
          </Tag>
        )}
        {showUpload && (
          <Upload
            accept="image/*"
            multiple={false}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ file, fileList: nextFileList }) => {
              // 只保留最新一个，并重命名为 image.{ext}
              if (nextFileList.length === 0) {
                setFileList([]);
                return;
              }
              const latest = nextFileList[nextFileList.length - 1] as any;
              const raw = latest.originFileObj || file; // UploadFile 或原始 File
              const ext = getImageExt(raw);
              const renamed = { ...latest, name: `image.${ext}` };
              if (fileList.length === 0) {
                setSavedText(value);
              }
              setValue('');
              setFileList([renamed]);
            }}
            onRemove={() => { setFileList([]); setValue(savedText); setSavedText(''); return true; }}
            maxCount={1}
            showUploadList={false}
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