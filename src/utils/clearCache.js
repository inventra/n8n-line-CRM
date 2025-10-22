// 清除快取工具 - 用於清除所有本地存儲和快取

/**
 * 清除所有與資料庫初始化相關的快取
 */
export const clearAllCache = () => {
  try {
    // 清除本地存儲
    localStorage.removeItem('line_crm_token');
    localStorage.removeItem('line_crm_user');
    localStorage.removeItem('line_crm_db_initialized');
    
    // 清除 sessionStorage
    sessionStorage.clear();
    
    // 清除所有可能的快取鍵
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('line_crm')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ 已清除所有快取');
    return true;
  } catch (error) {
    console.error('❌ 清除快取失敗:', error);
    return false;
  }
};

/**
 * 強制重新載入頁面
 */
export const forceReload = () => {
  // 清除快取
  clearAllCache();
  
  // 強制重新載入頁面
  window.location.reload();
};

/**
 * 開發者工具 - 在控制台提供快捷函數
 */
export const setupClearCacheTools = () => {
  if (import.meta.env.DEV) {
    // 在開發環境中，將工具函數掛載到 window 對象
    window.clearCache = {
      clearAll: clearAllCache,
      forceReload: forceReload
    };
    
    console.log('🧹 快取清除工具已載入:');
    console.log('  - window.clearCache.clearAll() - 清除所有快取');
    console.log('  - window.clearCache.forceReload() - 清除快取並重新載入');
  }
};

// 自動設定工具
setupClearCacheTools();
