import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { checkDatabaseInitialized } from '../utils/databaseInit';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDatabaseInit, setShowDatabaseInit] = useState(false);
  const [databaseChecked, setDatabaseChecked] = useState(false);

  useEffect(() => {
    // 檢查本地存儲中的認證狀態
    const token = localStorage.getItem('line_crm_token');
    const userData = localStorage.getItem('line_crm_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // 登入後檢查資料庫
        checkDatabaseAfterLogin();
      } catch (error) {
        console.error('解析用戶數據失敗:', error);
        localStorage.removeItem('line_crm_token');
        localStorage.removeItem('line_crm_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const checkDatabaseAfterLogin = async () => {
    try {
      // 如果有 API 基礎 URL，則檢查資料庫狀態
      if (import.meta.env.VITE_API_BASE) {
        const isInitialized = await checkDatabaseInitialized();
        if (!isInitialized) {
          setShowDatabaseInit(true);
        }
      } else {
        // 如果沒有 API 基礎 URL，顯示設定提示
        console.log('未設定 VITE_API_BASE，請先設定 API 基礎 URL');
        // 為了測試，暫時顯示初始化提示
        setShowDatabaseInit(true);
      }
      setDatabaseChecked(true);
    } catch (error) {
      console.error('檢查資料庫狀態失敗:', error);
      setDatabaseChecked(true);
    }
  };

  const login = async (lineCode) => {
    try {
      setLoading(true);
      
      // 檢查是否有 API 基礎 URL
      if (!import.meta.env.VITE_API_BASE) {
        // 模擬登入成功（用於演示）
        const mockUser = {
          id: 'demo_user_001',
          displayName: '演示用戶',
          pictureUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2NS42IDMxLjYgNTQgNDYgNTRINTRDNjguNCA1NCA4MCA2NS42IDgwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+',
          lineUserId: 'U' + Math.random().toString(36).substr(2, 9),
        };
        
        const mockToken = 'demo_token_' + Date.now();
        
        localStorage.setItem('line_crm_token', mockToken);
        localStorage.setItem('line_crm_user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsAuthenticated(true);
        message.success('登入成功！');
        // 登入後檢查資料庫
        checkDatabaseAfterLogin();
        return true;
      }
      
      // 實際 API 調用
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/line-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: lineCode }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user: userData } = data;
        
        localStorage.setItem('line_crm_token', token);
        localStorage.setItem('line_crm_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        message.success('登入成功！');
        // 登入後檢查資料庫
        checkDatabaseAfterLogin();
        return true;
      } else {
        const errorData = await response.json();
        message.error(errorData.message || '登入失敗');
        return false;
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      message.error('登入過程中發生錯誤');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('line_crm_token');
    localStorage.removeItem('line_crm_user');
    setUser(null);
    setIsAuthenticated(false);
    message.success('已登出');
  };

  const handleDatabaseInitSuccess = () => {
    setShowDatabaseInit(false);
    message.success('資料庫初始化完成！');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    showDatabaseInit,
    databaseChecked,
    handleDatabaseInitSuccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
