import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import type { User } from '../apis/types';

interface UserAvatarProps {
  user: User;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 40, className, style, onClick }) => {
  const logoSize = size * 0.4;

  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative', 
        width: size, 
        height: size, 
        cursor: onClick ? 'pointer' : 'default',
        ...style 
      }}
      onClick={onClick}
    >
      <div 
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {user.avatar_link ? (
          <img 
            src={user.avatar_link} 
            alt="avatar" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <UserOutlined style={{ fontSize: size * 0.5, color: '#999' }} />
        )}
      </div>

      {user.organization?.logo && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: logoSize,
            height: logoSize,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            boxShadow: '0 0 0 1px #fff'
          }}
        >
          <img 
            src={user.organization.logo} 
            alt="org logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
