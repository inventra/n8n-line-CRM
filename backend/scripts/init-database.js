#!/usr/bin/env node

/**
 * 資料庫初始化腳本
 * 類似 n8n 的自動初始化機制
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 資料庫連接配置
const dbConfig = {
  host: process.env.DB_POSTGRESDB_HOST || process.env.POSTGRES_HOST,
  port: process.env.DB_POSTGRESDB_PORT || process.env.POSTGRES_PORT,
  database: process.env.DB_POSTGRESDB_DATABASE || process.env.POSTGRES_DATABASE,
  user: process.env.DB_POSTGRESDB_USER || process.env.POSTGRES_USERNAME,
  password: process.env.DB_POSTGRESDB_PASSWORD || process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

async function initializeDatabase() {
  try {
    console.log('🚀 開始初始化 LINE CRM 資料庫...');
    console.log(`📊 連接資料庫: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
    
    // 檢查資料庫連接
    await pool.query('SELECT 1');
    console.log('✅ 資料庫連接成功');
    
    // 檢查是否已初始化
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'system_settings' 
        AND table_schema = 'public'
      );
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('ℹ️  資料庫已經初始化，跳過初始化步驟');
      return;
    }
    
    console.log('📝 開始執行資料庫初始化腳本...');
    
    // 讀取並執行初始化 SQL
    const initSQLPath = path.join(__dirname, '../init.sql');
    const initSQL = fs.readFileSync(initSQLPath, 'utf8');
    
    // 分割 SQL 語句並執行
    const statements = initSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📋 找到 ${statements.length} 個 SQL 語句`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ 執行語句 ${i + 1}/${statements.length}...`);
          await pool.query(statement);
        } catch (error) {
          // 忽略某些錯誤（如表已存在等）
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist')) {
            console.warn(`⚠️  語句 ${i + 1} 執行警告:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ 資料庫初始化完成');
    
    // 驗證初始化結果
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 已建立的表:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 檢查系統設定
    const settingsResult = await pool.query('SELECT key, value FROM system_settings');
    console.log('⚙️  系統設定:');
    settingsResult.rows.forEach(row => {
      console.log(`  - ${row.key}: ${row.value}`);
    });
    
    console.log('🎉 LINE CRM 資料庫初始化成功！');
    
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 執行初始化
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
