import React from 'react';
import './HintText.css';

type Props = { showUpload?: boolean };

const HintText: React.FC<Props> = ({ showUpload = true }) => {
  const text = showUpload
    ? ' · 支持多行输入文本、上传图片或粘贴剪贴板图片。'
    : ' · 支持输入多行文本。';
  return (
    <div>
      <div className="hint-text">Tips:</div>
      <div className="hint-text">{text}</div>
      <div className="hint-text"> · 按 Enter 发送，Shift+Enter 换行。</div>
    </div>
  );
};

export default HintText;