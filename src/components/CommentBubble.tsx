import React, { useEffect, useState } from 'react';
import { Avatar, Typography, message, Spin, Dropdown, Modal, Input } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, MoreOutlined, CopyOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUserById } from '../apis/user';
import type { Comment } from '../apis/types';
import { getCachedResource } from '../utils/staticResourceCache';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CommentBubbleProps {
  comment: Comment;
  currentUserId?: string;
  onUpdate?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
}

const CommentBubble: React.FC<CommentBubbleProps> = ({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
}) => {
  const [userInfo, setUserInfo] = useState<{ nickname: string; avatar_link: string } | null>(null);
  const [cachedAvatar, setCachedAvatar] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // 修改相关状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await getUserById(comment.user_id);
        if (res.error_code === 0 && res.data) {
          const avatarUrl = res.data.avatar_link || '';
          
          setUserInfo({
            nickname: res.data.nickname,
            avatar_link: avatarUrl,
          });

          // 如果有头像链接，尝试获取缓存的静态资源
          if (avatarUrl) {
            getCachedResource(avatarUrl).then(setCachedAvatar);
          }
        }
      } catch (error) {
        console.error('获取用户信息失败', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [comment.user_id]);

  const isSelf = currentUserId === comment.user_id;

  // 复制功能
  const handleCopy = () => {
    navigator.clipboard.writeText(comment.content).then(() => {
      message.success('已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  // 修改功能
  const handleEditClick = () => {
    setEditContent(comment.content);
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) {
      message.warning('评论内容不能为空');
      return;
    }

    if (onUpdate) {
      setUpdating(true);
      try {
        await onUpdate(comment.id, editContent);
        setIsEditModalVisible(false);
      } catch (error) {
        // 错误处理由父组件或 API 层处理，这里主要是关闭 loading
      } finally {
        setUpdating(false);
      }
    }
  };

  // 删除功能
  const handleDeleteClick = () => {
    Modal.confirm({
      title: '确认删除吗？',
      content: '删除后无法恢复',
      onOk: async () => {
        if (onDelete) {
          await onDelete(comment.id);
        }
      },
    });
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'copy',
      label: '复制',
      icon: <CopyOutlined />,
      onClick: handleCopy,
    },
    ...(isSelf ? [
      {
        key: 'edit',
        label: '修改',
        icon: <EditOutlined />,
        onClick: handleEditClick,
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleDeleteClick,
      }
    ] : [])
  ];

  return (
    <div 
      style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}
    >
      {/* 头像 */}
      <Avatar
        src={cachedAvatar || undefined}
        icon={<UserOutlined />}
        size={40}
        style={{ flexShrink: 0, marginRight: 12 }}
      />

      {/* 气泡主体 */}
      <div style={{ flex: 1, maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* 昵称 */}
        <div style={{ marginBottom: 4 }}>
          {loading ? (
            <Spin size="small" />
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {userInfo?.nickname || '未知用户'}
            </Text>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* 气泡内容 */}
          <div
            style={{
              backgroundColor: isSelf ? '#e6f7ff' : '#f0f2f5',
              padding: '8px 12px',
              borderRadius: '0 12px 12px 12px',
              position: 'relative',
              minWidth: 100,
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {comment.content}
            </div>
            
            {/* 时间信息 */}
            <div style={{ marginTop: 4, fontSize: 10, color: '#999', textAlign: 'right' }}>
              {dayjs.unix(comment.created_at).format('YYYY-MM-DD HH:mm')}
              {comment.updated_at > comment.created_at && (
                <span style={{ marginLeft: 8 }}>
                  (已编辑 {dayjs.unix(comment.updated_at).format('MM-DD HH:mm')})
                </span>
              )}
            </div>
          </div>

            {/* 操作按钮 */}
            <div style={{ marginLeft: 8 }}>
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <MoreOutlined 
                  style={{ 
                    fontSize: 18, 
                    cursor: 'pointer', 
                    color: '#999',
                    padding: '4px'
                  }} 
                />
              </Dropdown>
            </div>
        </div>
      </div>

      {/* 修改评论 Modal */}
      <Modal
        title="修改评论"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        confirmLoading={updating}
      >
        <Input.TextArea
          rows={4}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="请输入评论内容"
        />
      </Modal>
    </div>
  );
};

export default CommentBubble;
