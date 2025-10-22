#!/usr/bin/env node

/**
 * 資料庫連線測試腳本
 * 用於驗證 PostgreSQL 資料庫連線是否正常
 */

const { Pool } = require('pg');
require('dotenv').config();

// 資料庫連接配置 (與 server.js 相同)
const dbConfig = {
  host: process.env.DB_POSTGRESDB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DB_POSTGRESDB_PORT || process.env.POSTGRES_PORT || '5432'),
  database: process.env.DB_POSTGRESDB_DATABASE || process.env.POSTGRES_DATABASE || 'line_crm',
  user: process.env.DB_POSTGRESDB_USER || process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.DB_POSTGRESDB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
};

// 如果提供了 DATABASE_URL，使用它
if (process.env.DATABASE_URL) {
  console.log('🔗 使用 DATABASE_URL 連接資料庫');
  const url = new URL(process.env.DATABASE_URL);
  dbConfig.host = url.hostname;
  dbConfig.port = url.port;
  dbConfig.database = url.pathname.slice(1);
  dbConfig.user = url.username;
  dbConfig.password = url.password;
}

console.log('🔧 資料庫連線配置:');
console.log(`   主機: ${dbConfig.host}`);
console.log(`   端口: ${dbConfig.port}`);
console.log(`   資料庫: ${dbConfig.database}`);
console.log(`   用戶: ${dbConfig.user}`);
console.log(`   密碼: ${'*'.repeat(dbConfig.password.length)}`);
console.log('');

// 建立連接池
const pool = new Pool(dbConfig);

async function testConnection() {
  let client;
  
  try {
    console.log('🔄 正在測試資料庫連線...');
    
    // 獲取連接
    client = await pool.connect();
    console.log('✅ 成功獲取資料庫連接');
    
    // 測試基本查詢
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ 資料庫查詢成功');
    console.log(`   當前時間: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL 版本: ${result.rows[0].pg_version.split(' ')[0]}`);
    
    // 檢查資料庫是否存在必要的表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('system_settings', 'line_users', 'line_groups', 'messages')
      ORDER BY table_name
    `);
    
    console.log('📊 資料庫表檢查:');
    if (tablesResult.rows.length > 0) {
      console.log('✅ 找到以下表:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  未找到必要的表，可能需要初始化資料庫');
    }
    
    // 檢查資料庫初始化狀態
    try {
      const initResult = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'system_settings' 
          AND table_schema = 'public'
        );
      `);
      
      if (initResult.rows[0].exists) {
        console.log('✅ 資料庫已初始化');
        
        // 檢查系統設定
        const settingsResult = await client.query('SELECT key, value FROM system_settings LIMIT 5');
        console.log('⚙️  系統設定:');
        settingsResult.rows.forEach(row => {
          console.log(`   ${row.key}: ${row.value}`);
        });
      } else {
        console.log('⚠️  資料庫未初始化，需要執行初始化腳本');
      }
    } catch (error) {
      console.log('⚠️  無法檢查初始化狀態:', error.message);
    }
    
    console.log('');
    console.log('🎉 資料庫連線測試完成！');
    
  } catch (error) {
    console.error('❌ 資料庫連線失敗:');
    console.error(`   錯誤類型: ${error.code || 'UNKNOWN'}`);
    console.error(`   錯誤訊息: ${error.message}`);
    console.error('');
    console.error('🔧 可能的解決方案:');
    console.error('   1. 檢查資料庫服務是否正在運行');
    console.error('   2. 檢查環境變數配置是否正確');
    console.error('   3. 檢查資料庫用戶權限');
    console.error('   4. 檢查網路連線');
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// 執行測試
testConnection().catch(error => {
  console.error('測試過程中發生錯誤:', error);
  process.exit(1);
});
