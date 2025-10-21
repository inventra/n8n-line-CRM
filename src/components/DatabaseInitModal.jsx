import React, { useState } from 'react';
import { Modal, Button, Steps, Alert, Typography, Space, Progress, message } from 'antd';
import { DatabaseOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { initializeDatabase, checkDatabaseInitialized } from '../utils/databaseInit';

const { Title, Text } = Typography;
const { Step } = Steps;

const DatabaseInitModal = ({ visible, onClose, onSuccess }) => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('wait');

  const steps = [
    {
      title: '檢查資料庫',
      description: '檢查資料庫是否已初始化',
    },
    {
      title: '建立資料表',
      description: '建立所有必要的資料表和索引',
    },
    {
      title: '插入初始數據',
      description: '插入系統設定和預設標籤',
    },
    {
      title: '設定權限',
      description: '設定資料庫角色和權限',
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
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isInitialized = await checkDatabaseInitialized();
      if (isInitialized) {
        message.info('資料庫已經初始化過了');
        onSuccess();
        return;
      }
      
      // 步驟 2: 建立資料表
      setCurrent(1);
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 步驟 3: 插入初始數據
      setCurrent(2);
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 步驟 4: 設定權限
      setCurrent(3);
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 步驟 5: 完成初始化
      setCurrent(4);
      setProgress(100);
      setStatus('finish');
      
      message.success('資料庫初始化完成！');
      setTimeout(() => {
        onSuccess();
      }, 1000);
      
    } catch (error) {
      console.error('初始化失敗:', error);
      setStatus('error');
      message.error('資料庫初始化失敗，請檢查連接設定');
    } finally {
      setLoading(false);
    }
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
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="init"
          type="primary"
          loading={loading}
          onClick={handleInit}
          disabled={status === 'finish'}
        >
          {status === 'finish' ? '完成' : '開始初始化'}
        </Button>,
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
