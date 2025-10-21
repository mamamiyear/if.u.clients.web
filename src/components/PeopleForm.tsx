import React from 'react';
import { Form, Input, Select, InputNumber, Button, message, Row, Col } from 'antd';
import './PeopleForm.css';
import KeyValueList from './KeyValueList.tsx'

const { TextArea } = Input;

const PeopleForm: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // 暂时打印内容，模拟提交
    console.log('People form submit:', values);
    message.success('表单已提交');
    form.resetFields();
  };

  return (
    <div className="people-form">
      <Form
        form={form}
        layout="vertical"
        size="large"
        onFinish={onFinish}
      >

        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}> 
          <Input placeholder="如：张三" />
        </Form.Item>

        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
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

          <Col xs={24} md={6}>
            <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}> 
              <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="如：28" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="height" label="身高(cm)">
              <InputNumber
                min={0}
                max={250}
                style={{ width: '100%' }}
                placeholder="如：175（可留空）"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item name="marital_status" label="婚姻状况">
              <Input placeholder="可自定义输入，例如：未婚、已婚、离异等" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="introduction" label="个人介绍（键值对）">
          <KeyValueList />
        </Form.Item>

        <Form.Item name="match_requirement" label="择偶要求">
          <TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder="例如：性格开朗、三观一致等" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PeopleForm;