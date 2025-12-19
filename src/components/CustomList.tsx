import React, { useEffect, useState, useRef } from 'react';
import { Layout, Typography, Table, Grid, Button, Space, message, Descriptions, Tag, Modal, Popconfirm, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd';
import { 
  ManOutlined, 
  WomanOutlined, 
  PictureOutlined, 
  DeleteOutlined, 
  EditOutlined,
  UserOutlined,
  EllipsisOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { getCustoms, deleteCustom } from '../apis/custom';
import type { Custom } from '../apis/types';
import './MainContent.css';
import ImageModal from './ImageModal.tsx';
import NumberRangeFilterDropdown from './NumberRangeFilterDropdown';
import CustomForm from './CustomForm.tsx';
import ImageSelectorModal from './ImageSelectorModal';
import ImageCropperModal from './ImageCropperModal';
import { generateShareImage, type ShareData } from '../utils/shareImageGenerator';
import { useAuth } from '../contexts/useAuth';

const { Content } = Layout;
const { useBreakpoint } = Grid;

// 扩展 Custom 类型以确保 id 存在
type CustomResource = Custom & { id: string };

const CustomList: React.FC = () => {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const [data, setData] = useState<CustomResource[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 图片弹窗状态
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  // 编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CustomResource | null>(null);
  const editFormRef = useRef<FormInstance | null>(null);

  // 分享相关状态
  const [shareSelectorVisible, setShareSelectorVisible] = useState(false);
  const [shareCropperVisible, setShareCropperVisible] = useState(false);
  const [shareResultVisible, setShareResultVisible] = useState(false);
  const [selectedShareImage, setSelectedShareImage] = useState<string>('');
  const [generatedShareImage, setGeneratedShareImage] = useState<string>('');
  const [sharingCustom, setSharingCustom] = useState<CustomResource | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCustoms({ limit: 1000, offset: 0 });
      if (response.error_code === 0 && response.data) {
        // 确保 items 存在且 id 存在
        const list = (response.data.items || []).map(item => ({
          ...item,
          id: item.id || `custom-${Date.now()}-${Math.random()}`
        }));
        setData(list);
      } else {
        message.error(response.error_info || '获取客户列表失败');
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error('获取客户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 删除客户
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteCustom(id);
      if (response.error_code === 0) {
        message.success('删除成功');
        fetchData(); // 重新加载数据
      } else {
        message.error(response.error_info || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 计算年龄
  const calculateAge = (birth?: number) => {
    if (!birth) return '未知';
    // 如果 birth 小于 100，假设直接存的年龄
    if (birth < 100) return birth;
    // 否则假设是年份
    const currentYear = new Date().getFullYear();
    return currentYear - birth;
  };

  // 通用数字范围筛选逻辑生成器
  const createNumberRangeOnFilter = (getValue: (record: CustomResource) => number) => {
    return (value: React.Key | boolean, record: CustomResource) => {
      const [min, max] = (value as string).split(',').map(Number);
      const val = getValue(record);
      
      if (typeof val !== 'number') return false;

      if (!isNaN(min) && !isNaN(max)) {
        return val >= min && val <= max;
      }
      if (!isNaN(min)) {
        return val >= min;
      }
      if (!isNaN(max)) {
        return val <= max;
      }
      return true;
    };
  };

  const ageOnFilter = createNumberRangeOnFilter((record) => {
    const age = calculateAge(record.birth);
    return typeof age === 'number' ? age : -1;
  });

  const heightOnFilter = createNumberRangeOnFilter((record) => record.height || 0);

  // 修改 NumberRangeFilterDropdown 以适配 "min,max" 格式
  // 等等，修改组件太麻烦，我们直接在 CustomList 里处理 props
  // 实际上，Antd 的 filterDropdown 接收的 selectedKeys 是一个数组。
  // 我们可以只用 selectedKeys[0] 来存储 "min,max" 字符串。

  // 处理分享点击
  const handleShare = (record: CustomResource) => {
    setSharingCustom(record);
    setShareSelectorVisible(true);
  };

  // 处理图片选择完成
  const handleShareImageSelect = (imageUrl: string) => {
    setSelectedShareImage(imageUrl);
    setShareSelectorVisible(false);
    setShareCropperVisible(true);
  };

  // 处理裁切完成
  const handleShareImageCrop = async (blob: Blob) => {
    setShareCropperVisible(false);
    
    if (sharingCustom) {
      // 辅助函数：计算资产等级
      const getAssetLevel = (val: number | undefined, prefix: string) => {
        if (val === undefined || val === null) return '-';
        // 假设单位为万
        if (val < 100) return `${prefix}6`;
        if (val < 1000) return `${prefix}7`;
        if (val < 10000) return `${prefix}8`;
        return `${prefix}9`;
      };

      // 准备分享数据
      const shareData: ShareData = {
        imageBlob: blob,
        tags: {
          assets: getAssetLevel(sharingCustom.assets, 'A'),
          liquidAssets: getAssetLevel(sharingCustom.current_assets, 'C'),
          income: sharingCustom.income ? `${sharingCustom.income}万` : '-'
        },
        basicInfo: {
          age: calculateAge(sharingCustom.birth) === '未知' ? '-' : `${calculateAge(sharingCustom.birth)}岁`,
          height: sharingCustom.height ? `${sharingCustom.height}cm` : '-',
          degree: sharingCustom.degree || '-'
        },
        details: {
          city: sharingCustom.live_city || '-',
          isSingleChild: sharingCustom.is_single_child === undefined ? '-' : (sharingCustom.is_single_child ? '是' : '否'),
          houseCar: [sharingCustom.house, sharingCustom.car].filter(Boolean).join('; ') || '-'
        },
        introduction: sharingCustom.introductions 
          ? Object.entries(sharingCustom.introductions).map(([k, v]) => `${k}: ${v}`).join('; ')
          : '-',
        matchmaker: {
          orgName: 'IF.U',
          name: user?.nickname || '红娘'
        }
      };

      try {
        const resultUrl = await generateShareImage(shareData);
        setGeneratedShareImage(resultUrl);
        setShareResultVisible(true);
      } catch (error) {
        message.error('生成图片失败');
        console.error(error);
      }
    }
  };

  // 编辑客户
  const handleEdit = (record: CustomResource) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  // 渲染图片图标（仿 ResourceList 逻辑）
  const renderPictureIcon = (images?: string[]) => {
    const hasCover = images && images.length > 0 && images[0];
    return (
      <PictureOutlined 
        style={{ 
          color: hasCover ? '#1677ff' : '#9ca3af',
          cursor: hasCover ? 'pointer' : 'default',
          fontSize: 16,
        }}
        onClick={hasCover ? (e) => {
          e.stopPropagation();
          setCurrentImages(images || []);
          setInitialImageIndex(0);
          setImageModalVisible(true);
        } : undefined}
      />
    );
  };

  // 渲染性别图标
  const renderGender = (gender: string) => {
    if (gender === '男') return <ManOutlined style={{ color: '#1890ff' }} />;
    if (gender === '女') return <WomanOutlined style={{ color: '#eb2f96' }} />;
    return <UserOutlined />;
  };

  // 移动端姓名列渲染
  const renderMobileName = (text: string, record: CustomResource) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
        <span style={{ fontWeight: 600 }}>{text}</span>
        <span style={{ color: '#888' }}>
          {renderGender(record.gender)}
        </span>
      </div>
      {renderPictureIcon(record.images)}
    </div>
  );

  // PC端姓名列渲染
  const renderPCName = (text: string, record: CustomResource) => (
    <Space>
      <span style={{ fontWeight: 600 }}>{text}</span>
      {renderPictureIcon(record.images)}
    </Space>
  );

  // 表格列定义
  const columns: ColumnsType<CustomResource> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120, // 固定宽度
      ellipsis: true,
      render: screens.xs ? renderMobileName : renderPCName,
      // 移动端在姓名列增加性别筛选
      ...(screens.xs ? {
        filters: [
          { text: '男', value: '男' },
          { text: '女', value: '女' },
        ],
        onFilter: (value: React.Key | boolean, record: CustomResource) => record.gender === value,
      } : {}),
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      hidden: !screens.md,
      render: (text: string) => {
        const color = text === '男' ? 'blue' : text === '女' ? 'magenta' : 'default';
        return <Tag color={color}>{text}</Tag>;
      },
      // PC端在性别列增加筛选
      filters: [
        { text: '男', value: '男' },
        { text: '女', value: '女' },
      ],
      onFilter: (value: React.Key | boolean, record: CustomResource) => record.gender === value,
    },
    {
      title: '年龄',
      dataIndex: 'birth',
      key: 'age',
      width: 100,
      render: (birth: number) => calculateAge(birth),
      filterDropdown: (props) => (
        <NumberRangeFilterDropdown 
          {...props} 
          clearFilters={() => props.clearFilters?.()} 
        />
      ),
      onFilter: ageOnFilter,
      sorter: (a, b) => {
        const ageA = typeof calculateAge(a.birth) === 'number' ? calculateAge(a.birth) as number : -1;
        const ageB = typeof calculateAge(b.birth) === 'number' ? calculateAge(b.birth) as number : -1;
        return ageA - ageB;
      },
    },
    {
      title: '身高',
      dataIndex: 'height',
      key: 'height',
      width: 80,
      hidden: !screens.xl,
      render: (val: number) => val ? `${val}cm` : '-',
      filterDropdown: (props) => (
        <NumberRangeFilterDropdown 
          {...props} 
          clearFilters={() => props.clearFilters?.()} 
        />
      ),
      onFilter: heightOnFilter, // 复用数字范围筛选逻辑
      sorter: (a: CustomResource, b: CustomResource) => (a.height || 0) - (b.height || 0),
    },
    {
      title: '常住城市',
      dataIndex: 'live_city',
      key: 'live_city',
      width: 120,
      ellipsis: true,
      hidden: !screens.lg,
      render: (val: string) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: screens.xs ? 60 : 140, // 增加宽度以容纳分享按钮
      render: (_, record) => {
        // PC 端直接显示按钮
        if (!screens.xs) {
          return (
            <Space size="small">
              <Button 
                type="text" 
                icon={<ShareAltOutlined />} 
                onClick={() => handleShare(record)}
                title="分享"
              />
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)} 
              />
              <Popconfirm
                title="确定要删除吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          );
        }

        // 移动端显示更多菜单
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'share',
                  label: '分享',
                  icon: <ShareAltOutlined />,
                  onClick: () => handleShare(record),
                },
                {
                  key: 'edit',
                  label: '编辑',
                  icon: <EditOutlined />,
                  onClick: () => handleEdit(record),
                },
                {
                  key: 'delete',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: '确定要删除吗？',
                      content: '删除后无法恢复',
                      okText: '确定',
                      cancelText: '取消',
                      okButtonProps: { danger: true },
                      onOk: () => handleDelete(record.id),
                    });
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // 展开行渲染
  const expandedRowRender = (record: CustomResource) => {
    return (
      <div style={{ padding: '0 24px', backgroundColor: '#fafafa' }}>
        <Descriptions title="基础信息" bordered size="small" column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}>
          <Descriptions.Item label="身高">{record.height ? `${record.height}cm` : '-'}</Descriptions.Item>
          <Descriptions.Item label="体重">{record.weight ? `${record.weight}kg` : '-'}</Descriptions.Item>
          <Descriptions.Item label="电话">{record.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{record.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="婚姻状况">{record.marital || '-'}</Descriptions.Item>
        </Descriptions>
        
        <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />
        
        <Descriptions title="学历工作" bordered size="small" column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}>
          <Descriptions.Item label="学位">{record.degree || '-'}</Descriptions.Item>
          <Descriptions.Item label="学校">{record.academy || '-'}</Descriptions.Item>
          <Descriptions.Item label="职业">{record.occupation || '-'}</Descriptions.Item>
          <Descriptions.Item label="收入">{record.income ? `${record.income}万` : '-'}</Descriptions.Item>
          <Descriptions.Item label="资产">{record.assets ? `${record.assets}万` : '-'}</Descriptions.Item>
          <Descriptions.Item label="流动资产">{record.current_assets ? `${record.current_assets}万` : '-'}</Descriptions.Item>
          <Descriptions.Item label="房产情况">{record.house || '-'}</Descriptions.Item>
          <Descriptions.Item label="汽车情况">{record.car || '-'}</Descriptions.Item>
        </Descriptions>

        <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />

        <Descriptions title="所在城市" bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="户籍城市">{record.registered_city || '-'}</Descriptions.Item>
          <Descriptions.Item label="常住城市">{record.live_city || '-'}</Descriptions.Item>
          <Descriptions.Item label="籍贯城市">{record.native_place || '-'}</Descriptions.Item>
        </Descriptions>

        <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />

        <Descriptions title="原生家庭" bordered size="small" column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}>
          <Descriptions.Item label="独生子女">{record.is_single_child ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="家庭情况">{record.original_family || '-'}</Descriptions.Item>
        </Descriptions>

        <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />

        <Descriptions title="其他信息" bordered size="small" column={1}>
          {record.introductions && Object.entries(record.introductions).map(([key, value]) => (
            <Descriptions.Item label={key} key={key}>{value}</Descriptions.Item>
          ))}
        </Descriptions>

        <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />

        <Descriptions title="择偶要求" bordered size="small" column={1}>
          <Descriptions.Item label="要求内容">
            <div style={{ whiteSpace: 'pre-wrap' }}>{record.match_requirement || '-'}</div>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />

        <Descriptions title="管理信息" bordered size="small" column={1}>
          <Descriptions.Item label="客户等级">{record.custom_level || '-'}</Descriptions.Item>
          <Descriptions.Item label="是否公开">{record.is_public ? '是' : '否'}</Descriptions.Item>
          {record.comments && Object.entries(record.comments).map(([key, value]) => (
            <Descriptions.Item label={key} key={`comment-${key}`}>{value}</Descriptions.Item>
          ))}
        </Descriptions>
      </div>
    );
  };

  return (
    <Content className="main-content">
      <div className="content-body">
        <Typography.Title level={4} style={{ marginBottom: 16 }}>客户列表</Typography.Title>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          expandable={{ expandedRowRender }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* 分享流程 Modals */}
      <ImageSelectorModal
        visible={shareSelectorVisible}
        images={sharingCustom?.images || []}
        onCancel={() => setShareSelectorVisible(false)}
        onSelect={handleShareImageSelect}
      />
      
      <ImageCropperModal
        visible={shareCropperVisible}
        imageUrl={selectedShareImage}
        onCancel={() => setShareCropperVisible(false)}
        onConfirm={handleShareImageCrop}
      />

      <Modal
        title="分享图片生成结果"
        open={shareResultVisible}
        onCancel={() => setShareResultVisible(false)}
        footer={[
          <Button key="close" onClick={() => setShareResultVisible(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={async () => {
              try {
                const response = await fetch(generatedShareImage);
                const blob = await response.blob();
                await navigator.clipboard.write([
                  new ClipboardItem({
                    [blob.type]: blob,
                  }),
                ]);
                message.success('图片已复制到剪切板');
              } catch (err) {
                console.error('复制失败:', err);
                message.error('复制失败，请尝试下载');
              }
            }}
          >
            复制图片
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              const link = document.createElement('a');
              link.download = `share-${sharingCustom?.name || 'custom'}.png`;
              link.href = generatedShareImage;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            下载图片
          </Button>
        ]}
        width={screens.lg ? 1000 : screens.md ? 700 : '95%'}
        destroyOnHidden={true}
        maskClosable={false}
        centered
      >
        <div style={{ display: 'flex', justifyContent: 'center', background: '#f0f2f5', padding: '16px' }}>
          {generatedShareImage && (
            <img 
              src={generatedShareImage} 
              alt="Generated Share" 
              style={{ maxWidth: '100%', maxHeight: '80vh', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} 
            />
          )}
        </div>
      </Modal>

      {/* 编辑模态框 */}
      <Modal
        title="编辑客户信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => {
          editFormRef.current?.submit();
        }}
        width={800}
        destroyOnHidden={true}
        maskClosable={false}
      >
        <CustomForm 
          initialData={editingRecord || undefined} 
          hideSubmitButton 
          onFormReady={(form) => { editFormRef.current = form; }}
          onSuccess={() => {
            setEditModalVisible(false);
            fetchData();
          }}
        />
      </Modal>

      <ImageModal
        visible={imageModalVisible}
        images={currentImages}
        initialIndex={initialImageIndex}
        onClose={() => setImageModalVisible(false)}
      />
    </Content>
  );
};

export default CustomList;
