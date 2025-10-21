import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, Spin } from 'antd';
import { LineOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // LINE 登入配置
  const LINE_CLIENT_ID = 'YOUR_LINE_CLIENT_ID'; // 需要從環境變數或設定中獲取
  const REDIRECT_URI = `${window.location.origin}/login`;
  const LINE_AUTH_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=line_crm&scope=profile%20openid`;

  useEffect(() => {
    // 檢查 URL 參數中是否有 LINE 授權碼
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state === 'line_crm') {
      handleLineCallback(code);
    }
  }, []);

  const handleLineCallback = async (code) => {
    setLoading(true);
    const success = await login(code);
    if (!success) {
      // 清除 URL 參數
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setLoading(false);
  };

  const handleLineLogin = () => {
    window.location.href = LINE_AUTH_URL;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LineOutlined style={{ fontSize: 48, color: '#00B900', marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            LINE CRM 系統
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            使用 LINE 帳號登入管理系統
          </Text>
        </div>

        <Alert
          message="系統說明"
          description="請使用您的 LINE 帳號登入系統。登入後您將能夠管理 LINE 用戶、群組和訊息，並查看詳細的數據分析。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          onClick={handleLineLogin}
          style={{ 
            width: '100%', 
            height: 48,
            fontSize: 16,
            background: '#00B900',
            borderColor: '#00B900',
          }}
          block
        >
          使用 LINE 登入
        </Button>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            登入即表示您同意我們的服務條款和隱私政策
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
