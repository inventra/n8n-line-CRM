import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

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

  useEffect(() => {
    // 檢查本地存儲中的認證狀態
    const token = localStorage.getItem('line_crm_token');
    const userData = localStorage.getItem('line_crm_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('解析用戶數據失敗:', error);
        localStorage.removeItem('line_crm_token');
        localStorage.removeItem('line_crm_user');
      }
    }
    setLoading(false);
  }, []);


  const login = async (lineCode) => {
    try {
      setLoading(true);
      
      // 簡化的登入邏輯 - 直接使用模擬登入
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
      return true;
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


  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
