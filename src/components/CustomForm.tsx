import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, message, Row, Col, Radio, Typography, Grid } from 'antd';
import 'react-image-crop/dist/ReactCrop.css';
import type { FormInstance } from 'antd';

import './CustomForm.css';
import KeyValueList from './KeyValueList.tsx';
import ImageInputGroup from './ImageInputGroup.tsx';
import { createCustom, updateCustom, type Custom } from '../apis';

const { TextArea } = Input;
const { useBreakpoint } = Grid;

interface CustomFormProps {
  initialData?: Partial<Custom>;
  hideSubmitButton?: boolean;
  onFormReady?: (form: FormInstance) => void;
  onSuccess?: () => void;
}

const CustomForm: React.FC<CustomFormProps> = ({ initialData, hideSubmitButton = false, onFormReady, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // 需要处理一些数据转换，例如 birth -> age (如果后端给的是 birth year)
      // 这里假设 initialData 里已经处理好了，或者先直接透传
      const formData = { ...initialData };
      // 如果有 birth，转换为 age 显示
      if (formData.birth) {
        // 如果 birth 小于 100，假设直接存的年龄，直接显示
        if (formData.birth < 100) {
          // @ts-expect-error: 临时给 form 设置 age 字段
          formData.age = formData.birth;
        } else {
          // 否则假设是年份，计算年龄
          const currentYear = new Date().getFullYear();
          // @ts-expect-error: 临时给 form 设置 age 字段
          formData.age = currentYear - formData.birth;
        }
      }
      // images 数组处理，确保是字符串数组
      if (formData.images && Array.isArray(formData.images)) {
        if (formData.images.length === 0) {
          formData.images = [''];
        }
      } else {
        formData.images = [''];
      }
      form.setFieldsValue(formData);
    } else {
      // 初始化空状态
      form.setFieldsValue({
        images: ['']
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    onFormReady?.(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values: Custom & { age?: number }) => {
    setLoading(true);

    try {
      const currentYear = new Date().getFullYear();
      const birth = currentYear - (values.age || 0);

      const customData: Custom = {
        name: values.name,
        gender: values.gender,
        birth: birth,
        phone: values.phone || undefined,
        email: values.email || undefined,
        
        height: values.height || undefined,
        weight: values.weight || undefined,
        images: values.images?.filter((url: string) => !!url) || [],
        scores: values.scores || undefined,
        
        degree: values.degree || undefined,
        academy: values.academy || undefined,
        occupation: values.occupation || undefined,
        income: values.income || undefined,
        assets: values.assets || undefined,
        current_assets: values.current_assets || undefined,
        house: values.house || undefined,
        car: values.car || undefined,
        
        registered_city: values.registered_city || undefined,
        live_city: values.live_city || undefined,
        native_place: values.native_place || undefined,
        original_family: values.original_family || undefined,
        is_single_child: values.is_single_child,
        
        match_requirement: values.match_requirement || undefined,
        introductions: values.introductions || {},
        
        custom_level: values.custom_level || '普通',
        comments: values.comments || {},
      };

      console.log('提交客户数据:', customData);

      let response;
      if (initialData?.id) {
        response = await updateCustom(initialData.id, customData);
      } else {
        response = await createCustom(customData);
      }

      if (response.error_code === 0) {
        message.success(initialData?.id ? '客户信息已更新！' : '客户信息已成功提交到后端！');
        if (!initialData?.id) {
          form.resetFields();
        }
        onSuccess?.();
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

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const scoresNode = (
    <Form.Item name="scores" label="外貌评分">
      <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="分" />
    </Form.Item>
  );

  const heightNode = (
     <Form.Item name="height" label="身高(cm)">
       <InputNumber min={0} max={250} style={{ width: '100%' }} placeholder="cm" />
     </Form.Item>
  );

  const weightNode = (
     <Form.Item name="weight" label="体重(kg)">
       <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="kg" />
     </Form.Item>
  );

  const degreeNode = (
     <Form.Item name="degree" label="学历">
       <Input placeholder="如：本科" />
     </Form.Item>
  );

  const academyNode = (
     <Form.Item name="academy" label="院校">
       <Input placeholder="如：清华大学" />
     </Form.Item>
  );

  return (
    <div className="custom-form">
       {!hideSubmitButton && (
         <>
           <Typography.Title level={3} style={{ marginBottom: 4 }}>客户录入</Typography.Title>
           <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>录入客户基本信息</Typography.Text>
         </>
       )}

      <Form
        form={form}
        layout="vertical"
        size="large"
        onFinish={onFinish}
      >
        {/* Row 1: 姓名、性别、年龄 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
              <Select placeholder="请选择性别" options={[{ label: '男', value: '男' }, { label: '女', value: '女' }]} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
              <InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="请输入年龄" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: 电话、邮箱、婚姻状况 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item name="phone" label="电话">
              <Input placeholder="请输入电话" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="marital" label="婚姻状况">
              <Select placeholder="请选择" allowClear>
                <Select.Option value="未婚">未婚</Select.Option>
                <Select.Option value="离异">离异</Select.Option>
                <Select.Option value="丧偶">丧偶</Select.Option>
                <Select.Option value="未知">未知</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: Image Group */}
        <Form.Item name="images" label="照片图片">
          <ImageInputGroup customId={initialData?.id} />
        </Form.Item>

        {/* Row 4: Physical Info */}
        {isMobile ? (
          // Mobile Layout
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* 1. Scores (Full width) */}
            {scoresNode}
            
            {/* 2. Height & Weight */}
            <Row gutter={[12, 12]}>
              <Col xs={12}>{heightNode}</Col>
              <Col xs={12}>{weightNode}</Col>
            </Row>

            {/* 3. Degree & Academy */}
            <Row gutter={[12, 12]}>
              <Col xs={12}>{degreeNode}</Col>
              <Col xs={12}>{academyNode}</Col>
            </Row>
          </div>
        ) : (
          // PC Layout
          <Row gutter={[24, 24]}>
              <Col span={8}>{scoresNode}</Col>
              <Col span={8}>{heightNode}</Col>
              <Col span={8}>{weightNode}</Col>
          </Row>
        )}
        
        {/* Row 5a: 学历、院校 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>{degreeNode}</Col>
          <Col xs={24} md={12}>{academyNode}</Col>
        </Row>

        {/* Row 5b: 职业、收入 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item name="occupation" label="职业">
              <Input placeholder="如：工程师" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="income" label="收入(万/年)">
              <InputNumber style={{ width: '100%' }} placeholder="万" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 5c: 资产、流动资产 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item name="assets" label="资产(万)">
              <InputNumber style={{ width: '100%' }} placeholder="万" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="current_assets" label="流动资产(万)">
              <InputNumber style={{ width: '100%' }} placeholder="万" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 5d: 房产情况、汽车情况 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item name="house" label="房产情况">
              <Select placeholder="请选择房产情况" options={['无房', '有房有贷', '有房无贷'].map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="car" label="汽车情况">
              <Select placeholder="请选择汽车情况" options={['无车', '有车有贷', '有车无贷'].map(v => ({ label: v, value: v }))} />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 6: 户口城市、常住城市、籍贯 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item name="registered_city" label="户口城市">
              <Input placeholder="如：北京" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="live_city" label="常住城市">
              <Input placeholder="如：上海" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="native_place" label="籍贯">
              <Input placeholder="如：江苏" />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 7: 是否独生子 */}
        <Form.Item name="is_single_child" label="是否独生子">
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Row 8: 原生家庭 */}
        <Form.Item name="original_family" label="原生家庭">
          <TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="请输入原生家庭情况" />
        </Form.Item>

        {/* Row 9: 择偶要求 */}
        <Form.Item name="match_requirement" label="择偶要求">
          <TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="请输入择偶要求" />
        </Form.Item>

        {/* Row 10: 其他信息 (KeyValueList) */}
        <Form.Item name="introductions" label="其他信息">
          <KeyValueList />
        </Form.Item>

        {/* Row 11: 客户等级、是否公开 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
             <Form.Item name="custom_level" label="客户等级">
                <Select options={['普通', 'VIP', '高级VIP'].map(v => ({ label: v, value: v }))} placeholder="请选择" />
             </Form.Item>
          </Col>
          <Col xs={24} md={12}>
             <Form.Item name="is_public" label="是否公开">
                <Radio.Group>
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
             </Form.Item>
          </Col>
        </Row>

        {/* Row 13: 备注评论 (KeyValueList) */}
        <Form.Item name="comments" label="备注评论">
          <KeyValueList />
        </Form.Item>

        {!hideSubmitButton && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {initialData?.id ? '保存修改' : '提交客户信息'}
            </Button>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

export default CustomForm;
