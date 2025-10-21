import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Modal, 
  Form, 
  Select, 
  Input as AntInput,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Popconfirm,
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchTags();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, selectedTags]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬用戶數據
      const mockUsers = [
        {
          id: 1,
          line_user_id: 'U1234567890',
          display_name: '張小明',
          custom_name: 'VIP客戶-張小明',
          picture_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2NjYiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40IDEyLjQgMjIgMTggMjJIMjJDMjcuNiAyMiAzMiAyNi40IDMyIDMyVjQwSDhWMzJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPg==',
          is_friend: true,
          tags: ['VIP客戶', '活躍用戶'],
          notes: '重要客戶，經常詢問產品資訊',
          message_count: 156,
          last_message_at: '2024-01-15 14:30:00',
          created_at: '2024-01-01 10:00:00',
        },
        {
          id: 2,
          line_user_id: 'U2345678901',
          display_name: '李美華',
          custom_name: null,
          picture_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2NjYiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40IDEyLjQgMjIgMTggMjJIMjJDMjcuNiAyMiAzMiAyNi40IDMyIDMyVjQwSDhWMzJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPg==',
          is_friend: true,
          tags: ['新客戶'],
          notes: '新加入的客戶',
          message_count: 23,
          last_message_at: '2024-01-15 12:15:00',
          created_at: '2024-01-10 09:30:00',
        },
        {
          id: 3,
          line_user_id: 'U3456789012',
          display_name: '王大雄',
          custom_name: '技術支援-王大雄',
          picture_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2NjYiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40IDEyLjQgMjIgMTggMjJIMjJDMjcuNiAyMiAzMiAyNi40IDMyIDMyVjQwSDhWMzJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPg==',
          is_friend: false,
          tags: ['問題用戶'],
          notes: '需要技術支援的用戶',
          message_count: 89,
          last_message_at: '2024-01-14 16:45:00',
          created_at: '2024-01-05 14:20:00',
        },
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
      message.error('獲取用戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      // 模擬標籤數據
      const mockTags = [
        { id: 1, name: 'VIP客戶', color: '#FF6B6B' },
        { id: 2, name: '新客戶', color: '#4ECDC4' },
        { id: 3, name: '活躍用戶', color: '#45B7D1' },
        { id: 4, name: '潛在客戶', color: '#96CEB4' },
        { id: 5, name: '問題用戶', color: '#FFEAA7' },
      ];
      setTags(mockTags);
    } catch (error) {
      console.error('獲取標籤列表失敗:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // 搜尋過濾
    if (searchText) {
      filtered = filtered.filter(user => 
        user.display_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.custom_name && user.custom_name.toLowerCase().includes(searchText.toLowerCase())) ||
        user.notes.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 標籤過濾
    if (selectedTags.length > 0) {
      filtered = filtered.filter(user => 
        selectedTags.some(tag => user.tags.includes(tag))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      custom_name: user.custom_name,
      tags: user.tags,
      notes: user.notes,
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUsers = users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...values }
          : user
      );
      
      setUsers(updatedUsers);
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      message.success('用戶資訊更新成功');
    } catch (error) {
      console.error('更新用戶失敗:', error);
      message.error('更新用戶失敗');
    }
  };

  const handleDelete = async (userId) => {
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      message.success('用戶刪除成功');
    } catch (error) {
      console.error('刪除用戶失敗:', error);
      message.error('刪除用戶失敗');
    }
  };

  const columns = [
    {
      title: '用戶',
      dataIndex: 'display_name',
      key: 'user',
      render: (text, record) => (
        <Space>
          <Avatar src={record.picture_url} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.custom_name || text}
            </div>
            {record.custom_name && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                原名: {text}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <Space wrap>
          {tags.map(tag => {
            const tagData = tags.find(t => t.name === tag);
            return (
              <Tag key={tag} color={tagData?.color || '#1890ff'}>
                {tag}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: '好友狀態',
      dataIndex: 'is_friend',
      key: 'is_friend',
      render: (isFriend) => (
        <Tag color={isFriend ? 'green' : 'red'}>
          {isFriend ? '已加好友' : '未加好友'}
        </Tag>
      ),
    },
    {
      title: '訊息數',
      dataIndex: 'message_count',
      key: 'message_count',
      sorter: (a, b) => a.message_count - b.message_count,
    },
    {
      title: '最後訊息',
      dataIndex: 'last_message_at',
      key: 'last_message_at',
      render: (time) => new Date(time).toLocaleString('zh-TW'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除這個用戶嗎？"
            onConfirm={() => handleDelete(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: filteredUsers.length,
    friends: filteredUsers.filter(u => u.is_friend).length,
    totalMessages: filteredUsers.reduce((sum, u) => sum + u.message_count, 0),
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        用戶管理
      </Title>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="總用戶數"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已加好友"
              value={stats.friends}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="總訊息數"
              value={stats.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜尋用戶名稱、自定義名稱或備註"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            mode="multiple"
            placeholder="選擇標籤"
            value={selectedTags}
            onChange={setSelectedTags}
            style={{ width: 200 }}
          >
            {tags.map(tag => (
              <Option key={tag.id} value={tag.name}>
                <Tag color={tag.color} style={{ marginRight: 8 }}>
                  {tag.name}
                </Tag>
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新增用戶
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '編輯用戶' : '新增用戶'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="custom_name"
            label="自定義名稱"
            rules={[{ max: 255, message: '自定義名稱不能超過255個字符' }]}
          >
            <AntInput placeholder="輸入自定義名稱" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="標籤"
          >
            <Select
              mode="multiple"
              placeholder="選擇標籤"
              options={tags.map(tag => ({
                label: tag.name,
                value: tag.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="備註"
            rules={[{ max: 500, message: '備註不能超過500個字符' }]}
          >
            <AntInput.TextArea 
              rows={4} 
              placeholder="輸入備註資訊" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
