import React, { useState, useRef } from 'react';
import { Modal, Button, message } from 'antd';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperModalProps {
  visible: boolean;
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  visible,
  imageUrl,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 初始化裁切区域
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // 默认生成正方形裁切
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // aspect ratio 1:1
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(crop);
    
    // 手动设置初始 completedCrop，防止用户直接点击确定时为空
    // 将百分比转换为像素
    setCompletedCrop({
      unit: 'px',
      x: (crop.x / 100) * width,
      y: (crop.y / 100) * height,
      width: (crop.width / 100) * width,
      height: (crop.height / 100) * height,
    });
  };

  const handleConfirm = async () => {
    if (completedCrop && imgRef.current && canvasRef.current) {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      const crop = completedCrop;

      // 这里的 scale 是指：图片显示尺寸 / 图片原始尺寸
      // 注意：completedCrop 是基于显示尺寸的像素值
      // 我们需要将其映射回原始图片的像素值
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const pixelRatio = window.devicePixelRatio || 1;

      // 设置 canvas 的绘制尺寸（基于原始图片分辨率）
      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        message.error('无法获取 Canvas 上下文');
        return;
      }

      // 处理高 DPI 屏幕
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      // 计算源图像上的裁切区域
      const sourceX = crop.x * scaleX;
      const sourceY = crop.y * scaleY;
      const sourceWidth = crop.width * scaleX;
      const sourceHeight = crop.height * scaleY;

      // 计算目标绘制区域（即整个 Canvas）
      const destX = 0;
      const destY = 0;
      const destWidth = crop.width * scaleX;
      const destHeight = crop.height * scaleY;

      ctx.save();
      try {
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          destX,
          destY,
          destWidth,
          destHeight
        );
      } catch (e) {
        console.error('Canvas drawImage failed:', e);
        message.error('图片裁切失败，请重试');
        ctx.restore();
        return;
      }
      ctx.restore();

      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Canvas toBlob returned null');
            message.error('图片生成失败');
            return;
          }
          onConfirm(blob);
        }, 'image/png');
      } catch (e) {
        console.error('Canvas toBlob failed:', e);
        message.error('无法导出图片，可能存在跨域问题');
      }
    } else {
        // 如果没有进行任何裁切操作（比如直接点确定），尝试使用默认全图或当前状态
        message.warning('请调整裁切区域');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title="图片裁切"
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确定
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ display: 'flex', justifyContent: 'center', maxHeight: '60vh', overflow: 'auto' }}>
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1} // 强制正方形
          circularCrop={false}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imageUrl}
            onLoad={onImageLoad}
            crossOrigin="anonymous"
            style={{ maxWidth: '100%', maxHeight: '50vh' }}
          />
        </ReactCrop>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </Modal>
  );
};

export default ImageCropperModal;
