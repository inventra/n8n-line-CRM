import React, { useState } from 'react';
import { Modal, Button, Steps, Alert, Typography, Space, Progress, message, Form, Input, Card, Divider } from 'antd';
import { DatabaseOutlined, CheckCircleOutlined, LoadingOutlined, CopyOutlined } from '@ant-design/icons';
import { initializeDatabase, checkDatabaseInitialized } from '../utils/databaseInit';

const { Title, Text } = Typography;
const { Step } = Steps;

const DatabaseInitModal = ({ visible, onClose, onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('wait');
  const [form] = Form.useForm();
  const [connectionString, setConnectionString] = useState('');

  const steps = [
    {
      title: '檢查資料庫',
      description: '檢查資料庫是否已初始化',
    },
    {
      title: '填寫連接資訊',
      description: '填寫 PostgreSQL 連接資訊',
    },
    {
      title: '執行初始化',
      description: '執行資料庫初始化腳本',
    },
    {
      title: '完成初始化',
      description: '資料庫初始化完成',
    },
  ];

  const handleInit = async () => {
    try {
      setLoading(true);
      setStatus('process');
      
      // 步驟 1: 檢查資料庫
      setCurrent(0);
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isInitialized = await checkDatabaseInitialized();
      if (isInitialized) {
        message.info('資料庫已經初始化過了');
        onSuccess();
        return;
      }
      
      // 步驟 2: 填寫連接資訊
      setCurrent(1);
      setProgress(50);
      
      // 等待用戶填寫連接資訊
      return;
      
    } catch (error) {
      console.error('初始化失敗:', error);
      setStatus('error');
      message.error('資料庫初始化失敗，請檢查連接設定');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteInit = async () => {
    try {
      setLoading(true);
      setStatus('process');
      
      // 步驟 3: 執行初始化
      setCurrent(2);
      setProgress(75);
      
      const result = await initializeDatabase();
      
      if (result.success) {
        setCurrent(3);
        setProgress(100);
        setStatus('finish');
        message.success('資料庫初始化完成！');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setStatus('error');
        message.error(result.message || '資料庫初始化失敗');
      }
      
    } catch (error) {
      console.error('初始化失敗:', error);
      setStatus('error');
      message.error('資料庫初始化失敗，請檢查連接設定');
    } finally {
      setLoading(false);
    }
  };

  const generateConnectionString = (values) => {
    const { host, port, database, username, password } = values;
    const connStr = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    setConnectionString(connStr);
    return connStr;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已複製到剪貼板');
    });
  };

  const handleClose = () => {
    if (status === 'finish') {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          <span>資料庫初始化</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        status === 'finish' ? (
          <Button key="enter" type="primary" onClick={onSuccess}>
            進入儀表板
          </Button>
        ) : current === 1 ? (
          <>
            <Button key="cancel" onClick={handleClose}>
              取消
            </Button>
            <Button
              key="execute"
              type="primary"
              loading={loading}
              onClick={handleExecuteInit}
              disabled={!connectionString}
            >
              執行初始化
            </Button>
          </>
        ) : (
          <>
            <Button key="cancel" onClick={handleClose}>
              取消
            </Button>
            <Button
              key="init"
              type="primary"
              loading={loading}
              onClick={handleInit}
              disabled={status === 'finish'}
            >
              {status === 'finish' ? '完成' : '開始初始化'}
            </Button>
          </>
        ),
      ]}
      width={600}
      closable={status !== 'process'}
    >
      <div style={{ marginBottom: 24 }}>
        <Alert
          message="首次使用系統"
          description="檢測到這是首次使用系統，需要初始化資料庫結構。這將建立所有必要的資料表、索引和初始數據。"
          type="info"
          showIcon
        />
      </div>

      <Steps
        current={current}
        status={status}
        direction="vertical"
        size="small"
      >
        {steps.map((item, index) => (
          <Step
            key={index}
            title={item.title}
            description={item.description}
            icon={
              index < current ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : index === current ? (
                <LoadingOutlined />
              ) : null
            }
          />
        ))}
      </Steps>

      {current === 1 && (
        <div style={{ marginTop: 24 }}>
          <Card title="PostgreSQL 連接資訊" size="small">
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(changedValues, allValues) => {
                if (allValues.host && allValues.port && allValues.database && allValues.username && allValues.password) {
                  generateConnectionString(allValues);
                }
              }}
            >
              <Form.Item
                label="主機地址"
                name="host"
                rules={[{ required: true, message: '請輸入主機地址' }]}
              >
                <Input placeholder="例如: tpe1.clusters.zeabur.com" />
              </Form.Item>
              
              <Form.Item
                label="端口"
                name="port"
                rules={[{ required: true, message: '請輸入端口' }]}
              >
                <Input placeholder="例如: 20827" />
              </Form.Item>
              
              <Form.Item
                label="資料庫名稱"
                name="database"
                rules={[{ required: true, message: '請輸入資料庫名稱' }]}
              >
                <Input placeholder="例如: zeabur" />
              </Form.Item>
              
              <Form.Item
                label="用戶名"
                name="username"
                rules={[{ required: true, message: '請輸入用戶名' }]}
              >
                <Input placeholder="例如: root" />
              </Form.Item>
              
              <Form.Item
                label="密碼"
                name="password"
                rules={[{ required: true, message: '請輸入密碼' }]}
              >
                <Input.Password placeholder="請輸入密碼" />
              </Form.Item>
            </Form>
            
            {connectionString && (
              <div style={{ marginTop: 16 }}>
                <Text strong>連接字串：</Text>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  marginTop: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {connectionString}
                </div>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(connectionString)}
                  style={{ marginTop: '8px' }}
                >
                  複製連接字串
                </Button>
              </div>
            )}
          </Card>
          
          <Divider />
          
          <Alert
            message="手動初始化步驟"
            description={
              <div>
                <p>請在終端機中執行以下命令來初始化資料庫：</p>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  psql "{connectionString || 'postgresql://用戶名:密碼@主機:端口/資料庫'}" -f database/init.sql
                </div>
                <p style={{ marginTop: '8px', color: '#666' }}>
                  執行完成後，請點擊「執行初始化」按鈕繼續。
                </p>
              </div>
            }
            type="warning"
            showIcon
          />
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 24 }}>
          <Progress
            percent={progress}
            status={status === 'error' ? 'exception' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      )}

      {status === 'finish' && (
        <Alert
          message="初始化完成"
          description="資料庫已成功初始化，系統現在可以正常使用了。"
          type="success"
          showIcon
          style={{ marginTop: 24 }}
        />
      )}

      {status === 'error' && (
        <Alert
          message="初始化失敗"
          description="資料庫初始化過程中發生錯誤，請檢查系統設定中的 API 連接配置。"
          type="error"
          showIcon
          style={{ marginTop: 24 }}
        />
      )}
    </Modal>
  );
};

export default DatabaseInitModal;
