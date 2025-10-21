import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Select, 
  DatePicker, 
  Space,
  Statistic,
  Table,
  Tag,
  Progress,
} from 'antd';
import { 
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [timeRange, setTimeRange] = useState('30days');

  // 模擬數據
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 1247,
      totalGroups: 89,
      totalMessages: 15632,
      activeUsers: 234,
      newUsers: 45,
      messageGrowth: 12.5,
      userGrowth: 8.3,
    },
    messageTrend: [],
    userActivity: [],
    messageTypes: [],
    topUsers: [],
    topGroups: [],
    hourlyActivity: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬訊息趨勢數據
      const messageTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        messageTrend.push({
          date: date.format('MM-DD'),
          messages: Math.floor(Math.random() * 200) + 100,
          users: Math.floor(Math.random() * 50) + 20,
          groups: Math.floor(Math.random() * 10) + 5,
        });
      }

      // 模擬用戶活動數據
      const userActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        userActivity.push({
          date: date.format('MM-DD'),
          active: Math.floor(Math.random() * 100) + 50,
          new: Math.floor(Math.random() * 20) + 5,
        });
      }

      // 模擬訊息類型數據
      const messageTypes = [
        { name: '文字訊息', value: 65, color: '#1890ff' },
        { name: '圖片', value: 20, color: '#52c41a' },
        { name: '貼圖', value: 10, color: '#faad14' },
        { name: '影片', value: 3, color: '#f5222d' },
        { name: '其他', value: 2, color: '#722ed1' },
      ];

      // 模擬熱門用戶數據
      const topUsers = [
        { id: 1, name: '張小明', messages: 156, growth: 12.5 },
        { id: 2, name: '李美華', messages: 134, growth: 8.3 },
        { id: 3, name: '王大雄', messages: 98, growth: -2.1 },
        { id: 4, name: '陳小華', messages: 87, growth: 15.7 },
        { id: 5, name: '林小芳', messages: 76, growth: 5.2 },
      ];

      // 模擬熱門群組數據
      const topGroups = [
        { id: 1, name: 'VIP客戶群', messages: 456, members: 25 },
        { id: 2, name: '技術支援群', messages: 234, members: 15 },
        { id: 3, name: '產品討論群', messages: 123, members: 8 },
        { id: 4, name: '客服群組', messages: 89, members: 12 },
        { id: 5, name: '測試群組', messages: 67, members: 5 },
      ];

      // 模擬小時活動數據
      const hourlyActivity = [];
      for (let i = 0; i < 24; i++) {
        hourlyActivity.push({
          hour: `${i.toString().padStart(2, '0')}:00`,
          messages: Math.floor(Math.random() * 50) + 10,
          users: Math.floor(Math.random() * 20) + 5,
        });
      }

      setAnalyticsData({
        overview: {
          totalUsers: 1247,
          totalGroups: 89,
          totalMessages: 15632,
          activeUsers: 234,
          newUsers: 45,
          messageGrowth: 12.5,
          userGrowth: 8.3,
        },
        messageTrend,
        userActivity,
        messageTypes,
        topUsers,
        topGroups,
        hourlyActivity,
      });

    } catch (error) {
      console.error('獲取分析數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      title: '用戶',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '訊息數',
      dataIndex: 'messages',
      key: 'messages',
      sorter: (a, b) => a.messages - b.messages,
    },
    {
      title: '成長率',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth) => (
        <Tag color={growth > 0 ? 'green' : 'red'}>
          {growth > 0 ? <RiseOutlined /> : <FallOutlined />}
          {Math.abs(growth)}%
        </Tag>
      ),
    },
  ];

  const groupColumns = [
    {
      title: '群組',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '訊息數',
      dataIndex: 'messages',
      key: 'messages',
      sorter: (a, b) => a.messages - b.messages,
    },
    {
      title: '成員數',
      dataIndex: 'members',
      key: 'members',
      sorter: (a, b) => a.members - b.members,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          數據分析
        </Title>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7days">最近7天</Option>
            <Option value="30days">最近30天</Option>
            <Option value="90days">最近90天</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 240 }}
          />
        </Space>
      </div>

      {/* 概覽統計 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總用戶數"
              value={analyticsData.overview.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總群組數"
              value={analyticsData.overview.totalGroups}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總訊息數"
              value={analyticsData.overview.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活躍用戶"
              value={analyticsData.overview.activeUsers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 訊息趨勢圖 */}
        <Col xs={24} lg={16}>
          <Card title="訊息趨勢" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.messageTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="訊息數"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="活躍用戶"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 訊息類型分佈 */}
        <Col xs={24} lg={8}>
          <Card title="訊息類型分佈" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.messageTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {analyticsData.messageTypes.map((entry, index) => (
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
        {/* 用戶活動趨勢 */}
        <Col xs={24} lg={12}>
          <Card title="用戶活動趨勢" loading={loading}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stackId="1" 
                  stroke="#1890ff" 
                  fill="#1890ff"
                  name="活躍用戶"
                />
                <Area 
                  type="monotone" 
                  dataKey="new" 
                  stackId="1" 
                  stroke="#52c41a" 
                  fill="#52c41a"
                  name="新用戶"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 小時活動分佈 */}
        <Col xs={24} lg={12}>
          <Card title="24小時活動分佈" loading={loading}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#1890ff" name="訊息數" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 熱門用戶 */}
        <Col xs={24} lg={12}>
          <Card title="熱門用戶" loading={loading}>
            <Table
              columns={userColumns}
              dataSource={analyticsData.topUsers}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>

        {/* 熱門群組 */}
        <Col xs={24} lg={12}>
          <Card title="熱門群組" loading={loading}>
            <Table
              columns={groupColumns}
              dataSource={analyticsData.topGroups}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 成長指標 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card title="訊息成長率">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                {analyticsData.overview.messageGrowth}%
              </div>
              <div style={{ color: '#666' }}>較上期</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="用戶成長率">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                {analyticsData.overview.userGrowth}%
              </div>
              <div style={{ color: '#666' }}>較上期</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
