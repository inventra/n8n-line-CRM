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
  Badge,
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  MessageOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Groups = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchTags();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [groups, searchText, selectedTags]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬群組數據
      const mockGroups = [
        {
          id: 1,
          line_group_id: 'G1234567890',
          group_name: 'VIP客戶群',
          custom_name: '重要客戶群組',
          picture_url: 'https://via.placeholder.com/40',
          tags: ['VIP客戶', '群組管理'],
          notes: '重要客戶專屬群組',
          member_count: 25,
          message_count: 456,
          last_message_at: '2024-01-15 14:30:00',
          created_at: '2024-01-01 10:00:00',
        },
        {
          id: 2,
          line_group_id: 'G2345678901',
          group_name: '技術支援群',
          custom_name: null,
          picture_url: 'https://via.placeholder.com/40',
          tags: ['技術支援'],
          notes: '技術問題討論群組',
          member_count: 15,
          message_count: 234,
          last_message_at: '2024-01-15 12:15:00',
          created_at: '2024-01-05 09:30:00',
        },
        {
          id: 3,
          line_group_id: 'G3456789012',
          group_name: '產品討論群',
          custom_name: '新產品討論群',
          picture_url: 'https://via.placeholder.com/40',
          tags: ['產品討論'],
          notes: '新產品功能討論',
          member_count: 8,
          message_count: 123,
          last_message_at: '2024-01-14 16:45:00',
          created_at: '2024-01-10 14:20:00',
        },
      ];
      
      setGroups(mockGroups);
    } catch (error) {
      console.error('獲取群組列表失敗:', error);
      message.error('獲取群組列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      // 模擬標籤數據
      const mockTags = [
        { id: 1, name: 'VIP客戶', color: '#FF6B6B' },
        { id: 2, name: '技術支援', color: '#4ECDC4' },
        { id: 3, name: '產品討論', color: '#45B7D1' },
        { id: 4, name: '群組管理', color: '#DDA0DD' },
        { id: 5, name: '測試群組', color: '#98D8C8' },
      ];
      setTags(mockTags);
    } catch (error) {
      console.error('獲取標籤列表失敗:', error);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    // 搜尋過濾
    if (searchText) {
      filtered = filtered.filter(group => 
        group.group_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (group.custom_name && group.custom_name.toLowerCase().includes(searchText.toLowerCase())) ||
        group.notes.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 標籤過濾
    if (selectedTags.length > 0) {
      filtered = filtered.filter(group => 
        selectedTags.some(tag => group.tags.includes(tag))
      );
    }

    setFilteredGroups(filtered);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    form.setFieldsValue({
      custom_name: group.custom_name,
      tags: group.tags,
      notes: group.notes,
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedGroups = groups.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...values }
          : group
      );
      
      setGroups(updatedGroups);
      setIsModalVisible(false);
      setEditingGroup(null);
      form.resetFields();
      message.success('群組資訊更新成功');
    } catch (error) {
      console.error('更新群組失敗:', error);
      message.error('更新群組失敗');
    }
  };

  const handleDelete = async (groupId) => {
    try {
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedGroups = groups.filter(group => group.id !== groupId);
      setGroups(updatedGroups);
      message.success('群組刪除成功');
    } catch (error) {
      console.error('刪除群組失敗:', error);
      message.error('刪除群組失敗');
    }
  };

  const columns = [
    {
      title: '群組',
      dataIndex: 'group_name',
      key: 'group',
      render: (text, record) => (
        <Space>
          <Avatar src={record.picture_url} icon={<TeamOutlined />} />
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
      title: '成員數',
      dataIndex: 'member_count',
      key: 'member_count',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      ),
      sorter: (a, b) => a.member_count - b.member_count,
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
            icon={<EyeOutlined />}
            onClick={() => {
              // 查看群組詳情
              message.info('查看群組詳情功能開發中');
            }}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Popconfirm
            title="確定要刪除這個群組嗎？"
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
    total: filteredGroups.length,
    totalMembers: filteredGroups.reduce((sum, g) => sum + g.member_count, 0),
    totalMessages: filteredGroups.reduce((sum, g) => sum + g.message_count, 0),
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        群組管理
      </Title>

      {/* 統計卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="總群組數"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="總成員數"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
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
            placeholder="搜尋群組名稱、自定義名稱或備註"
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
              setEditingGroup(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新增群組
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredGroups}
          loading={loading}
          rowKey="id"
          pagination={{
            total: filteredGroups.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
          }}
        />
      </Card>

      <Modal
        title={editingGroup ? '編輯群組' : '新增群組'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGroup(null);
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
            <AntInput placeholder="輸入自定義群組名稱" />
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
              placeholder="輸入群組備註資訊" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Groups;
