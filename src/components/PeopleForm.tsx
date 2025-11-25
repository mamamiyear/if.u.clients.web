import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, message, Row, Col, Image, Modal } from 'antd';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import { UploadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';

import './PeopleForm.css';
import KeyValueList from './KeyValueList.tsx'
import { createPeople, type People, uploadPeopleImage, uploadImage } from '../apis';

const { TextArea } = Input;

interface PeopleFormProps {
  initialData?: Partial<People>;
  // 编辑模式下由父组件控制提交，隐藏内部提交按钮
  hideSubmitButton?: boolean;
  // 暴露 AntD Form 实例给父组件，用于在外部触发校验与取值
  onFormReady?: (form: FormInstance) => void;
}

const PeopleForm: React.FC<PeopleFormProps> = ({ initialData, hideSubmitButton = false, onFormReady }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgSrc, setImgSrc] = React.useState('')
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<Crop>()
  const [modalVisible, setModalVisible] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null)

  // 当 initialData 变化时，自动填充表单
  useEffect(() => {
    if (initialData) {
      const formData: Partial<People> = {};
      if (initialData.name) formData.name = initialData.name;
      if (initialData.contact) formData.contact = initialData.contact;
      if (initialData.cover) formData.cover = initialData.cover;
      if (initialData.gender) formData.gender = initialData.gender;
      if (initialData.age) formData.age = initialData.age;
      if (initialData.height) formData.height = initialData.height;
      if (initialData.marital_status) formData.marital_status = initialData.marital_status;
      if (initialData.match_requirement) formData.match_requirement = initialData.match_requirement;
      if (initialData.introduction) formData.introduction = initialData.introduction as Record<string, string>;
      form.setFieldsValue(formData);
    }
  }, [initialData, form]);

  // 将表单实例暴露给父组件
  useEffect(() => {
    onFormReady?.(form);
    // 仅在首次挂载时调用一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  type FormValues = {
    name: string;
    contact?: string;
    gender: string;
    age: number;
    height?: number;
    marital_status?: string;
    introduction?: Record<string, string>;
    match_requirement?: string;
    cover?: string;
  };
  const onFinish = async (values: FormValues) => {
    setLoading(true);
    
    try {
      const peopleData: People = {
        name: values.name,
        contact: values.contact || undefined,
        gender: values.gender,
        age: values.age,
        height: values.height || undefined,
        marital_status: values.marital_status || undefined,
        introduction: values.introduction || {},
        match_requirement: values.match_requirement || undefined,
        cover: values.cover || undefined,
      };

      console.log('提交人员数据:', peopleData);
      
      const response = await createPeople(peopleData);
      
      console.log('API响应:', response);
      
      if (response.error_code === 0) {
        message.success('人员信息已成功提交到后端！');
        form.resetFields();
      } else {
        message.error(response.error_info || '提交失败，请重试');
      }
      
    } catch (e) {
      const err = e as { status?: number; message?: string };
      if (err.status === 422) {
        message.error('表单数据格式有误，请检查输入内容');
      } else if ((err.status ?? 0) >= 500) {
        message.error('服务器错误，请稍后重试');
      } else {
        message.error(err.message || '提交失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (file: File) => {
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        setModalVisible(true)
      })
      reader.readAsDataURL(file)
    }
    return false
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: Crop,
  ) {
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const pixelRatio = window.devicePixelRatio
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()
    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    )

    ctx.restore()
  }

  const onOk = async () => {
    if (completedCrop && previewCanvasRef.current && imgRef.current) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          setUploading(true)
          try {
            const response = initialData?.id
              ? await uploadPeopleImage(initialData.id, blob as File)
              : await uploadImage(blob as File);

            if (response.data) {
              form.setFieldsValue({ cover: response.data })
            }
          } catch {
            message.error('图片上传失败')
          } finally {
            setUploading(false)
            setModalVisible(false)
          }
        }
      }, 'image/png')
    }
  }

  const coverUrl = Form.useWatch('cover', form);

  const coverPreviewNode = (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '264px', // 预览区固定高度，与表单保持高度对齐
      maxHeight: '264px', // 预览区固定高度，与表单保持高度对齐
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed #d9d9d9',
      borderRadius: '8px',
      background: '#fafafa',
      padding: '8px'
    }}>
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt="封面预览"
          style={{ height: '100%', maxHeight: '248px', objectFit: 'contain' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2IChhEhKKTMoZ0hTwIQYUXOgjpAhLwzpDbQCBCwh_gswOQDz12JoLPj+7YM..."
          preview={false}
        />
      ) : (
        <div style={{ color: '#999' }}>封面预览</div>
      )}
    </div>
  );

  return (
    <div className="people-form">
      <Form
        form={form}
        layout="vertical"
        size="large"
        onFinish={onFinish}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="如：张三" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="contact" label="联系人">
              <Input placeholder="如：李四（可留空）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Left Side: Form Fields */}
          <Col xs={24} md={12}>

            <Row gutter={[12, 12]}>
              <Col xs={24}>
                <Form.Item name="cover" label="人物封面">
                  <Input
                    placeholder="请输入图片链接（可留空）"
                    suffix={
                      <Button icon={<UploadOutlined />} type="text" size="small" loading={uploading} onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files?.[0]) {
                            onSelectFile(target.files[0]);
                          }
                        };
                        input.click();
                      }} />
                    }
                  />
                </Form.Item>
              </Col>
              {/* Mobile Only Preview */}
              <Col xs={24} md={0} className="ant-visible-xs">
                <Form.Item label="封面预览">
                  {coverPreviewNode}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                  <Select
                    placeholder="请选择性别"
                    options={[
                      { label: '男', value: '男' },
                      { label: '女', value: '女' },
                      { label: '其他/保密', value: '其他/保密' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
                  <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="如：28" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Form.Item name="height" label="身高(cm)">
                  <InputNumber
                    min={0}
                    max={250}
                    style={{ width: '100%' }}
                    placeholder="如：175（可留空）"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="marital_status" label="婚姻状况">
                  <Input placeholder="可自定义输入，例如：未婚、已婚、离异等" />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Right Side: Cover Preview (PC) */}
          <Col xs={0} md={12} className="ant-hidden-xs">
            <Form.Item label="封面预览">
              {coverPreviewNode}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="introduction" label="个人介绍（键值对）">
          <KeyValueList />
        </Form.Item>

        <Form.Item name="match_requirement" label="择偶要求">
          <TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder="例如：性格开朗、三观一致等" />
        </Form.Item>

        {!hideSubmitButton && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {loading ? '提交中...' : '提交'}
            </Button>
          </Form.Item>
        )}
      </Form>
      <Modal
        title="裁剪图片"
        open={modalVisible}
        onOk={onOk}
        onCancel={() => setModalVisible(false)}
        okText="上传"
        cancelText="取消"

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
            />
          </ReactCrop>
        )}
      </Modal>
      <canvas
        ref={previewCanvasRef}
        style={{
          display: 'none',
          width: Math.round(completedCrop?.width ?? 0),
          height: Math.round(completedCrop?.height ?? 0),
        }}
      />
    </div>
  );
};

export default PeopleForm;
