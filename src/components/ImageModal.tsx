import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './ImageModal.css';

interface ImageModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

// 图片缓存
const imageCache = new Set<string>();

const ImageModal: React.FC<ImageModalProps> = ({ visible, imageUrl, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 预加载图片
  useEffect(() => {
    if (visible && imageUrl) {
      // 如果图片已缓存，直接显示
      if (imageCache.has(imageUrl)) {
        setImageLoaded(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setImageLoaded(false);
      setImageError(false);

      const img = new Image();
      img.onload = () => {
        imageCache.add(imageUrl);
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
        setLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setLoading(false);
      };
      img.src = imageUrl;
    }
  }, [visible, imageUrl]);

  // 重置状态当弹窗关闭时
  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setImageLoaded(false);
      setImageError(false);
      setImageDimensions(null);
    }
  }, [visible]);

  // 计算移动端弹窗高度
  const getMobileModalHeight = () => {
    if (imageLoaded && imageDimensions) {
      // 如果图片已加载，根据图片比例自适应高度
      const availableHeight = window.innerHeight - 64; // 减去标题栏高度
      const availableWidth = window.innerWidth;
      
      // 计算图片按宽度100%显示时的高度
      const aspectRatio = imageDimensions.height / imageDimensions.width;
      const calculatedHeight = availableWidth * aspectRatio;
      
      // 确保高度不超过可用空间的90%
      const maxHeight = availableHeight * 0.9;
      const finalHeight = Math.min(calculatedHeight, maxHeight);
      
      return `${finalHeight}px`;
    }
    // 图片未加载时，使用默认高度（除标题栏外的33%）
    return 'calc((100vh - 64px) * 0.33)';
  };

  const modalStyle = isMobile ? {
    // 移动端居中显示，不设置top
    paddingBottom: 0,
    margin: 0,
  } : {
    // PC端不设置top，让centered属性处理居中
  };

  const modalBodyStyle = isMobile ? {
    padding: 0,
    height: getMobileModalHeight(),
    minHeight: 'calc((100vh - 64px) * 0.33)', // 最小高度为33%
    maxHeight: 'calc(100vh - 64px)', // 最大高度不超过可视区域
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  } : {
    padding: 0,
    height: '66vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={isMobile ? '100vw' : '66vw'}
      style={modalStyle}
      styles={{
        body: modalBodyStyle,
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
      }}
      centered={true} // 移动端和PC端都居中显示
      destroyOnHidden
      wrapClassName={isMobile ? 'mobile-image-modal' : 'desktop-image-modal'}
    >
      {/* 自定义关闭按钮 */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          cursor: 'pointer',
          color: '#fff',
          fontSize: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}
        onClick={onClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }}
      >
        <CloseOutlined />
      </div>

      {/* 图片内容 */}
      <div className="image-modal-container">
        {loading && (
          <Spin size="large" style={{ color: '#fff' }} />
        )}
        
        {imageError && (
          <div style={{ color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            <div>图片加载失败</div>
          </div>
        )}
        
        {imageLoaded && !loading && !imageError && (
          <img
            src={imageUrl}
            alt="预览图片"
          />
        )}
      </div>
    </Modal>
  );
};

export default ImageModal;