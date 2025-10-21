import React from 'react';
import { ConfigProvider, theme } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { Button, Card, Typography } from 'antd';
import './App.css';

const { Title } = Typography;

function App() {
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
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
          maxWidth: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 24 }}>
              LINE CRM 系統
            </Title>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
              歡迎使用 LINE CRM 管理系統
            </p>
            <Button type="primary" size="large" style={{ width: '100%' }}>
              開始使用
            </Button>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}

export default App;
