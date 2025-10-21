import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  Image,
  message,
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  EyeOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Messages = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchText, messageType, dateRange, selectedUser, selectedGroup]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬訊息數據
      const mockMessages = [
        {
          id: 1,
          message_id: 'msg_001',
          line_user_id: 'U1234567890',
          line_group_id: 'G1234567890',
          message_type: 'text',
          content: '請問產品價格如何？',
          is_from_bot: false,
          created_at: '2024-01-15 14:30:00',
          user_display_name: '張小明',
          group_name: 'VIP客戶群',
        },
        {
          id: 2,
          message_id: 'msg_002',
          line_user_id: 'U2345678901',
          line_group_id: null,
          message_type: 'text',
          content: '感謝您的服務！',
          is_from_bot: false,
          created_at: '2024-01-15 12:15:00',
          user_display_name: '李美華',
          group_name: null,
        },
        {
          id: 3,
          message_id: 'msg_003',
          line_user_id: 'U3456789012',
          line_group_id: 'G2345678901',
          message_type: 'image',
          content: '系統截圖',
          is_from_bot: false,
          created_at: '2024-01-15 10:45:00',
          user_display_name: '王大雄',
          group_name: '技術支援群',
        },
        {
          id: 4,
          message_id: 'msg_004',
          line_user_id: 'bot',
          line_group_id: 'G1234567890',
          message_type: 'text',
          content: '您好！我是客服機器人，有什麼可以幫助您的嗎？',
          is_from_bot: true,
          created_at: '2024-01-15 14:32:00',
          user_display_name: '客服機器人',
          group_name: 'VIP客戶群',
        },
        {
          id: 5,
          message_id: 'msg_005',
          line_user_id: 'U4567890123',
          line_group_id: null,
          message_type: 'sticker',
          content: '貼圖訊息',
          is_from_bot: false,
          created_at: '2024-01-15 09:20:00',
          user_display_name: '陳小華',
          group_name: null,
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('獲取訊息列表失敗:', error);
      message.error('獲取訊息列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // 搜尋過濾
    if (searchText) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.user_display_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 訊息類型過濾
    if (messageType) {
      filtered = filtered.filter(msg => msg.message_type === messageType);
    }

    // 用戶過濾
    if (selectedUser) {
      filtered = filtered.filter(msg => msg.line_user_id === selectedUser);
    }

    // 群組過濾
    if (selectedGroup) {
      filtered = filtered.filter(msg => msg.line_group_id === selectedGroup);
    }

    // 日期過濾
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(msg => {
        const msgDate = dayjs(msg.created_at);
        return msgDate.isAfter(start) && msgDate.isBefore(end);
      });
    }

    setFilteredMessages(filtered);
  };

  const handleViewDetail = (message) => {
    setSelectedMessage(message);
    setIsDetailModalVisible(true);
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'text':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'image':
        return <FileImageOutlined style={{ color: '#52c41a' }} />;
      case 'sticker':
        return <FileOutlined style={{ color: '#faad14' }} />;
      default:
        return <FileOutlined style={{ color: '#666' }} />;
    }
  };

  const getMessageTypeName = (type) => {
    const typeMap = {
      text: '文字',
      image: '圖片',
      sticker: '貼圖',
      video: '影片',
      audio: '語音',
      file: '檔案',
      location: '位置',
    };
    return typeMap[type] || type;
  };

  const columns = [
    {
      title: '類型',
      dataIndex: 'message_type',
      key: 'message_type',
      width: 80,
      render: (type) => (
        <Space>
          {getMessageIcon(type)}
          <span>{getMessageTypeName(type)}</span>
        </Space>
      ),
    },
    {
      title: '發送者',
      dataIndex: 'user_display_name',
      key: 'user',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={record.is_from_bot ? <MessageOutlined /> : <UserOutlined />}
            style={{ 
              backgroundColor: record.is_from_bot ? '#f0f0f0' : '#1890ff' 
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {text}
            </div>
            {record.group_name && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <TeamOutlined /> {record.group_name}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '內容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text, record) => (
        <div>
          {record.message_type === 'image' ? (
            <Space>
              <Image
                width={40}
                height={40}
                src="https://via.placeholder.com/40"
                placeholder="圖片"
              />
              <span>{text}</span>
            </Space>
          ) : (
            <span>{text}</span>
          )}
        </div>
      ),
    },
    {
      title: '時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (time) => dayjs(time).format('MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          詳情
        </Button>
      ),
    },
  ];

  const stats = {
    total: filteredMessages.length,
    text: filteredMessages.filter(m => m.message_type === 'text').length,
    image: filteredMessages.filter(m => m.message_type === 'image').length,
    bot: filteredMessages.filter(m => m.is_from_bot).length,
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        訊息管理
      </Title>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="總訊息數"
              value={stats.total}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="文字訊息"
              value={stats.text}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="圖片訊息"
              value={stats.image}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="機器人訊息"
              value={stats.bot}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜尋訊息內容或用戶名稱"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="訊息類型"
            value={messageType}
            onChange={setMessageType}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="text">文字</Option>
            <Option value="image">圖片</Option>
            <Option value="sticker">貼圖</Option>
            <Option value="video">影片</Option>
            <Option value="audio">語音</Option>
            <Option value="file">檔案</Option>
          </Select>
          <RangePicker
            placeholder={['開始日期', '結束日期']}
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 240 }}
          />
          <Button icon={<FilterOutlined />}>
            更多篩選
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredMessages}
          loading={loading}
          rowKey="id"
          pagination={{
            total: filteredMessages.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </Card>

      <Modal
        title="訊息詳情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            關閉
          </Button>
        ]}
        width={600}
      >
        {selectedMessage && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="訊息ID">
              {selectedMessage.message_id}
            </Descriptions.Item>
            <Descriptions.Item label="發送者">
              <Space>
                <Avatar 
                  icon={selectedMessage.is_from_bot ? <MessageOutlined /> : <UserOutlined />}
                  style={{ 
                    backgroundColor: selectedMessage.is_from_bot ? '#f0f0f0' : '#1890ff' 
                  }}
                />
                {selectedMessage.user_display_name}
                {selectedMessage.is_from_bot && (
                  <Tag color="blue">機器人</Tag>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="群組">
              {selectedMessage.group_name || '私人訊息'}
            </Descriptions.Item>
            <Descriptions.Item label="訊息類型">
              <Space>
                {getMessageIcon(selectedMessage.message_type)}
                {getMessageTypeName(selectedMessage.message_type)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="內容">
              {selectedMessage.content}
            </Descriptions.Item>
            <Descriptions.Item label="發送時間">
              {dayjs(selectedMessage.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
