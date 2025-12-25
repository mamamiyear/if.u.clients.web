import React, { useState, useRef, useEffect } from 'react';
import { Descriptions, Typography, Input, Button, message, Tabs } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import type { Custom, Comment } from '../apis/types';
import { addCustomComment, getCustomComments, updateCustomComment, deleteCustomComment } from '../apis/custom';
import CommentBubble from './CommentBubble';

// 扩展 Custom 类型以确保 id 存在
type CustomResource = Custom & { id: string };

interface ExpandedRowProps {
  record: CustomResource;
  currentUserId?: string;
  onDataUpdate?: (updatedRecord: CustomResource) => void;
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({ record, currentUserId, onDataUpdate }) => {
  // 评论相关状态
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<Comment[]>(record.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsListRef = useRef<HTMLDivElement>(null);
  const [activeTabKey, setActiveTabKey] = useState('info');

  // 评论列表更新或显示时滚动到底部
  useEffect(() => {
    if (activeTabKey === 'manage' && commentsListRef.current) {
      // 使用 setTimeout 确保 DOM 渲染完成后再滚动
      setTimeout(() => {
        if (commentsListRef.current) {
          commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [comments, activeTabKey]); 

  // 刷新评论列表
  const refreshComments = async () => {
    try {
      const res = await getCustomComments(record.id);
      if (res.error_code === 0 && res.data) {
        setComments(res.data);
        // 通知父组件更新数据
        if (onDataUpdate) {
          onDataUpdate({ ...record, comments: res.data });
        }
      } else {
        message.error(res.error_info || '刷新评论失败');
      }
    } catch (error) {
      console.error('刷新评论失败:', error);
    }
  };

  // 发送评论
  const handleSendComment = async () => {
    if (!commentContent.trim()) {
      return;
    }
    
    setSubmittingComment(true);
    try {
      const res = await addCustomComment(record.id, commentContent.trim());
      if (res.error_code === 0) {
        message.success('评论发表成功');
        setCommentContent('');
        refreshComments();
      } else {
        message.error(res.error_info || '评论发表失败');
      }
    } catch (error) {
      console.error('评论发表失败:', error);
      message.error('评论发表失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 更新评论
  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const res = await updateCustomComment(record.id, commentId, content);
      if (res.error_code === 0) {
        message.success('评论更新成功');
        refreshComments();
      } else {
        message.error(res.error_info || '评论更新失败');
      }
    } catch (error) {
      console.error('评论更新失败:', error);
      message.error('评论更新失败');
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await deleteCustomComment(record.id, commentId);
      if (res.error_code === 0) {
        message.success('评论删除成功');
        refreshComments();
      } else {
        message.error(res.error_info || '评论删除失败');
      }
    } catch (error) {
      console.error('评论删除失败:', error);
      message.error('评论删除失败');
    }
  };

  const infoTab = (
    <>
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
    </>
  );

  const manageTab = (
    <>
      <Descriptions title="管理信息" bordered size="small" column={1}>
        <Descriptions.Item label="客户等级">{record.custom_level || '-'}</Descriptions.Item>
        <Descriptions.Item label="是否公开">{record.is_public ? '是' : '否'}</Descriptions.Item>
      </Descriptions>
      
      <div style={{ margin: '16px 0', borderBottom: '1px solid #f0f0f0' }} />

      <div style={{ padding: '0 8px' }}>
          <Descriptions title="客户评论" bordered size="small" column={1} />
          
          <div 
            ref={commentsListRef}
            style={{ 
              marginTop: 16,
              marginBottom: 16,
              maxHeight: 400, 
              overflowY: 'auto',
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px'
            }}
          >
            {comments && comments.length > 0 ? (
            comments.map(comment => (
              <CommentBubble 
                key={comment.id} 
                comment={comment} 
                currentUserId={currentUserId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))
          ) : (
             <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '20px 0' }}>
               暂无评论
             </Typography.Text>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Input.TextArea 
              placeholder="写下你的评论..." 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onPressEnter={(e) => {
                // Shift + Enter 换行，Enter 发送
                if (e.shiftKey) return;
                
                // 防止中文输入法回车触发
                if (e.nativeEvent.isComposing) return;
                
                e.preventDefault(); // 阻止默认换行行为
                handleSendComment();
              }}
              disabled={submittingComment}
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ fontSize: 16 }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSendComment}
              loading={submittingComment}
              disabled={!commentContent.trim()}
            />
          </div>
      </div>
    </>
  );

  const items = [
    {
      key: 'info',
      label: '客户信息',
      children: infoTab,
    },
    {
      key: 'manage',
      label: '客户管理',
      children: manageTab,
    },
  ];

  return (
    <div style={{ padding: '0 24px', backgroundColor: '#fafafa' }}>
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={items} />
    </div>
  );
};

export default ExpandedRow;
