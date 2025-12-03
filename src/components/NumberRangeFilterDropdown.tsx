import React, { useState } from 'react';
import { Input, Button, Space } from 'antd';
import type { FilterConfirmProps } from 'antd/es/table/interface';

interface NumberRangeFilterProps {
  setSelectedKeys: (selectedKeys: React.Key[]) => void;
  selectedKeys: React.Key[];
  confirm: (param?: FilterConfirmProps) => void;
  clearFilters: () => void;
  close: () => void;
}

const NumberRangeFilterDropdown: React.FC<NumberRangeFilterProps> = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}) => {
  const [min, setMin] = useState<string>(selectedKeys[0] ? String(selectedKeys[0]) : '');
  const [max, setMax] = useState<string>(selectedKeys[1] ? String(selectedKeys[1]) : '');

  const handleSearch = () => {
    // 将两个值合并为一个字符串存储，方便 onFilter 处理
    if (min || max) {
      setSelectedKeys([`${min},${max}`]);
    } else {
      setSelectedKeys([]);
    }
    confirm();
    close();
  };

  const handleReset = () => {
    setMin('');
    setMax('');
    clearFilters();
    confirm();
    close();
  };

  // 初始化状态时，解析 selectedKeys[0]
  React.useEffect(() => {
    if (selectedKeys[0]) {
      const [initialMin, initialMax] = (selectedKeys[0] as string).split(',');
      setMin(initialMin);
      setMax(initialMax);
    }
  }, [selectedKeys]);

  return (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Space direction="vertical" size={8}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Input
            placeholder="最小"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            style={{ width: 80 }}
          />
          <span>-</span>
          <Input
            placeholder="最大"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            style={{ width: 80 }}
          />
        </div>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            color={min || max ? 'primary' : 'default'}
            variant="text"
            onClick={handleReset}
            size="small"
            style={{ width: 80 }}
          >
            重置
          </Button>
          <Button
            type="primary"
            onClick={handleSearch}
            icon={null}
            size="small"
            style={{ width: 80 }}
          >
            确定
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default NumberRangeFilterDropdown;
