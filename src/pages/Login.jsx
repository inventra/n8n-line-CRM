import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Alert, Spin, Modal, Form, Input, message } from 'antd';
import { LineOutlined, LoginOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // LINE 登入配置
  const [lineConfig, setLineConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/login`
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    // 載入已保存的設定
    loadSavedConfig();
    
    // 檢查 URL 參數中是否有 LINE 授權碼
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    console.log('LINE 回調檢查:', { code, state });

    if (code && state === 'line_crm') {
      console.log('開始處理 LINE 登入回調');
      handleLineCallback(code);
    }
  }, []);

  const loadSavedConfig = async () => {
    try {
      // 先從本地存儲載入
      const savedConfig = localStorage.getItem('line_crm_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setLineConfig(config);
        console.log('已載入本地設定:', config);
      }

      // 如果有 Backend API，也從資料庫載入
      if (import.meta.env.VITE_BACKEND_URL) {
        await loadConfigFromDatabase();
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
    }
  };

  const loadConfigFromDatabase = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-settings`);
      if (response.ok) {
        const settings = await response.json();
        const config = {};
        
        settings.forEach(setting => {
          if (setting.key === 'LINE_CHANNEL_ACCESS_TOKEN') {
            config.clientId = setting.value;
          } else if (setting.key === 'LINE_CHANNEL_SECRET') {
            config.clientSecret = setting.value;
          }
        });

        if (config.clientId || config.clientSecret) {
          setLineConfig(prev => ({
            ...prev,
            ...config
          }));
          console.log('已載入資料庫設定:', config);
        }
      }
    } catch (error) {
      console.error('從資料庫載入設定失敗:', error);
    }
  };

  const handleLineCallback = async (code) => {
    setLoading(true);
    console.log('處理 LINE 登入回調，授權碼:', code);
    
    const success = await login(code);
    console.log('登入結果:', success);
    
    if (success) {
      console.log('登入成功，重定向到儀表板');
      // 登入成功，重定向到儀表板
      window.location.href = '/';
    } else {
      console.log('登入失敗，清除 URL 參數');
      // 清除 URL 參數
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setLoading(false);
  };

  const handleLineLogin = () => {
    if (!lineConfig.clientId) {
      setShowConfigModal(true);
      return;
    }
    
    const LINE_AUTH_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineConfig.clientId}&redirect_uri=${encodeURIComponent(lineConfig.redirectUri)}&state=line_crm&scope=profile%20openid`;
    window.location.href = LINE_AUTH_URL;
  };

  const handleConfigSave = async (values) => {
    try {
      // 保存到本地存儲
      localStorage.setItem('line_crm_config', JSON.stringify({
        ...lineConfig,
        ...values
      }));
      
      setLineConfig({
        ...lineConfig,
        ...values
      });
      setShowConfigModal(false);
      message.success('LINE 憑證設定成功！');
      
      // 如果有 Backend API，也保存到資料庫
      if (import.meta.env.VITE_BACKEND_URL) {
        await saveConfigToDatabase(values);
      }
    } catch (error) {
      console.error('保存設定失敗:', error);
      message.error('保存設定失敗');
    }
  };

  const saveConfigToDatabase = async (values) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-settings/LINE_CHANNEL_ACCESS_TOKEN`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: values.clientId
        }),
      });

      if (response.ok) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-settings/LINE_CHANNEL_SECRET`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: values.clientSecret
          }),
        });
      }
    } catch (error) {
      console.error('保存到資料庫失敗:', error);
    }
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Card style={{
        maxWidth: 500,
        width: '100%',
      }}>
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

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
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

          <Button
            type="default"
            size="large"
            icon={<SettingOutlined />}
            onClick={() => setShowConfigModal(true)}
            style={{ 
              width: '100%', 
              height: 48,
              fontSize: 16,
            }}
            block
          >
            {lineConfig.clientId ? '更新 LINE 憑證' : '設定 LINE 憑證'}
          </Button>

          {lineConfig.clientId && (
            <Alert
              message="憑證已設定"
              description={`已設定 LINE Client ID: ${lineConfig.clientId.substring(0, 8)}...`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Space>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            登入即表示您同意我們的服務條款和隱私政策
          </Text>
        </div>
      </Card>

      {/* LINE 憑證設定模態框 */}
      <Modal
        title="LINE 憑證設定"
        open={showConfigModal}
        onCancel={() => setShowConfigModal(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleConfigSave}
          initialValues={lineConfig}
        >
          <Form.Item
            name="clientId"
            label="LINE Client ID"
            rules={[{ required: true, message: '請輸入 LINE Client ID' }]}
          >
            <Input placeholder="請輸入 LINE Client ID" />
          </Form.Item>

          <Form.Item
            name="clientSecret"
            label="LINE Client Secret"
            rules={[{ required: true, message: '請輸入 LINE Client Secret' }]}
          >
            <Input.Password placeholder="請輸入 LINE Client Secret" />
          </Form.Item>

          <Form.Item
            name="redirectUri"
            label="Callback URL"
            tooltip="此 URL 將自動設定，通常不需要修改"
          >
            <Input disabled />
          </Form.Item>

          <Alert
            message="設定說明"
            description={
              <div>
                <p>1. 請到 <a href="https://developers.line.biz/" target="_blank" rel="noopener noreferrer">LINE Developers Console</a> 建立應用程式</p>
                <p>2. 在應用程式設定中，將 Callback URL 設定為：<code>{lineConfig.redirectUri}</code></p>
                <p>3. 複製 Client ID 和 Client Secret 到此表單</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowConfigModal(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存設定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
