import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Empty } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './ImageSelectorModal.css';

interface ImageSelectorModalProps {
  visible: boolean;
  images?: string[];
  onCancel: () => void;
  onSelect: (imageUrl: string) => void;
}

const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
  visible,
  images = [],
  onCancel,
  onSelect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
    }
  }, [visible]);

  const handlePrev = () => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) { // Threshold for swipe
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartRef.current = null;
  };

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title="选择分享图片"
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={() => currentImage && onSelect(currentImage)}
          disabled={!hasImages}
        >
          确定
        </Button>,
      ]}
      width={600}
      centered
      className="image-selector-modal"
    >
      <div 
        className="image-selector-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!hasImages ? (
          <div className="no-image-placeholder">
            <Empty description="暂无图片" />
          </div>
        ) : (
          <>
            <div className="image-wrapper">
              <img src={currentImage!} alt={`preview-${currentIndex}`} />
            </div>
            
            {/* PC端显示的箭头 */}
            <div className="nav-arrow left" onClick={handlePrev}>
              <LeftOutlined />
            </div>
            <div className="nav-arrow right" onClick={handleNext}>
              <RightOutlined />
            </div>

            <div className="image-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImageSelectorModal;
