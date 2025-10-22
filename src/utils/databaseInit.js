// 資料庫初始化工具 - 使用 Backend API (類似 n8n 的機制)
import { databaseAPI } from './api';

export const initializeDatabase = async () => {
  try {
    console.log('開始執行資料庫初始化...');
    
    // 首先檢查是否已經初始化
    const isInitialized = await checkDatabaseInitialized();
    if (isInitialized) {
      return { success: true, message: '資料庫已經初始化' };
    }
    
    console.log('資料庫未初始化，Backend 服務會自動處理初始化...');
    
    // 檢查 Backend 服務健康狀態
    try {
      const healthStatus = await databaseAPI.getStatus();
      console.log('Backend 服務狀態:', healthStatus);
      
      if (healthStatus.database === 'connected') {
        // Backend 已經自動初始化資料庫
        return { success: true, message: 'Backend 服務已自動初始化資料庫' };
      } else {
        return { 
          success: false, 
          message: 'Backend 服務無法連接資料庫，請檢查配置',
          requiresManualSetup: true,
          setupInstructions: {
            title: 'Backend 服務配置指南',
            steps: [
              '1. 檢查 Backend 服務是否正常運行',
              '2. 檢查資料庫連接配置',
              '3. 查看 Backend 服務日誌',
              '4. 重新部署 Backend 服務'
            ]
          }
        };
      }
    } catch (error) {
      console.error('Backend 服務檢查失敗:', error);
      return { 
        success: false, 
        message: '無法連接到 Backend 服務，請檢查服務狀態',
        requiresManualSetup: true,
        setupInstructions: {
          title: 'Backend 服務故障排除',
          steps: [
            '1. 檢查 Backend 服務是否正在運行',
            '2. 檢查 Backend 服務的環境變數配置',
            '3. 查看 Backend 服務的日誌輸出',
            '4. 重新部署 Backend 服務'
          ]
        }
      };
    }
  } catch (error) {
    console.error('資料庫初始化錯誤:', error);
    return { success: false, message: '資料庫初始化失敗: ' + error.message };
  }
};

// 檢查資料庫是否已初始化 - 使用 Backend API
export const checkDatabaseInitialized = async () => {
  try {
    // 使用 Backend API 檢查資料庫初始化狀態
    const isInitialized = await databaseAPI.checkInitialized();
    console.log('資料庫初始化狀態:', isInitialized);
    return isInitialized;
  } catch (error) {
    console.error('檢查資料庫狀態失敗:', error);
    return false;
  }
};

// 獲取初始化 SQL 腳本 (僅供參考)
export const getInitSQL = () => {
  return `
-- LINE CRM Backend 資料庫初始化腳本
-- 此腳本由 Backend 服務自動執行，無需手動操作

-- 建立擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立所有必要的表和索引...
-- (詳細內容請參考 backend/init.sql)
  `;
};

