-- LINE CRM Backend 資料庫初始化腳本
-- 類似 n8n 的自動初始化機制

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

-- 4. 群組成員關聯表
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES line_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES line_users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- 5. 訊息表
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

-- 6. 訊息附件表
CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    attachment_type VARCHAR(50),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 標籤表
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 用戶標籤關聯表
CREATE TABLE IF NOT EXISTS user_tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES line_users(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tag_id)
);

-- 9. 群組標籤關聯表
CREATE TABLE IF NOT EXISTS group_tags (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES line_groups(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, tag_id)
);

-- 10. 統計數據表
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    total_groups INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    messages_by_type JSONB DEFAULT '{}'::jsonb,
    top_keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- 11. 工作流日誌表
CREATE TABLE IF NOT EXISTS workflow_logs (
    id SERIAL PRIMARY KEY,
    workflow_name VARCHAR(100),
    execution_id VARCHAR(100),
    status VARCHAR(50),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_groups_line_group_id ON line_groups(line_group_id);
CREATE INDEX IF NOT EXISTS idx_messages_line_user_id ON messages(line_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_line_group_id ON messages(line_group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- 建立觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 建立觸發器
CREATE TRIGGER update_line_users_updated_at BEFORE UPDATE ON line_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_line_groups_updated_at BEFORE UPDATE ON line_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
('問題用戶', '#FFEAA7', '需要特別關注的用戶'),
('群組管理', '#DDA0DD', '群組管理相關'),
('測試群組', '#98D8C8', '測試用途的群組')
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
COMMENT ON DATABASE postgres IS 'LINE CRM Backend Database - Initialized';
