import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Typography, 
  Space, 
  Alert, 
  message, 
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
  Table,
} from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ExperimentOutlined,
  KeyOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬設定數據
      const mockSettings = {
        LINE_CHANNEL_ACCESS_TOKEN: '',
        LINE_CHANNEL_SECRET: '',
        SYSTEM_NAME: 'LINE CRM',
        VERSION: '1.0.0',
        MAINTENANCE_MODE: false,
        WEBHOOK_URL: '',
        N8N_WEBHOOK_URL: '',
      };
      
      setSettings(mockSettings);
      form.setFieldsValue(mockSettings);
    } catch (error) {
      console.error('獲取設定失敗:', error);
      message.error('獲取設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(values);
      message.success('設定保存成功');
    } catch (error) {
      console.error('保存設定失敗:', error);
      message.error('保存設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setIsTestModalVisible(true);
      
      // 模擬測試連接
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const testResults = [
        {
          key: '1',
          service: 'LINE Bot API',
          status: 'success',
          message: '連接成功',
          responseTime: '245ms',
        },
        {
          key: '2',
          service: 'PostgreSQL 資料庫',
          status: 'success',
          message: '連接成功',
          responseTime: '89ms',
        },
        {
          key: '3',
          service: 'PostgREST API',
          status: 'success',
          message: '連接成功',
          responseTime: '156ms',
        },
        {
          key: '4',
          service: 'n8n 工作流',
          status: 'warning',
          message: '連接成功，但工作流未配置',
          responseTime: '312ms',
        },
      ];
      
      setTestResult(testResults);
    } catch (error) {
      console.error('測試連接失敗:', error);
      message.error('測試連接失敗');
    } finally {
      setLoading(false);
    }
  };

  const testColumns = [
    {
      title: '服務',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'success' ? 'green' : 
          status === 'warning' ? 'orange' : 'red'
        }>
          {status === 'success' ? '成功' : 
           status === 'warning' ? '警告' : '失敗'}
        </Tag>
      ),
    },
    {
      title: '訊息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '響應時間',
      dataIndex: 'responseTime',
      key: 'responseTime',
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        系統設定
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="LINE Bot 設定" icon={<KeyOutlined />}>
            <Alert
              message="重要提醒"
              description="請確保您已在 LINE Developers Console 建立 Bot 並取得相關憑證。這些設定將用於 n8n 工作流處理 LINE 訊息。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              loading={loading}
            >
              <Form.Item
                name="LINE_CHANNEL_ACCESS_TOKEN"
                label="LINE Channel Access Token"
                rules={[
                  { required: true, message: '請輸入 LINE Channel Access Token' },
                  { min: 10, message: 'Token 長度不能少於10個字符' }
                ]}
              >
                <Input.Password 
                  placeholder="請輸入 LINE Channel Access Token"
                  addonBefore="Token"
                />
              </Form.Item>

              <Form.Item
                name="LINE_CHANNEL_SECRET"
                label="LINE Channel Secret"
                rules={[
                  { required: true, message: '請輸入 LINE Channel Secret' },
                  { min: 10, message: 'Secret 長度不能少於10個字符' }
                ]}
              >
                <Input.Password 
                  placeholder="請輸入 LINE Channel Secret"
                  addonBefore="Secret"
                />
              </Form.Item>

              <Form.Item
                name="WEBHOOK_URL"
                label="Webhook URL"
                tooltip="此 URL 將用於 LINE Bot 的 Webhook 設定"
              >
                <Input 
                  placeholder="https://your-n8n-domain.zeabur.app/webhook/line"
                  addonBefore="URL"
                />
              </Form.Item>

              <Divider />

              <Form.Item
                name="SYSTEM_NAME"
                label="系統名稱"
                rules={[{ required: true, message: '請輸入系統名稱' }]}
              >
                <Input placeholder="LINE CRM" />
              </Form.Item>

              <Form.Item
                name="MAINTENANCE_MODE"
                label="維護模式"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    保存設定
                  </Button>
                  <Button 
                    icon={<ExperimentOutlined />}
                    onClick={handleTestConnection}
                    loading={loading}
                  >
                    測試連接
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="系統資訊" icon={<InfoCircleOutlined />}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">系統版本</Text>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {settings.VERSION || '1.0.0'}
                </div>
              </div>
              <div>
                <Text type="secondary">系統狀態</Text>
                <div>
                  <Tag color={settings.MAINTENANCE_MODE ? 'red' : 'green'}>
                    {settings.MAINTENANCE_MODE ? '維護模式' : '正常運行'}
                  </Tag>
                </div>
              </div>
              <div>
                <Text type="secondary">最後更新</Text>
                <div style={{ fontSize: 14 }}>
                  {new Date().toLocaleString('zh-TW')}
                </div>
              </div>
            </Space>
          </Card>

          <Card title="快速統計" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="總用戶"
                  value={1247}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="總群組"
                  value={89}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="總訊息"
                  value={15632}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="今日訊息"
                  value={234}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        title="連接測試結果"
        open={isTestModalVisible}
        onCancel={() => setIsTestModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsTestModalVisible(false)}>
            關閉
          </Button>
        ]}
        width={600}
      >
        <Table
          columns={testColumns}
          dataSource={testResult}
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default Settings;
