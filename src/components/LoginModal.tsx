import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';

interface Props {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => Promise<void>;
  title: string;
  username?: string;
  usernameReadOnly?: boolean;
  okText?: string;
  hideSuccessMessage?: boolean;
}

const LoginModal: React.FC<Props> = ({ open, onCancel, onOk, title, username, usernameReadOnly, okText, hideSuccessMessage }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({ username });
    }
  }, [open, username, form]);

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      const username: string = values.username;
      const password: string = values.password;
      const isEmail = /\S+@\S+\.\S+/.test(username);
      const payload = isEmail
        ? { email: username, password }
        : { phone: username, password };
      await onOk(payload as any);
      if (!hideSuccessMessage) {
        message.success('登录成功');
      }
      onCancel();
    } catch (error) {
      message.error('登录失败');
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleLogin}>
          {okText || '登录'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="手机号 / 邮箱"
          rules={[{ required: true, message: '请输入手机号 / 邮箱' }]}
        >
          <Input readOnly={usernameReadOnly} style={{ backgroundColor: usernameReadOnly ? '#f5f5f5' : '' }} />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;