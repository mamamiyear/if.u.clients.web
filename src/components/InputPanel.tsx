import React from 'react';
import { Input, Upload, message, Button, Spin, Tag } from 'antd';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { PictureOutlined, SendOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { postInput, postInputImage, getPeoples } from '../apis';
import './InputPanel.css';

const { TextArea } = Input;

interface InputPanelProps {
  onResult?: (data: unknown) => void;
  showUpload?: boolean; // 是否显示图片上传按钮，默认显示
  mode?: 'input' | 'search' | 'batch-image'; // 输入面板工作模式，新增批量图片模式
}

const InputPanel: React.FC<InputPanelProps> = ({ onResult, showUpload = true, mode = 'input' }) => {
  const [value, setValue] = React.useState('');
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [loading, setLoading] = React.useState(false);
  // 批量模式不保留文本内容

  // 不需要扩展名重命名，展示 image-序号

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

    // 批量图片模式：循环调用图片识别 API
    if (mode === 'batch-image') {
      if (!hasImage) {
        message.info('请添加至少一张图片');
        return;
      }
      setLoading(true);
      try {
        const results: unknown[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const f = fileList[i].originFileObj as RcFile | undefined;
          if (!f) continue;
          const resp = await postInputImage(f);
          if (resp && resp.error_code === 0 && resp.data) {
            results.push(resp.data);
          }
        }
        if (results.length > 0) {
          message.success(`已识别 ${results.length} 张图片`);
          onResult?.(results);
        } else {
          message.error('识别失败，请检查图片后重试');
        }
        setValue('');
        setFileList([]);
      } catch (error) {
        console.error('批量识别失败:', error);
        message.error('网络错误，请稍后重试');
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
        const file = fileList[0].originFileObj as RcFile | undefined;
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

  // 处理剪贴板粘贴图片：将图片加入上传列表，复用现有上传流程
  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!showUpload || loading) return;

    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    if (mode === 'batch-image') {
      const newEntries: UploadFile[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && file.type.startsWith('image/')) {
            const entry: UploadFile<RcFile> = {
              uid: `${Date.now()}-${Math.random()}`,
              name: 'image',
              status: 'done',
              originFileObj: file as unknown as RcFile,
            };
            newEntries.push(entry);
          }
        }
      }
      if (newEntries.length > 0) {
        e.preventDefault();
        setValue('');
        setFileList([...fileList, ...newEntries]);
        message.success(`已添加 ${newEntries.length} 张剪贴板图片`);
      }
    } else {
      // 单图模式：仅添加第一张并替换已有
      let firstImage: File | null = null;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && file.type.startsWith('image/')) {
            firstImage = file;
            break;
          }
        }
      }
      if (firstImage) {
        e.preventDefault();
        setValue('');
        const item: UploadFile<RcFile> = {
          uid: `${Date.now()}-${Math.random()}`,
          name: 'image',
          status: 'done',
          originFileObj: firstImage as unknown as RcFile,
        };
        setFileList([item]);
        message.success('已添加剪贴板图片');
      }
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
          onChange={(e) => {
            if (mode === 'batch-image') {
              setValue('');
              return;
            }
            setValue(e.target.value);
          }}
          placeholder={
            mode === 'batch-image'
              ? '批量识别不支持输入文本，可添加或粘贴多张图片...'
              : showUpload && fileList.length > 0
                ? '不可在添加图片时输入信息...'
                : (showUpload ? '请输入个人信息描述，或上传图片…' : '请输入个人信息描述…')
          }
          autoSize={{ minRows: 6, maxRows: 12 }}
          style={{ fontSize: 16 }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          disabled={loading || (mode !== 'batch-image' && showUpload && fileList.length > 0)}
        />
      </Spin>
      <div className="input-actions">
        {/* 左侧文件标签显示 */}
        {showUpload && fileList.length > 0 && (
          mode === 'batch-image' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fileList.map((f, idx) => (
                <Tag
                  key={f.uid || idx}
                  className="selected-image-tag"
                  color="processing"
                  closable
                  onClose={() => {
                    const next = fileList.filter((x) => x !== f)
                    setFileList(next)
                  }}
                  bordered={false}
                >
                  {`image-${idx + 1}`}
                </Tag>
              ))}
            </div>
          ) : (
            <Tag
              className="selected-image-tag"
              color="processing"
              closable
              onClose={() => { setFileList([]) }}
              bordered={false}
            >
              {'image'}
            </Tag>
          )
        )}
        {showUpload && (
          <Upload
            accept="image/*"
            multiple={mode === 'batch-image'}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: nextFileList }) => {
              if (mode === 'batch-image') {
                const normalized: UploadFile<RcFile>[] = nextFileList.map((entry) => {
                  const raw = (entry as UploadFile<RcFile>).originFileObj;
                  return { ...(entry as UploadFile<RcFile>), name: 'image', originFileObj: raw };
                });
                setValue('');
                setFileList(normalized);
              } else {
                if (nextFileList.length === 0) {
                  setFileList([]);
                  return;
                }
                // 仅添加第一张
                const first = nextFileList[0] as UploadFile<RcFile>;
                const raw = first.originFileObj;
                const renamed: UploadFile<RcFile> = { ...first, name: 'image', originFileObj: raw };
                setValue('');
                setFileList([renamed]);
              }
            }}
            onRemove={(file) => {
              setFileList((prev) => prev.filter((x) => x.uid !== (file as UploadFile<RcFile>).uid));
              return true;
            }}
            showUploadList={false}
            disabled={loading || (mode !== 'batch-image' && fileList.length >= 1)}
          >
            <Button type="text" icon={<PictureOutlined />} disabled={loading || (mode !== 'batch-image' && fileList.length >= 1)} />
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