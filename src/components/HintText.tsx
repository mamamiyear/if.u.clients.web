import React from 'react';
import './HintText.css';

const HintText: React.FC = () => {
  return (
    <div className="hint-text">
      提示：支持输入多行文本与上传图片。按 Enter 发送，Shift+Enter 换行。
    </div>
  );
};

export default HintText;