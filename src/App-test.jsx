import React from 'react';
import { ConfigProvider, theme } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { Button, Card, Typography, Space } from 'antd';
import { UserOutlined, TeamOutlined, MessageOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons';
import './App.css';

const { Title, Text } = Typography;

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
          maxWidth: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 16 }}>
              LINE CRM 系統
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              完整的 LINE 客戶關係管理系統
            </Text>
          </div>

          <div style={{ marginBottom: 32 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>用戶管理</div>
                  <div style={{ fontSize: 14, color: '#666' }}>管理 LINE 用戶和標籤</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <TeamOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>群組管理</div>
                  <div style={{ fontSize: 14, color: '#666' }}>管理 LINE 群組和成員</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MessageOutlined style={{ fontSize: 20, color: '#faad14' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>訊息管理</div>
                  <div style={{ fontSize: 14, color: '#666' }}>查看和管理所有訊息</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BarChartOutlined style={{ fontSize: 20, color: '#f5222d' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>數據分析</div>
                  <div style={{ fontSize: 14, color: '#666' }}>詳細的統計和圖表</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SettingOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>系統設定</div>
                  <div style={{ fontSize: 14, color: '#666' }}>LINE Bot 憑證和配置</div>
                </div>
              </div>
            </Space>
          </div>

          <Button type="primary" size="large" style={{ width: '100%', height: 48 }}>
            開始使用 LINE CRM
          </Button>
        </Card>
      </div>
    </ConfigProvider>
  );
}

export default App;
