const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 資料庫連接配置 (支援多種環境變數格式)
const dbConfig = {
  host: process.env.DB_POSTGRESDB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DB_POSTGRESDB_PORT || process.env.POSTGRES_PORT || '5432'),
  database: process.env.DB_POSTGRESDB_DATABASE || process.env.POSTGRES_DATABASE || 'line_crm',
  user: process.env.DB_POSTGRESDB_USER || process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.DB_POSTGRESDB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',
  // 修復 SSL 連接問題
  ssl: false,  // 在 Zeabur 內部網絡中不需要 SSL
  // 連接超時設定
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
};

// 如果提供了 DATABASE_URL，使用它
if (process.env.DATABASE_URL) {
  console.log('使用 DATABASE_URL 連接資料庫');
  // 解析 DATABASE_URL
  const url = new URL(process.env.DATABASE_URL);
  dbConfig.host = url.hostname;
  dbConfig.port = url.port;
  dbConfig.database = url.pathname.slice(1);
  dbConfig.user = url.username;
  dbConfig.password = url.password;
}

// 建立資料庫連接池
const pool = new Pool(dbConfig);

// 測試資料庫連接
const testDatabaseConnection = async () => {
  try {
    console.log('測試資料庫連接...');
    console.log('連接配置:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ 資料庫連接成功:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
    console.error('連接配置:', dbConfig);
    return false;
  }
};

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

// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'LINE CRM Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// 認證 API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少授權碼' });
    }
    
    // 獲取 LINE 憑證設定
    const settingsResult = await pool.query(`
      SELECT key, value FROM system_settings 
      WHERE key IN ('LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET')
    `);
    
    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    if (!settings.LINE_CHANNEL_ACCESS_TOKEN || !settings.LINE_CHANNEL_SECRET) {
      return res.status(400).json({ error: 'LINE 憑證未設定' });
    }
    
    // 模擬 LINE 用戶資料（實際應用中需要調用 LINE API）
    const mockUser = {
      id: 'user_' + Date.now(),
      displayName: 'LINE 用戶',
      pictureUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2NS42IDMxLjYgNTQgNDYgNTRINTRDNjguNCA1NCA4MCA2NS42IDgwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+',
      lineUserId: 'U' + Math.random().toString(36).substr(2, 9),
    };
    
    // 儲存用戶到資料庫
    await pool.query(`
      INSERT INTO line_users (line_user_id, display_name, picture_url, is_friend)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (line_user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        picture_url = EXCLUDED.picture_url,
        updated_at = CURRENT_TIMESTAMP
    `, [mockUser.lineUserId, mockUser.displayName, mockUser.pictureUrl]);
    
    res.json(mockUser);
  } catch (error) {
    console.error('登入失敗:', error);
    res.status(500).json({ error: '登入失敗' });
  }
});

app.get('/api/auth/status', async (req, res) => {
  try {
    // 簡化的認證狀態檢查（實際應用中需要檢查 session 或 JWT）
    res.json({ authenticated: false });
  } catch (error) {
    console.error('檢查認證狀態失敗:', error);
    res.status(500).json({ error: '檢查認證狀態失敗' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    // 簡化的登出處理（實際應用中需要清除 session 或 JWT）
    res.json({ success: true, message: '已登出' });
  } catch (error) {
    console.error('登出失敗:', error);
    res.status(500).json({ error: '登出失敗' });
  }
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
  console.log(`404 - 請求路徑: ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'API 端點不存在',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 測試資料庫連接
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('資料庫連接失敗，伺服器無法啟動');
      process.exit(1);
    }
    
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
