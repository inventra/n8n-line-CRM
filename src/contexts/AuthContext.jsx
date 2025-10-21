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
      
      // 檢查是否有 API 基礎 URL
      if (!import.meta.env.VITE_API_BASE) {
        // 模擬登入成功（用於演示）
        const mockUser = {
          id: 'demo_user_001',
          displayName: '演示用戶',
          pictureUrl: 'https://via.placeholder.com/100',
          lineUserId: 'U' + Math.random().toString(36).substr(2, 9),
        };
        
        const mockToken = 'demo_token_' + Date.now();
        
        localStorage.setItem('line_crm_token', mockToken);
        localStorage.setItem('line_crm_user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsAuthenticated(true);
        message.success('登入成功！');
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
