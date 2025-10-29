import React from 'react';
import './HintText.css';

type Props = { showUpload?: boolean };

const HintText: React.FC<Props> = ({ showUpload = true }) => {
  const text = showUpload
    ? '提示：支持输入多行文本与上传图片。按 Enter 发送，Shift+Enter 换行。'
    : '提示：支持输入多行文本。按 Enter 发送，Shift+Enter 换行。';
  return <div className="hint-text">{text}</div>;
};

export default HintText;