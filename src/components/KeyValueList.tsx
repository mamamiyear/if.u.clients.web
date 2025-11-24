import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Input, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './KeyValueList.css';

export type DictValue = Record<string, string>;

type KeyValuePair = { id: string; k: string; v: string };

type Props = {
  value?: DictValue;
  onChange?: (value: DictValue) => void;
};

const KeyValueList: React.FC<Props> = ({ value, onChange }) => {
  const [rows, setRows] = useState<KeyValuePair[]>([]);

  const initializedRef = useRef(false);
  useEffect(() => {
    setRows((prev) => {
      const existingIdByKey = new Map(prev.filter((r) => r.k).map((r) => [r.k, r.id]));
      const valuePairs: KeyValuePair[] = value
        ? Object.keys(value).map((key) => ({
            id: existingIdByKey.get(key) || `${key}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            k: key,
            v: value[key] ?? '',
          }))
        : [];
      const blankRows = prev.filter((r) => !r.k);
      let merged = [...valuePairs, ...blankRows];
      if (!initializedRef.current && merged.length === 0) {
        merged = [{ id: `row-${Date.now()}-${Math.random().toString(36).slice(2)}`, k: '', v: '' }];
      }
      initializedRef.current = true;
      return merged;
    });
  }, [value]);

  const emitChange = (nextRows: KeyValuePair[]) => {
    const dict: DictValue = {};
    nextRows.forEach((r) => {
      if (r.k && r.k.trim() !== '') {
        dict[r.k] = r.v ?? '';
      }
    });
    onChange?.(dict);
  };

  const updateRow = (id: string, field: 'k' | 'v', val: string) => {
    const next = rows.map((r) => (r.id === id ? { ...r, [field]: val } : r));
    setRows(next);
    emitChange(next);
  };

  const addRow = () => {
    const next = [...rows, { id: `row-${Date.now()}-${Math.random().toString(36).slice(2)}`, k: '', v: '' }];
    setRows(next);
    // 不触发 onChange，因为字典未变化（空行不入字典）
  };

  const removeRow = (id: string) => {
    const removed = rows.find((r) => r.id === id);
    const next = rows.filter((r) => r.id !== id);
    setRows(next);
    if (removed?.k && removed.k.trim() !== '') {
      emitChange(next);
    }
  };

  return (
    <div className="kv-list">
      {rows.map((r) => (
        <div className="kv-row" key={r.id}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={10}>
              <Input
                size="large"
                placeholder="键（例如：籍贯、职业）"
                value={r.k}
                onChange={(e) => updateRow(r.id, 'k', e.target.value)}
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                size="large"
                placeholder="值（例如：北京、产品经理）"
                value={r.v}
                onChange={(e) => updateRow(r.id, 'v', e.target.value)}
              />
            </Col>
            <Col xs={24} md={2}>
              <Button
                className="kv-remove"
                aria-label="删除"
                icon={<DeleteOutlined />}
                onClick={() => removeRow(r.id)}
              />
            </Col>
          </Row>
        </div>
      ))}

      <Button type="dashed" block icon={<PlusOutlined />} onClick={addRow}>
        添加一项
      </Button>
    </div>
  );
};

export default KeyValueList;