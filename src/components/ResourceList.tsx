import React from 'react';
import { Layout, Typography, Table, Grid, InputNumber, Button, Space, Tag, message } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import type { TableProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './MainContent.css';
import { getPeoples } from '../apis';
import type { People } from '../apis';

const { Content } = Layout;

// 数据类型定义 - 使用 API 中的 People 类型
export type DictValue = Record<string, string>;
export type Resource = People;

// 获取人员列表数据
async function fetchResources(): Promise<Resource[]> {
  try {
    const response = await getPeoples({
      limit: 1000, // 获取大量数据用于前端分页和筛选
      offset: 0
    });
    
    // 检查响应是否成功
    if (response.error_code !== 0) {
      console.error('API错误:', response.error_info);
      message.error(response.error_info || '获取数据失败');
      // 返回空数组或使用 mock 数据作为后备
      return [];
    }
    
    // 转换数据格式以匹配组件期望的结构
    return response.data?.map((person: any) => ({
      id: person.id || `person-${Date.now()}-${Math.random()}`,
      name: person.name || '未知',
      gender: person.gender || '其他/保密',
      age: person.age || 0,
      height: person.height,
      marital_status: person.marital_status,
      introduction: person.introduction || {},
      contact: person.contact || '',
    })) || [];
    
  } catch (error: any) {
    console.error('获取人员列表失败:', error);
    message.error('获取人员列表失败，使用模拟数据');
    
    // 回退到 mock 数据，便于本地开发
    return [
      {
        id: '1',
        name: '张三',
        gender: '男',
        age: 28,
        height: 175,
        marital_status: '未婚',
        introduction: {
          籍贯: '北京',
          职业: '产品经理',
          教育: '本科',
          爱好: '跑步、旅行',
          技能: '数据分析、原型设计',
          座右铭: '保持好奇心，持续迭代',
          自我评价: '目标感强，善于跨团队沟通与协调。',
        },
      },
      {
        id: '2',
        name: '李四',
        gender: '女',
        age: 26,
        height: 165,
        marital_status: '已婚',
        introduction: {
          籍贯: '上海',
          职业: 'UI 设计师',
          教育: '硕士',
          公司: '知名互联网公司',
          爱好: '阅读、咖啡、插画',
          技能: '视觉系统、组件库设计',
          自我评价: '注重细节，强调一致性与可访问性。',
        },
      },
      {
        id: '3',
        name: '王五',
        gender: '其他/保密',
        age: 31,
        height: 180,
        marital_status: '保密',
        introduction: {
          籍贯: '成都',
          职业: '摄影师',
          教育: '本科',
          爱好: '旅行拍摄、登山',
          技能: '人像、风光摄影',
          座右铭: '用镜头记录真实与美',
          自我评价: '对光线敏感，善于捕捉转瞬即逝的情绪。',
        },
      },
      {
        id: '4',
        name: '赵六',
        gender: '男',
        age: 22,
        height: 178,
        marital_status: '未婚',
        introduction: {
          籍贯: '西安',
          职业: '前端开发',
          教育: '本科',
          技能: 'React、TypeScript、Vite',
          证书: '阿里云开发者认证',
          项目经验: '电商用户中心、数据可视化面板',
          自我评价: '爱钻研，对性能优化和 DX 有热情。爱钻研，对性能优化和 DX 有热情。爱钻研，对性能优化和 DX 有热情。爱钻研，对性能优化和 DX 有热情。爱钻研，对性能优化和 DX 有热情。爱钻研，对性能优化和 DX 有热情。爱钻研，对性能优化和 DX 有热情。',
          项目经验2: '电商用户中心、数据可视化面板',
          项目经验3: '电商用户中心、数据可视化面板',
          项目经验4: '电商用户中心、数据可视化面板',
          项目经验5: '电商用户中心、数据可视化面板',
          项目经验6: '电商用户中心、数据可视化面板',
        },
      },
      {
        id: '5',
        name: '周杰',
        gender: '男',
        age: 35,
        height: 182,
        marital_status: '已婚',
        introduction: {
          籍贯: '杭州',
          职业: '后端开发',
          教育: '硕士',
          技能: 'Go、gRPC、K8s',
          部门: '平台基础设施',
          自我评价: '偏工程化，注重稳定性与可观测性。',
        },
      },
      {
        id: '6',
        name: '吴敏',
        gender: '女',
        age: 29,
        height: 168,
        marital_status: '未婚',
        introduction: {
          籍贯: '南京',
          职业: '数据分析师',
          教育: '本科',
          技能: 'SQL、Python、Tableau',
          研究方向: '用户增长与留存',
          自我评价: '以数据驱动决策，关注可解释性。',
        },
      },
      {
        id: '7',
        name: '郑辉',
        gender: '男',
        age: 41,
        height: 170,
        marital_status: '离异',
        introduction: {
          籍贯: '长沙',
          职业: '产品运营',
          教育: '本科',
          爱好: '篮球、播客',
          技能: '活动策划、社区运营',
          自我评价: '擅长整合资源并解决复杂协调问题。',
        },
      },
      {
        id: '8',
        name: '王芳',
        gender: '女',
        age: 33,
        height: 160,
        marital_status: '已婚',
        introduction: {
          籍贯: '青岛',
          职业: '市场经理',
          教育: '本科',
          技能: '品牌策略、内容营销',
          社交媒体: '微博、抖音、知乎',
          自我评价: '善于讲故事并构建品牌资产。',
        },
      },
      {
        id: '9',
        name: '刘洋',
        gender: '男',
        age: 24,
        height: 172,
        marital_status: '未婚',
        introduction: {
          籍贯: '合肥',
          职业: '测试工程师',
          教育: '本科',
          技能: '自动化测试、性能测试',
          自我评价: '对边界条件敏感，追求高覆盖与低误报。',
        },
      },
      {
        id: '10',
        name: '陈晨',
        gender: '女',
        age: 27,
        height: 163,
        marital_status: '未婚',
        introduction: {
          籍贯: '武汉',
          职业: '人力资源',
          教育: '本科',
          技能: '招聘、绩效与组织发展',
          自我评价: '重视文化与组织氛围建设。',
        },
      },
      {
        id: '11',
        name: '孙琪',
        gender: '女',
        age: 38,
        height: 166,
        marital_status: '已婚',
        introduction: {
          籍贯: '重庆',
          职业: '项目经理',
          教育: '硕士',
          技能: '进度与风险管理',
          获奖: '优秀 PM 奖',
          自我评价: '以结果为导向，兼顾团队士气。',
        },
      },
      {
        id: '12',
        name: '朱莉',
        gender: '女',
        age: 30,
        height: 158,
        marital_status: '未婚',
        introduction: {
          籍贯: '厦门',
          职业: '内容编辑',
          教育: '本科',
          技能: '选题、采访与写作',
          座右铭: '字斟句酌，以小见大',
          自我评价: '具叙事力，关注读者反馈。',
        },
      },
      {
        id: '13',
        name: '黄磊',
        gender: '男',
        age: 45,
        height: 176,
        marital_status: '已婚',
        introduction: {
          籍贯: '广州',
          职业: '架构师',
          教育: '硕士',
          技能: '分布式系统、架构治理',
          自我评价: '关注可扩展性与长期维护成本。',
        },
      },
      {
        id: '14',
        name: '高远',
        gender: '男',
        age: 32,
        height: 181,
        marital_status: '未婚',
        introduction: {
          籍贯: '沈阳',
          职业: '算法工程师',
          教育: '博士',
          技能: '推荐系统、CTR 预估',
          研究方向: '多模态融合',
          自我评价: '注重泛化与鲁棒性。',
        },
      },
      {
        id: '15',
        name: '曹宁',
        gender: '男',
        age: 28,
        height: 169,
        marital_status: '未婚',
        introduction: {
          籍贯: '苏州',
          职业: '运维工程师',
          教育: '本科',
          技能: 'Linux、CI/CD、监控',
          自我评价: '追求稳定与自动化。',
        },
      },
      {
        id: '16',
        name: '韩梅',
        gender: '女',
        age: 34,
        height: 162,
        marital_status: '已婚',
        introduction: {
          籍贯: '大连',
          职业: '销售总监',
          教育: '本科',
          技能: '大客户拓展、谈判',
          自我评价: '结果导向，善于建立信任。',
        },
      },
      {
        id: '17',
        name: '秦川',
        gender: '男',
        age: 52,
        height: 174,
        marital_status: '已婚',
        introduction: {
          籍贯: '洛阳',
          职业: '财务主管',
          教育: '本科',
          技能: '成本控制、风险合规',
          自我评价: '稳健务实，注重细节。',
        },
      },
      {
        id: '18',
        name: '何静',
        gender: '女',
        age: 23,
        height: 159,
        marital_status: '未婚',
        introduction: {
          籍贯: '昆明',
          职业: '新媒体运营',
          教育: '本科',
          技能: '短视频策划、社群',
          自我评价: '创意活跃，执行力强。',
        },
      },
      {
        id: '19',
        name: '吕博',
        gender: '男',
        age: 36,
        height: 183,
        marital_status: '离异',
        introduction: {
          籍贯: '天津',
          职业: '产品专家',
          教育: '硕士',
          技能: '竞品分析、商业化',
          自我评价: '偏战略，长期主义者。',
        },
      },
      {
        id: '20',
        name: '沈玉',
        gender: '女',
        age: 25,
        height: 161,
        marital_status: '未婚',
        introduction: {
          籍贯: '福州',
          职业: '交互设计师',
          教育: '本科',
          技能: '流程设计、可用性测试',
          自我评价: '以用户为中心，迭代驱动优化。',
        },
      },
      {
        id: '21',
        name: '罗兰',
        gender: '其他/保密',
        age: 40,
        height: 177,
        marital_status: '保密',
        introduction: {
          籍贯: '呼和浩特',
          职业: '翻译',
          教育: '硕士',
          语言: '中英法德',
          自我评价: '严谨细致，语感强。',
        },
      },
      {
        id: '22',
        name: '尹峰',
        gender: '男',
        age: 29,
        height: 168,
        marital_status: '未婚',
        introduction: {
          籍贯: '石家庄',
          职业: '安全工程师',
          教育: '本科',
          技能: '渗透测试、代码审计',
          自我评价: '对攻击面敏感，防守与预警并重。',
        },
      },
      {
        id: '23',
        name: '邓雅',
        gender: '女',
        age: 37,
        height: 167,
        marital_status: '已婚',
        introduction: {
          籍贯: '宁波',
          职业: '供应链经理',
          教育: '硕士',
          技能: '精益管理、库存优化',
          自我评价: '注重流程化与跨部门协同。',
        },
      },
      {
        id: '24',
        name: '侯哲',
        gender: '男',
        age: 21,
        height: 171,
        marital_status: '未婚',
        introduction: {
          籍贯: '桂林',
          职业: '实习生',
          教育: '本科在读',
          技能: '前端基础、原型制作',
          自我评价: '好学上进，快速吸收新知识。',
        },
      },
    ];
  }
}

// 数字范围筛选下拉
function buildNumberRangeFilter(dataIndex: keyof Resource, label: string): ColumnType<Resource> {
  return {
    title: label,
    dataIndex,
    sorter: (a: Resource, b: Resource) => Number((a as any)[dataIndex] ?? 0) - Number((b as any)[dataIndex] ?? 0),
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
      const [min, max] = String(selectedKeys?.[0] ?? ':').split(':');
      const [localMin, setLocalMin] = React.useState<number | undefined>(min ? Number(min) : undefined);
      const [localMax, setLocalMax] = React.useState<number | undefined>(max ? Number(max) : undefined);
      return (
        <div style={{ padding: 8 }}>
          <Space direction="vertical" style={{ width: 200 }}>
            <InputNumber
              placeholder="最小值"
              value={localMin}
              onChange={(v) => setLocalMin(v ?? undefined)}
              style={{ width: '100%' }}
            />
            <InputNumber
              placeholder="最大值"
              value={localMax}
              onChange={(v) => setLocalMax(v ?? undefined)}
              style={{ width: '100%' }}
            />
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<SearchOutlined />}
                onClick={() => {
                  const key = `${localMin ?? ''}:${localMax ?? ''}`;
                  setSelectedKeys?.([key]);
                  confirm?.();
                }}
              >
                筛选
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSelectedKeys?.([]);
                  clearFilters?.();
                }}
              >
                重置
              </Button>
            </Space>
          </Space>
        </div>
      );
    },
    onFilter: (filterValue: React.Key | boolean, record: Resource) => {
      const [minStr, maxStr] = String(filterValue).split(':');
      const min = minStr ? Number(minStr) : undefined;
      const max = maxStr ? Number(maxStr) : undefined;
      const val = Number((record as any)[dataIndex] ?? NaN);
      if (Number.isNaN(val)) return false;
      if (min !== undefined && val < min) return false;
      if (max !== undefined && val > max) return false;
      return true;
    },
  } as ColumnType<Resource>;
}

const ResourceList: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Resource[]>([]);
  const [pagination, setPagination] = React.useState<{ current: number; pageSize: number }>({ current: 1, pageSize: 10 });

  const handleTableChange: TableProps<Resource>['onChange'] = (pg) => {
    setPagination({ current: pg?.current ?? 1, pageSize: pg?.pageSize ?? 10 });
  };

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchResources().then((list) => {
      if (!mounted) return;
      setData(list);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const columns: ColumnsType<Resource> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: '男', value: '男' },
        { text: '女', value: '女' },
        { text: '其他/保密', value: '其他/保密' },
      ],
      onFilter: (value: React.Key | boolean, record: Resource) => String(record.gender) === String(value),
      render: (g: string) => {
        const color = g === '男' ? 'blue' : g === '女' ? 'magenta' : 'default';
        return <Tag color={color}>{g}</Tag>;
      },
    },
    buildNumberRangeFilter('age', '年龄'),
    // 非移动端显示更多列
    ...(!isMobile
      ? [
          buildNumberRangeFilter('height', '身高'),
          {
            title: '婚姻状况',
            dataIndex: 'marital_status',
            key: 'marital_status',
          } as ColumnType<Resource>,
        ]
      : []),
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      render: (v: string) => (v ? v : '-'),
    } as ColumnType<Resource>,
  ];

  return (
    <Content className="main-content">
      <div className="content-body">
        <Typography.Title level={3} style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
          资源列表
        </Typography.Title>

        <Table<Resource>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: [10, 25, 50, 100],
            position: ['bottomRight'],
            total: data.length,
            showTotal: (total) => `总计 ${total} 条`,
          }}
          onChange={handleTableChange}
          expandable={{
            expandedRowRender: (record: Resource) => {
              const intro = record.introduction ? Object.entries(record.introduction) : [];
              return (
                <div style={{ padding: '8px 24px' }}>
                  {isMobile && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12, color: '#434343ff' }}>
                      {record.height !== undefined && <div>身高: {record.height}</div>}
                      {record.marital_status && <div>婚姻状况: {record.marital_status}</div>}
                    </div>
                  )}
                  {intro.length > 0 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 12,
                      }}
                    >
                      {intro.map(([k, v]) => (
                        <div
                          key={k}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            alignItems: 'flex-start',
                            wordBreak: 'break-word',
                          }}
                        >
                          <span style={{ color: '#000000ff', fontWeight: 600 }}>{k}</span>
                          <span style={{ color: '#2d2d2dff' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#9ca3af' }}>暂无介绍</div>
                  )}
                </div>
              );
            },
          }}
        />
      </div>
    </Content>
  );
};

export default ResourceList;