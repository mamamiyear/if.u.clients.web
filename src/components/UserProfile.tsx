import React from 'react'
import { Form, Input, Button, message, Card, Space, Upload, Modal } from 'antd'
import 'react-image-crop/dist/ReactCrop.css'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop'
import { useAuth } from '../contexts/useAuth'
import { updateMe, deleteUser, uploadAvatar, updatePhone, updateEmail } from '../apis'
import { UserOutlined, EditOutlined } from '@ant-design/icons'
import LoginModal from './LoginModal';
import { useNavigate } from 'react-router-dom'

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

const UserProfile: React.FC = () => {
  const { user, logout, refreshUser, sendCode, login, clearLocalSession } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)
  const [imgSrc, setImgSrc] = React.useState('')
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<Crop>()
  const [modalVisible, setModalVisible] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const [editVisible, setEditVisible] = React.useState(false)
  const [editType, setEditType] = React.useState<'phone' | 'email' | null>(null)
  const [editStep, setEditStep] = React.useState<'input' | 'verify'>('input')
  const [editLoading, setEditLoading] = React.useState(false)
  const [editForm] = Form.useForm()
  const [reauthVisible, setReauthVisible] = React.useState(false)

  const styles: Record<string, React.CSSProperties> = {
    body: { display: 'flex', flexDirection: 'column', gap: 16 },
  }

  React.useEffect(() => {
    form.setFieldsValue({
      nickname: user?.nickname || '',
      avatar_link: user?.avatar_link || '',
      phone: user?.phone || '',
      email: user?.email || '',
    })
  }, [user, form])

  const onSave = async () => {
    try {
      const values = await form.validateFields()
      const payload: Record<string, unknown> = {}
      if (values.nickname !== user?.nickname) payload.nickname = values.nickname
      
      if (Object.keys(payload).length === 0) {
        message.info('没有需要保存的变更')
        return
      }
      setSaving(true)
      const res = await updateMe(payload)
      if (res.error_code === 0) {
        await refreshUser()
        message.success('已保存')
      } else {
        message.error(res.error_info || '保存失败')
      }
    } catch {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const onLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch {
      message.error('登出失败')
    }
  }

  const onDelete = async () => {
    Modal.confirm({
      title: '确定注销吗？',
      content: '注销后所有数据均会被清理，且无法找回',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setReauthVisible(true);
      }
    })
  }

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

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
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

  const uploadBlob = async (blob: Blob | null) => {
    if (!blob) {
      message.error('图片处理失败')
      setUploading(false)
      setModalVisible(false)
      return
    }
    const formData = new FormData()
    formData.append('avatar', new File([blob], 'avatar.png', { type: 'image/png' }))
    try {
      const res = await uploadAvatar(formData)
      if (res.error_code === 0) {
        await refreshUser()
        message.success('头像更新成功')
      } else {
        message.error(res.error_info || '上传失败')
      }
    } catch {
      message.error('上传失败')
    } finally {
      refreshUser()
      setUploading(false)
      setModalVisible(false)
    }
  }

  const onOk = async () => {
    setUploading(true)
    if (completedCrop && previewCanvasRef.current && imgRef.current) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
      const canvas = previewCanvasRef.current
      const MAX_SIZE = 128
      if (canvas.width > MAX_SIZE) {
        const resizeCanvas = document.createElement('canvas')
        const ctx = resizeCanvas.getContext('2d')
        if (!ctx) {
          message.error('无法处理图片')
          setModalVisible(false)
          return
        }
        resizeCanvas.width = MAX_SIZE
        resizeCanvas.height = MAX_SIZE
        ctx.drawImage(canvas, 0, 0, MAX_SIZE, MAX_SIZE)
        resizeCanvas.toBlob((blob) => {
          uploadBlob(blob)
        }, 'image/png')
      } else {
        canvas.toBlob((blob) => {
          uploadBlob(blob)
        }, 'image/png')
      }
    }
  }

  const onEditClick = (type: 'phone' | 'email') => {
    setEditType(type)
    setEditStep('input')
    setEditVisible(true)
    editForm.resetFields()
  }

  const handleSendEditCode = async () => {
    try {
      const field = editType === 'phone' ? 'phone' : 'email'
      const values = await editForm.validateFields([field])
      const target = values[field]
      await sendCode({ target_type: field === 'phone' ? 'phone' : 'email', target, scene: 'update' })
      message.success('验证码已发送')
      setEditStep('verify')
    } catch {
      message.error('发送验证码失败')
    }
  }

  const handleSubmitEdit = async () => {
    try {
      setEditLoading(true)
      const phoneOrEmail = editType === 'phone' ? await editForm.validateFields(['phone', 'code']) : await editForm.validateFields(['email', 'code'])
      if (editType === 'phone') {
        const res = await updatePhone({ phone: phoneOrEmail.phone, code: phoneOrEmail.code })
        if (res.error_code === 0) {
          await refreshUser()
          message.success('手机号已更新')
          setEditVisible(false)
        } else {
          message.error(res.error_info || '更新失败')
        }
      } else if (editType === 'email') {
        const res = await updateEmail({ email: phoneOrEmail.email, code: phoneOrEmail.code })
        if (res.error_code === 0) {
          await refreshUser()
          message.success('邮箱已更新')
          setEditVisible(false)
        } else {
          message.error(res.error_info || '更新失败')
        }
      }
    } catch {
      message.error('更新失败')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ width: '100%' }} styles={styles}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Upload
            beforeUpload={onSelectFile}
            showUploadList={false}
            accept='image/*'
          >
            {user?.avatar_link ? (
              <img src={user.avatar_link} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <UserOutlined style={{ fontSize: 48, color: '#999' }} />
              </div>
            )}
          </Upload>
          <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 }}>点击更换头像</p>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input
              readOnly
              style={{ width: '100%', backgroundColor: '#f5f5f5' }}
              suffix={<Button type="text" icon={<EditOutlined />} onClick={() => onEditClick('phone')}>编辑</Button>}
            />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input
              readOnly
              style={{ width: '100%', backgroundColor: '#f5f5f5' }}
              suffix={<Button type="text" icon={<EditOutlined />} onClick={() => onEditClick('email')}>编辑</Button>}
            />
          </Form.Item>
        </Form>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Button type="primary" onClick={onSave} loading={saving}>保存</Button>
          <Button onClick={onLogout}>登出</Button>
          <Button danger onClick={onDelete}>注销</Button>
        </Space>
      </Card>
      <Modal
        title="裁剪头像"
        open={modalVisible}
        onOk={onOk}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
        confirmLoading={uploading}
        maskClosable={!uploading}
        closable={!uploading}
      >
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
            aspect={1}
            circularCrop
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
      <Modal
        title={editType === 'phone' ? '修改手机号' : editType === 'email' ? '修改邮箱' : ''}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        confirmLoading={editLoading}
        maskClosable={!editLoading}
        closable={!editLoading}
      >
        <Form form={editForm} layout="vertical">
          {editStep === 'input' ? (
            <>
              {editType === 'phone' ? (
                <Form.Item name="phone" label="新手机号" rules={[{ required: true, message: '请输入手机号' }]}>
                  <Input />
                </Form.Item>
              ) : (
                <Form.Item name="email" label="新邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
                  <Input />
                </Form.Item>
              )}
              <Form.Item>
                <Button type="primary" onClick={handleSendEditCode} block>
                  发送验证码
                </Button>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="code" label="验证码" rules={[{ required: true, message: '请输入验证码' }]}>
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleSubmitEdit} block loading={editLoading}>
                  提交
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
      <canvas
        ref={previewCanvasRef}
        style={{
          display: 'none',
          objectFit: 'contain',
          width: completedCrop?.width,
          height: completedCrop?.height,
        }}
      />
      <LoginModal
        open={reauthVisible}
        onCancel={() => setReauthVisible(false)}
        title="请输入密码以确认注销"
        okText="注销"
        username={user?.phone || user?.email}
        usernameReadOnly
        hideSuccessMessage
        onOk={async (values) => {
          try {
            await login(values);
            const res = await deleteUser();
            if (res.error_code === 0) {
              clearLocalSession();
              message.success('账户已注销');
              navigate('/');
            } else {
              message.error(res.error_info || '注销失败');
            }
          } catch {
            message.error('登录或注销失败');
          }
        }}
      />
    </div>
  )
}

export default UserProfile