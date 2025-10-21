-- LINE CRM MVP 資料庫初始化腳本
-- 建立基本的資料庫結構

-- 建立擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 系統設定表
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. LINE 用戶表
CREATE TABLE IF NOT EXISTS line_users (
    id SERIAL PRIMARY KEY,
    line_user_id VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    picture_url TEXT,
    status_message TEXT,
    is_friend BOOLEAN DEFAULT false,
    custom_name VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    last_message_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. LINE 群組表
CREATE TABLE IF NOT EXISTS line_groups (
    id SERIAL PRIMARY KEY,
    line_group_id VARCHAR(100) UNIQUE NOT NULL,
    group_name VARCHAR(255),
    picture_url TEXT,
    custom_name VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    member_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 訊息表
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) UNIQUE NOT NULL,
    line_user_id VARCHAR(100),
    line_group_id VARCHAR(100),
    message_type VARCHAR(50) NOT NULL,
    content TEXT,
    original_content JSONB,
    is_from_bot BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    sentiment_score DECIMAL(3,2),
    keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 標籤表
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_groups_line_group_id ON line_groups(line_group_id);
CREATE INDEX IF NOT EXISTS idx_messages_line_user_id ON messages(line_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_line_group_id ON messages(line_group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 插入初始系統設定
INSERT INTO system_settings (key, value, description) VALUES
('LINE_CHANNEL_ACCESS_TOKEN', '', 'LINE Bot Channel Access Token'),
('LINE_CHANNEL_SECRET', '', 'LINE Bot Channel Secret'),
('SYSTEM_NAME', 'LINE CRM', '系統名稱'),
('VERSION', '1.0.0', '系統版本'),
('MAINTENANCE_MODE', 'false', '維護模式'),
('INITIALIZED', 'true', '資料庫初始化標記')
ON CONFLICT (key) DO NOTHING;

-- 插入預設標籤
INSERT INTO tags (name, color, description) VALUES
('VIP客戶', '#FF6B6B', '重要客戶標籤'),
('新客戶', '#4ECDC4', '新加入的客戶'),
('活躍用戶', '#45B7D1', '經常互動的用戶'),
('潛在客戶', '#96CEB4', '有潛力的客戶'),
('問題用戶', '#FFEAA7', '需要特別關注的用戶')
ON CONFLICT (name) DO NOTHING;

-- 建立角色和權限
CREATE ROLE IF NOT EXISTS web_anon;
CREATE ROLE IF NOT EXISTS web_user;
CREATE ROLE IF NOT EXISTS web_admin;

-- 授予基本權限
GRANT USAGE ON SCHEMA public TO web_anon, web_user, web_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_anon, web_user, web_admin;
GRANT INSERT, UPDATE, DELETE ON messages, line_users, line_groups TO web_user, web_admin;
GRANT INSERT, UPDATE, DELETE ON system_settings TO web_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web_user, web_admin;

-- 完成資料庫初始化
COMMENT ON DATABASE postgres IS 'LINE CRM MVP Database - Initialized';
