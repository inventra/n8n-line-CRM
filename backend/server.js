const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 資料庫連接配置 (類似 n8n)
const dbConfig = {
  host: process.env.DB_POSTGRESDB_HOST || process.env.POSTGRES_HOST,
  port: process.env.DB_POSTGRESDB_PORT || process.env.POSTGRES_PORT,
  database: process.env.DB_POSTGRESDB_DATABASE || process.env.POSTGRES_DATABASE,
  user: process.env.DB_POSTGRESDB_USER || process.env.POSTGRES_USERNAME,
  password: process.env.DB_POSTGRESDB_PASSWORD || process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// 建立資料庫連接池
const pool = new Pool(dbConfig);

// 中間件配置
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 1000 // 限制每個 IP 每 15 分鐘最多 1000 個請求
});
app.use('/api/', limiter);

// 資料庫初始化檢查 (類似 n8n 的機制)
const initializeDatabase = async () => {
  try {
    console.log('檢查資料庫初始化狀態...');
    
    // 檢查是否已初始化
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'system_settings' 
        AND table_schema = 'public'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('資料庫已初始化');
      return true;
    }
    
    console.log('資料庫未初始化，開始自動初始化...');
    await initDatabase();
    console.log('資料庫初始化完成');
    return true;
    
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    return false;
  }
};

// 執行資料庫初始化
const initDatabase = async () => {
  const fs = require('fs');
  const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  
  // 分割 SQL 語句並執行
  const statements = initSQL.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await pool.query(statement);
    }
  }
};

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// 系統設定 API
app.get('/api/system-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_settings ORDER BY key');
    res.json(result.rows);
  } catch (error) {
    console.error('獲取系統設定失敗:', error);
    res.status(500).json({ error: '獲取系統設定失敗' });
  }
});

app.put('/api/system-settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await pool.query(
      'UPDATE system_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
      [value, key]
    );
    
    res.json({ success: true, message: '設定已更新' });
  } catch (error) {
    console.error('更新系統設定失敗:', error);
    res.status(500).json({ error: '更新系統設定失敗' });
  }
});

// LINE 用戶 API
app.get('/api/line-users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM line_users';
    let params = [];
    
    if (search) {
      query += ' WHERE display_name ILIKE $1 OR custom_name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('獲取 LINE 用戶失敗:', error);
    res.status(500).json({ error: '獲取 LINE 用戶失敗' });
  }
});

// LINE 群組 API
app.get('/api/line-groups', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM line_groups';
    let params = [];
    
    if (search) {
      query += ' WHERE group_name ILIKE $1 OR custom_name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('獲取 LINE 群組失敗:', error);
    res.status(500).json({ error: '獲取 LINE 群組失敗' });
  }
});

// 訊息 API
app.get('/api/messages', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      user_id, 
      group_id, 
      message_type,
      date_from,
      date_to 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM messages WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    if (user_id) {
      paramCount++;
      query += ` AND line_user_id = $${paramCount}`;
      params.push(user_id);
    }
    
    if (group_id) {
      paramCount++;
      query += ` AND line_group_id = $${paramCount}`;
      params.push(group_id);
    }
    
    if (message_type) {
      paramCount++;
      query += ` AND message_type = $${paramCount}`;
      params.push(message_type);
    }
    
    if (date_from) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(date_from);
    }
    
    if (date_to) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(date_to);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('獲取訊息失敗:', error);
    res.status(500).json({ error: '獲取訊息失敗' });
  }
});

// 統計數據 API
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = {};
    
    // 用戶統計
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_today,
        COUNT(CASE WHEN last_message_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_week
      FROM line_users
    `);
    stats.users = userStats.rows[0];
    
    // 群組統計
    const groupStats = await pool.query(`
      SELECT 
        COUNT(*) as total_groups,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_today
      FROM line_groups
    `);
    stats.groups = groupStats.rows[0];
    
    // 訊息統計
    const messageStats = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_messages,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_messages
      FROM messages
    `);
    stats.messages = messageStats.rows[0];
    
    res.json(stats);
  } catch (error) {
    console.error('獲取統計數據失敗:', error);
    res.status(500).json({ error: '獲取統計數據失敗' });
  }
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error('API 錯誤:', error);
  res.status(500).json({ 
    error: '內部伺服器錯誤',
    message: process.env.NODE_ENV === 'development' ? error.message : '請稍後再試'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API 端點不存在' });
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 初始化資料庫
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('資料庫初始化失敗，伺服器無法啟動');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 LINE CRM Backend 服務已啟動`);
      console.log(`📊 端口: ${PORT}`);
      console.log(`🗄️  資料庫: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
      console.log(`🌐 環境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('伺服器啟動失敗:', error);
    process.exit(1);
  }
};

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉伺服器...');
  pool.end(() => {
    console.log('資料庫連接已關閉');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，正在關閉伺服器...');
  pool.end(() => {
    console.log('資料庫連接已關閉');
    process.exit(0);
  });
});

startServer();
