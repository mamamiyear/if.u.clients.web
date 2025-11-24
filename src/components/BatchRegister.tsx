import React from 'react'
import { Layout, Collapse, Form, Input, Button, Space, message, Spin } from 'antd'
import type { FormInstance } from 'antd'
import PeopleForm from './PeopleForm.tsx'
import InputDrawer from './InputDrawer.tsx'
import { createPeoplesBatch, type People } from '../apis'

const Panel = Collapse.Panel
const { Content } = Layout

type FormItem = { id: string; initialData?: Partial<People> }

type Props = { inputOpen?: boolean; onCloseInput?: () => void; containerEl?: HTMLElement | null }

const BatchRegister: React.FC<Props> = ({ inputOpen = false, onCloseInput, containerEl }) => {
  const [commonForm] = Form.useForm()
  const [items, setItems] = React.useState<FormItem[]>([])
  const instancesRef = React.useRef<Record<string, FormInstance>>({})
  const [loading, setLoading] = React.useState(false)

  const addItem = () => {
    if (loading) return
    setItems((arr) => [...arr, { id: `${Date.now()}-${Math.random()}` }])
  }

  const removeItem = (id: string) => {
    if (loading) return
    setItems((arr) => arr.filter((x) => x.id !== id))
    delete instancesRef.current[id]
  }

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
  }
  const buildPeople = (values: FormValues, common: { contact?: string }): People => {
    return {
      name: values.name,
      contact: values.contact || common.contact || undefined,
      gender: values.gender,
      age: values.age,
      height: values.height || undefined,
      marital_status: values.marital_status || undefined,
      introduction: values.introduction || {},
      match_requirement: values.match_requirement || undefined,
      cover: values.cover || undefined,
    }
  }

  const handleInputResult = (list: unknown) => {
    const arr = Array.isArray(list) ? list : [list]
    const next: FormItem[] = arr.map((data) => ({ id: `${Date.now()}-${Math.random()}`, initialData: data as Partial<People> }))
    setItems((prev) => [...prev, ...next])
  }

  const handleSubmit = async () => {
    if (loading) return
    try {
      setLoading(true)
      const common = await commonForm.validateFields().catch(() => ({}))
      const ids = items.map((x) => x.id)
      const forms = ids.map((id) => instancesRef.current[id]).filter(Boolean)
      if (forms.length !== ids.length) {
        setLoading(false)
        message.error('表单未就绪')
        return
      }
      const allValues: FormValues[] = []
      for (const f of forms) {
        try {
          const v = await f.validateFields()
          allValues.push(v)
        } catch {
          setLoading(false)
          message.error('请完善全部表单后再提交')
          return
        }
      }
      const payload: People[] = allValues.map((v) => buildPeople(v, common))
      const res = await createPeoplesBatch(payload)
      const failedIdx: number[] = []
      res.forEach((r, i) => {
        if (!r || r.error_code !== 0) failedIdx.push(i)
      })
      const success = res.length - failedIdx.length
      if (success > 0) message.success(`成功提交 ${success} 条`)
      if (failedIdx.length > 0) {
        message.error(`有 ${failedIdx.length} 条提交失败，请检查后重试`)
        setItems((prev) => prev.filter((_, i) => failedIdx.includes(i)))
      } else {
        setItems([{ id: `${Date.now()}-${Math.random()}` }])
        commonForm.resetFields()
      }
    } catch {
      message.error('提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Content className="main-content">
      <div className="content-body">
        <Collapse defaultActiveKey={["common"]}>
          <Panel header="公共信息" key="common">
            <Form form={commonForm} layout="vertical" size="large">
              <Form.Item name="contact" label="联系人">
                <Input placeholder="请输入联系人（可留空）" />
              </Form.Item>
            </Form>
          </Panel>
        </Collapse>

        <div style={{ height: 16 }} />

        <Collapse defaultActiveKey={items.map((x) => x.id)}>
          {items.map((item, idx) => (
            <Panel
              header={`注册表单 #${idx + 1}`}
              key={item.id}
              extra={
                <Button danger size="small" onClick={() => removeItem(item.id)} disabled={loading}>
                  删除
                </Button>
              }
            >
              <PeopleForm
                hideSubmitButton
                initialData={item.initialData}
                onFormReady={(f) => (instancesRef.current[item.id] = f)}
              />
            </Panel>
          ))}
        </Collapse>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Space>
            <Button onClick={addItem} disabled={loading}>添加表单</Button>
          </Space>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {loading ? '提交中...' : '提交'}
          </Button>
        </div>

        {loading && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Spin size="large" />
            </div>
          </div>
        )}
      </div>
      {/* 批量页右侧输入抽屉，挂载到标题栏下方容器 */}
      <InputDrawer
        open={inputOpen || false}
        onClose={onCloseInput || (() => {})}
        onResult={handleInputResult}
        containerEl={containerEl}
        showUpload
        mode={'batch-image'}
      />
    </Content>
  )
}

export default BatchRegister