// API 工具 - 連接 Backend 服務 (替代 PostgREST)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

console.log('API 配置:', {
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  API_BASE_URL: API_BASE_URL
});

// 通用 API 請求函數
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 請求錯誤:', error);
    throw error;
  }
};

// 系統設定 API
export const systemSettingsAPI = {
  // 獲取所有系統設定
  getAll: () => apiRequest('/system-settings'),
  
  // 更新系統設定
  update: (key, value) => apiRequest(`/system-settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),
  
  // 獲取特定設定
  get: (key) => apiRequest(`/system-settings?key=${key}`),
};

// LINE 用戶 API
export const lineUsersAPI = {
  // 獲取用戶列表
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/line-users?${queryParams}`);
  },
  
  // 獲取特定用戶
  getById: (id) => apiRequest(`/line-users/${id}`),
  
  // 搜尋用戶
  search: (searchTerm) => apiRequest(`/line-users?search=${encodeURIComponent(searchTerm)}`),
};

// LINE 群組 API
export const lineGroupsAPI = {
  // 獲取群組列表
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/line-groups?${queryParams}`);
  },
  
  // 獲取特定群組
  getById: (id) => apiRequest(`/line-groups/${id}`),
  
  // 搜尋群組
  search: (searchTerm) => apiRequest(`/line-groups?search=${encodeURIComponent(searchTerm)}`),
};

// 訊息 API
export const messagesAPI = {
  // 獲取訊息列表
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/messages?${queryParams}`);
  },
  
  // 獲取特定訊息
  getById: (id) => apiRequest(`/messages/${id}`),
  
  // 搜尋訊息
  search: (searchTerm) => apiRequest(`/messages?search=${encodeURIComponent(searchTerm)}`),
  
  // 按用戶獲取訊息
  getByUser: (userId, params = {}) => {
    const queryParams = new URLSearchParams({ user_id: userId, ...params });
    return apiRequest(`/messages?${queryParams}`);
  },
  
  // 按群組獲取訊息
  getByGroup: (groupId, params = {}) => {
    const queryParams = new URLSearchParams({ group_id: groupId, ...params });
    return apiRequest(`/messages?${queryParams}`);
  },
};

// 統計數據 API
export const statisticsAPI = {
  // 獲取所有統計數據
  getAll: () => apiRequest('/statistics'),
  
  // 獲取用戶統計
  getUsers: () => apiRequest('/statistics/users'),
  
  // 獲取群組統計
  getGroups: () => apiRequest('/statistics/groups'),
  
  // 獲取訊息統計
  getMessages: () => apiRequest('/statistics/messages'),
};

// 健康檢查 API
export const healthAPI = {
  // 檢查服務健康狀態
  check: () => apiRequest('/health'),
};

// 資料庫初始化 API (類似 n8n 的機制)
export const databaseAPI = {
  // 檢查資料庫是否已初始化
  checkInitialized: async () => {
    try {
      const settings = await systemSettingsAPI.getAll();
      const initialized = settings.find(s => s.key === 'INITIALIZED');
      return initialized && initialized.value === 'true';
    } catch (error) {
      console.error('檢查資料庫初始化狀態失敗:', error);
      return false;
    }
  },
  
  // 獲取資料庫狀態
  getStatus: () => apiRequest('/health'),
};

// 導出所有 API
export default {
  systemSettings: systemSettingsAPI,
  lineUsers: lineUsersAPI,
  lineGroups: lineGroupsAPI,
  messages: messagesAPI,
  statistics: statisticsAPI,
  health: healthAPI,
  database: databaseAPI,
};
