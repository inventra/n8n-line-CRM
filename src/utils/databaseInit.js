// 資料庫初始化工具
export const initializeDatabase = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/rpc/init_database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true, message: '資料庫初始化成功' };
    } else {
      const error = await response.json();
      return { success: false, message: error.message || '資料庫初始化失敗' };
    }
  } catch (error) {
    console.error('資料庫初始化錯誤:', error);
    return { success: false, message: '資料庫初始化失敗' };
  }
};

// 檢查資料庫是否已初始化
export const checkDatabaseInitialized = async () => {
  try {
    // 檢查 line_users 表是否存在
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/line_users?limit=1`);
    
    if (response.ok) {
      // 如果 API 回應成功，表示表存在
      console.log('資料庫已初始化，line_users 表存在');
      return true;
    } else {
      // 檢查錯誤訊息
      const errorData = await response.json();
      console.log('資料庫檢查結果:', errorData);
      
      if (errorData.code === 'PGRST205' && errorData.message.includes('Could not find the table')) {
        console.log('資料庫未初始化，表不存在');
        return false;
      }
      return false;
    }
  } catch (error) {
    console.error('檢查資料庫狀態失敗:', error);
    return false;
  }
};

// 初始化 SQL 腳本
export const getInitSQL = () => {
  return `
-- LINE CRM MVP 資料庫初始化腳本
-- 建立完整的 LINE CRM 系統資料庫結構

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
    custom_name VARCHAR(255), -- 自定義名稱
    tags JSONB DEFAULT '[]'::jsonb, -- 標籤陣列
    notes TEXT, -- 備註
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
    custom_name VARCHAR(255), -- 自定義群組名稱
    tags JSONB DEFAULT '[]'::jsonb, -- 群組標籤
    notes TEXT, -- 群組備註
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
    role VARCHAR(50) DEFAULT 'member', -- member, admin, owner
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- 5. 訊息表
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) UNIQUE NOT NULL,
    line_user_id VARCHAR(100),
    line_group_id VARCHAR(100),
    message_type VARCHAR(50) NOT NULL, -- text, image, sticker, video, audio, file, location, etc.
    content TEXT,
    original_content JSONB, -- 原始訊息內容
    is_from_bot BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    sentiment_score DECIMAL(3,2), -- 情感分析分數 (-1 到 1)
    keywords JSONB DEFAULT '[]'::jsonb, -- 關鍵字提取
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 訊息附件表
CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    attachment_type VARCHAR(50), -- image, video, audio, file
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
    color VARCHAR(7) DEFAULT '#3B82F6', -- 十六進制顏色
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
    status VARCHAR(50), -- success, error, running
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time INTEGER, -- 毫秒
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_groups_line_group_id ON line_groups(line_group_id);
CREATE INDEX IF NOT EXISTS idx_messages_line_user_id ON messages(line_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_line_group_id ON messages(line_group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- 建立觸發器函數來更新 updated_at 時間戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表建立觸發器
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
('MAINTENANCE_MODE', 'false', '維護模式')
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

-- 建立視圖：用戶統計
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.line_user_id,
    u.display_name,
    u.custom_name,
    u.is_friend,
    u.message_count,
    u.last_message_at,
    COUNT(m.id) as total_messages,
    COUNT(CASE WHEN m.created_at >= CURRENT_DATE THEN m.id END) as today_messages,
    COUNT(CASE WHEN m.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN m.id END) as week_messages,
    COUNT(CASE WHEN m.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN m.id END) as month_messages,
    u.tags,
    u.created_at
FROM line_users u
LEFT JOIN messages m ON u.line_user_id = m.line_user_id
GROUP BY u.id, u.line_user_id, u.display_name, u.custom_name, u.is_friend, u.message_count, u.last_message_at, u.tags, u.created_at;

-- 建立視圖：群組統計
CREATE OR REPLACE VIEW group_statistics AS
SELECT 
    g.id,
    g.line_group_id,
    g.group_name,
    g.custom_name,
    g.member_count,
    g.message_count,
    g.last_message_at,
    COUNT(m.id) as total_messages,
    COUNT(CASE WHEN m.created_at >= CURRENT_DATE THEN m.id END) as today_messages,
    COUNT(CASE WHEN m.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN m.id END) as week_messages,
    COUNT(CASE WHEN m.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN m.id END) as month_messages,
    g.tags,
    g.created_at
FROM line_groups g
LEFT JOIN messages m ON g.line_group_id = m.line_group_id
GROUP BY g.id, g.line_group_id, g.group_name, g.custom_name, g.member_count, g.message_count, g.last_message_at, g.tags, g.created_at;

-- 建立視圖：每日統計摘要
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_messages,
    COUNT(DISTINCT line_user_id) as unique_users,
    COUNT(DISTINCT line_group_id) as unique_groups,
    COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
    COUNT(CASE WHEN message_type = 'image' THEN 1 END) as image_messages,
    COUNT(CASE WHEN message_type = 'sticker' THEN 1 END) as sticker_messages,
    COUNT(CASE WHEN is_from_bot = true THEN 1 END) as bot_messages
FROM messages
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 建立函數：更新用戶訊息計數
CREATE OR REPLACE FUNCTION update_user_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE line_users 
        SET message_count = message_count + 1,
            last_message_at = NEW.created_at
        WHERE line_user_id = NEW.line_user_id;
        
        IF NEW.line_group_id IS NOT NULL THEN
            UPDATE line_groups 
            SET message_count = message_count + 1,
                last_message_at = NEW.created_at
            WHERE line_group_id = NEW.line_group_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器：自動更新訊息計數
CREATE TRIGGER trigger_update_message_count
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_message_count();

-- 建立函數：獲取用戶標籤
CREATE OR REPLACE FUNCTION get_user_tags(user_line_id VARCHAR)
RETURNS TABLE(tag_name VARCHAR, tag_color VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT t.name, t.color
    FROM tags t
    JOIN user_tags ut ON t.id = ut.tag_id
    JOIN line_users u ON ut.user_id = u.id
    WHERE u.line_user_id = user_line_id;
END;
$$ LANGUAGE plpgsql;

-- 建立函數：獲取群組標籤
CREATE OR REPLACE FUNCTION get_group_tags(group_line_id VARCHAR)
RETURNS TABLE(tag_name VARCHAR, tag_color VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT t.name, t.color
    FROM tags t
    JOIN group_tags gt ON t.id = gt.tag_id
    JOIN line_groups g ON gt.group_id = g.id
    WHERE g.line_group_id = group_line_id;
END;
$$ LANGUAGE plpgsql;

-- 建立函數：搜尋訊息
CREATE OR REPLACE FUNCTION search_messages(
    search_text TEXT DEFAULT '',
    user_id_filter VARCHAR DEFAULT NULL,
    group_id_filter VARCHAR DEFAULT NULL,
    message_type_filter VARCHAR DEFAULT NULL,
    date_from TIMESTAMP DEFAULT NULL,
    date_to TIMESTAMP DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    message_id VARCHAR,
    line_user_id VARCHAR,
    line_group_id VARCHAR,
    message_type VARCHAR,
    content TEXT,
    is_from_bot BOOLEAN,
    created_at TIMESTAMP,
    user_display_name VARCHAR,
    group_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.message_id,
        m.line_user_id,
        m.line_group_id,
        m.message_type,
        m.content,
        m.is_from_bot,
        m.created_at,
        u.display_name,
        g.group_name
    FROM messages m
    LEFT JOIN line_users u ON m.line_user_id = u.line_user_id
    LEFT JOIN line_groups g ON m.line_group_id = g.line_group_id
    WHERE 
        (search_text = '' OR m.content ILIKE '%' || search_text || '%')
        AND (user_id_filter IS NULL OR m.line_user_id = user_id_filter)
        AND (group_id_filter IS NULL OR m.line_group_id = group_id_filter)
        AND (message_type_filter IS NULL OR m.message_type = message_type_filter)
        AND (date_from IS NULL OR m.created_at >= date_from)
        AND (date_to IS NULL OR m.created_at <= date_to)
    ORDER BY m.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

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
  `;
};
