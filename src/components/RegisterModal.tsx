import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/useAuth';
import type { RegisterRequest } from '../apis/types';

interface Props {
  open: boolean;
  onCancel: () => void;
}

const RegisterModal: React.FC<Props> = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const { register, sendCode } = useAuth();
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [registerPayload, setRegisterPayload] = useState<Partial<RegisterRequest> | null>(null);

  const handleSendCode = async () => {
    try {
      const values = await form.validateFields(['phone', 'email', 'nickname', 'password']);
      if (!values.phone && !values.email) {
        message.error('手机号和邮箱至少填写一个');
        return;
      }
      setRegisterPayload(values);

      const target_type = values.phone ? 'phone' : 'email';
      const target = values.phone || values.email;

      await sendCode({ target_type, target, scene: 'register' });
      message.success('验证码已发送');
      setStep('verify');
    } catch {
      message.error('发送验证码失败');
    }
  };

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      await register({ ...registerPayload, ...values } as RegisterRequest);
      message.success('注册成功');
      onCancel();
    } catch {
      message.error('注册失败');
    }
  };

  return (
    <Modal
      title="注册"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical">
        {step === 'register' ? (
          <>
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSendCode} block>
                发送验证码
              </Button>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              name="code"
              label="验证码"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleRegister} block>
                注册
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default RegisterModal;