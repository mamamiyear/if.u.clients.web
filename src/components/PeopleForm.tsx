import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, message, Row, Col } from 'antd';
import './PeopleForm.css';
import KeyValueList from './KeyValueList.tsx'
import { createPeople, type People } from '../apis';

const { TextArea } = Input;

interface PeopleFormProps {
  initialData?: any;
}

const PeopleForm: React.FC<PeopleFormProps> = ({ initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 当 initialData 变化时，自动填充表单
  useEffect(() => {
    if (initialData) {
      console.log('收到API返回数据，自动填充表单:', initialData);
      
      // 处理返回的数据，将其转换为表单需要的格式
      const formData: any = {};
      
      if (initialData.name) formData.name = initialData.name;
      if (initialData.contact) formData.contact = initialData.contact;
      if (initialData.cover) formData.cover = initialData.cover;
      if (initialData.gender) formData.gender = initialData.gender;
      if (initialData.age) formData.age = initialData.age;
      if (initialData.height) formData.height = initialData.height;
      if (initialData.marital_status) formData.marital_status = initialData.marital_status;
      if (initialData.match_requirement) formData.match_requirement = initialData.match_requirement;
      if (initialData.introduction) formData.introduction = initialData.introduction;
      
      // 设置表单字段值
      form.setFieldsValue(formData);
      
      // 显示成功消息
      message.success('已自动填充表单，请检查并确认信息');
    }
  }, [initialData, form]);

  const onFinish = async (values: any) => {
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
      
    } catch (error: any) {
      console.error('提交失败:', error);
      
      // 根据错误类型显示不同的错误信息
      if (error.status === 422) {
        message.error('表单数据格式有误，请检查输入内容');
      } else if (error.status >= 500) {
        message.error('服务器错误，请稍后重试');
      } else {
        message.error(error.message || '提交失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

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

        <Row gutter={[12, 12]}>
          <Col xs={24}>
            <Form.Item name="cover" label="人物封面">
              <Input placeholder="请输入图片链接（可留空）" />
            </Form.Item>
          </Col>
        </Row>

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
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? '提交中...' : '提交'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PeopleForm;