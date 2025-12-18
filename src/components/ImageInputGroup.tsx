import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Row, Col, Grid, Modal, message } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ImagePreview from './ImagePreview';
import { uploadCustomImage, uploadImage } from '../apis';

const { useBreakpoint } = Grid;

interface ImageInputGroupProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  customId?: string; // Optional: needed for uploadCustomImage if editing
}

const ImageInputGroup: React.FC<ImageInputGroupProps> = ({ value = [], onChange, customId }) => {
  const [uploading, setUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Internal state to manage the list of images
  const images = value || [];

  // Ensure previewIndex is valid
  useEffect(() => {
    if (images.length > 0 && previewIndex >= images.length) {
      setPreviewIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, previewIndex]);

  const currentPreviewUrl = images[previewIndex] || '';

  const triggerChange = (newImages: string[]) => {
    onChange?.(newImages);
  };

  const handleInputChange = (index: number, newValue: string) => {
    const newImages = [...images];
    newImages[index] = newValue;
    triggerChange(newImages);
  };

  const handleAdd = () => {
    const newImages = [...images, ''];
    triggerChange(newImages);
    setPreviewIndex(newImages.length - 1);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    triggerChange(newImages);
    if (previewIndex >= newImages.length) {
      setPreviewIndex(Math.max(0, newImages.length - 1));
    }
  };

  // File Selection
  const onSelectFile = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setModalVisible(true);
      });
      reader.readAsDataURL(file);
    }
    return false;
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 100 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  function canvasPreview(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: Crop) {
    const ctx = canvas.getContext('2d');
    if (!ctx) { throw new Error('No 2d context'); }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();
  }

  const onOk = async () => {
    if (completedCrop && previewCanvasRef.current && imgRef.current) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          setUploading(true);
          try {
            const response = customId
              ? await uploadCustomImage(customId, blob as File)
              : await uploadImage(blob as File);

            if (response.data) {
              const newImages = [...images];
              if (currentUploadIndex >= 0 && currentUploadIndex < newImages.length) {
                 newImages[currentUploadIndex] = response.data;
                 triggerChange(newImages);
                 setPreviewIndex(currentUploadIndex);
              }
            }
          } catch {
            message.error('图片上传失败');
          } finally {
            setUploading(false);
            setModalVisible(false);
          }
        }
      }, 'image/png');
    }
  };

  // Touch handlers for carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Next
        if (images.length > 0 && previewIndex < images.length - 1) {
          setPreviewIndex(previewIndex + 1);
        }
      } else {
        // Prev
        if (previewIndex > 0) {
          setPreviewIndex(previewIndex - 1);
        }
      }
    }
    touchStartRef.current = null;
  };

  const coverPreviewNode = (
    <div 
      style={{ position: 'relative' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ImagePreview
        url={currentPreviewUrl}
        minHeight="272px"
        maxHeight="272px"
      />
      {/* Navigation Buttons for PC */}
      {images.length > 1 && (
        <>
          <Button 
            shape="circle" 
            icon={<LeftOutlined />} 
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 1, opacity: 0.7 }}
            onClick={() => setPreviewIndex(prev => Math.max(0, prev - 1))}
            disabled={previewIndex === 0}
            className="desktop-only-btn"
          />
          <Button 
            shape="circle" 
            icon={<RightOutlined />} 
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 1, opacity: 0.7 }}
            onClick={() => setPreviewIndex(prev => Math.min(images.length - 1, prev + 1))}
            disabled={previewIndex === images.length - 1}
            className="desktop-only-btn"
          />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            {previewIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );

  const imagesListNode = (
    <div style={{ marginBottom: 0 }}>
      {images.map((url, index) => (
        <Row key={index} gutter={8} align="middle" style={{ 
           marginBottom: 8, 
           background: index === previewIndex ? '#f6ffed' : 'transparent', 
           padding: '4px', 
           borderRadius: '4px',
           border: index === previewIndex ? '1px solid #b7eb8f' : '1px solid transparent'
        }}>
          <Col flex="auto">
            <Input 
              placeholder="输入链接" 
              value={url}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onFocus={() => setPreviewIndex(index)}
              suffix={
                <Button icon={<UploadOutlined />} type="text" size="small" loading={uploading && currentUploadIndex === index} onClick={() => {
                  setCurrentUploadIndex(index);
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files?.[0]) onSelectFile(target.files[0]);
                  };
                  input.click();
                }} />
              }
            />
          </Col>
          <Col>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleRemove(index)}
            />
          </Col>
        </Row>
      ))}
      <Button type="dashed" onClick={handleAdd} block icon={<PlusOutlined />}>
        添加一张
      </Button>
    </div>
  );

  return (
    <>
      <Row gutter={[24, 24]}>
        {isMobile ? (
          <>
            {/* Mobile: Preview Top, Inputs Bottom */}
            <Col span={24}>
               {coverPreviewNode}
            </Col>
            <Col span={24}>
              {imagesListNode}
            </Col>
          </>
        ) : (
          <>
            {/* PC: Inputs Left, Preview Right */}
            <Col span={12}>
              {imagesListNode}
            </Col>
            <Col span={12}>
               {coverPreviewNode}
            </Col>
          </>
        )}
      </Row>

      {/* Crop Modal */}
      <Modal
        title="裁剪图片"
        open={modalVisible}
        onOk={onOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={uploading}
        destroyOnHidden={true}
        maskClosable={false}
      >
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              onLoad={onImageLoad}
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
            />
          </ReactCrop>
        )}
        <canvas
          ref={previewCanvasRef}
          style={{
            display: 'none',
            objectFit: 'contain',
            width: completedCrop?.width,
            height: completedCrop?.height,
          }}
        />
      </Modal>
    </>
  );
};

export default ImageInputGroup;
