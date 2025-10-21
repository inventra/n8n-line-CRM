import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Typography, Spin } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  MessageOutlined, 
  RiseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalMessages: 0,
    todayMessages: 0,
    activeUsers: 0,
    newUsers: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [messageTypeData, setMessageTypeData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 模擬 API 調用
      // 在實際應用中，這裡會調用真實的 API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬數據
      setStats({
        totalUsers: 1247,
        totalGroups: 89,
        totalMessages: 15632,
        todayMessages: 234,
        activeUsers: 89,
        newUsers: 12,
      });

      setRecentMessages([
        {
          key: '1',
          user: '張小明',
          group: 'VIP客戶群',
          message: '請問產品價格如何？',
          time: '2分鐘前',
          type: 'text',
        },
        {
          key: '2',
          user: '李美華',
          group: null,
          message: '感謝您的服務！',
          time: '5分鐘前',
          type: 'text',
        },
        {
          key: '3',
          user: '王大雄',
          group: '技術支援群',
          message: '系統出現問題',
          time: '10分鐘前',
          type: 'text',
        },
      ]);

      // 模擬圖表數據
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartData.push({
          date: date.toISOString().split('T')[0],
          messages: Math.floor(Math.random() * 100) + 50,
          users: Math.floor(Math.random() * 20) + 10,
        });
      }
      setChartData(chartData);

      setMessageTypeData([
        { name: '文字訊息', value: 65, color: '#1890ff' },
        { name: '圖片', value: 20, color: '#52c41a' },
        { name: '貼圖', value: 10, color: '#faad14' },
        { name: '其他', value: 5, color: '#f5222d' },
      ]);

    } catch (error) {
      console.error('獲取儀表板數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const messageColumns = [
    {
      title: '用戶',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '群組',
      dataIndex: 'group',
      key: 'group',
      render: (group) => group ? <Tag color="blue">{group}</Tag> : <Tag color="default">私人訊息</Tag>,
    },
    {
      title: '訊息內容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '時間',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        儀表板
      </Title>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總用戶數"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總群組數"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總訊息數"
              value={stats.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日訊息"
              value={stats.todayMessages}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 訊息趨勢圖 */}
        <Col xs={24} lg={16}>
          <Card title="訊息趨勢" extra={<EyeOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#1890ff" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#52c41a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 訊息類型分佈 */}
        <Col xs={24} lg={8}>
          <Card title="訊息類型分佈">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={messageTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {messageTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 最近訊息 */}
        <Col xs={24} lg={16}>
          <Card title="最近訊息" extra={<ClockCircleOutlined />}>
            <Table
              columns={messageColumns}
              dataSource={recentMessages}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 快速統計 */}
        <Col xs={24} lg={8}>
          <Card title="快速統計">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">活躍用戶</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {stats.activeUsers}
                </div>
              </div>
              <div>
                <Text type="secondary">新用戶（今日）</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {stats.newUsers}
                </div>
              </div>
              <div>
                <Text type="secondary">平均每日訊息</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {Math.floor(stats.totalMessages / 30)}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
