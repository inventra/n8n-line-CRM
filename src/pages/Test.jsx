import React from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Test = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleTestLogin = () => {
    // 模擬登入
    const mockUser = {
      id: 'test_user_001',
      displayName: '測試用戶',
      pictureUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2NS42IDMxLjYgNTQgNDYgNTRINTRDNjguNCA1NCA4MCA2NS42IDgwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+',
      lineUserId: 'U' + Math.random().toString(36).substr(2, 9),
    };
    
    const mockToken = 'test_token_' + Date.now();
    
    localStorage.setItem('line_crm_token', mockToken);
    localStorage.setItem('line_crm_user', JSON.stringify(mockUser));
    
    window.location.reload();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <Card style={{ 
        width: '100%', 
        maxWidth: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        borderRadius: '12px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            系統測試頁面
          </Title>
          <Text type="secondary">
            測試 LINE CRM 系統功能
          </Text>
        </div>

        {isAuthenticated ? (
          <div>
            <Alert
              message="登入狀態"
              description="您已成功登入系統！"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: 24 }}
            />
            
            <Card style={{ marginBottom: 24 }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>用戶資訊：</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user?.displayName}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>ID: {user?.id}</div>
                  </div>
                </div>
              </Space>
            </Card>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button 
                type="primary" 
                size="large"
                onClick={() => window.location.href = '/'}
              >
                進入系統
              </Button>
              <Button 
                size="large"
                onClick={logout}
              >
                登出
              </Button>
            </Space>
          </div>
        ) : (
          <div>
            <Alert
              message="未登入狀態"
              description="您尚未登入系統"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button 
                type="primary" 
                size="large"
                onClick={handleTestLogin}
              >
                測試登入
              </Button>
              <Button 
                size="large"
                onClick={() => window.location.href = '/login'}
              >
                前往登入頁面
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Test;
