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
    // 檢查資料庫中的認證狀態
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      console.log('檢查認證狀態 - Backend URL:', backendUrl);
      
      if (backendUrl && !backendUrl.includes('${')) {
        // 從後端檢查認證狀態
        const response = await fetch(`${backendUrl}/api/auth/status`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const authData = await response.json();
          if (authData.authenticated && authData.user) {
            setUser(authData.user);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('檢查認證狀態失敗:', error);
    } finally {
      setLoading(false);
    }
  };


  const login = async (lineCode) => {
    try {
      setLoading(true);
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      console.log('登入 - Backend URL:', backendUrl);
      
      if (backendUrl && !backendUrl.includes('${')) {
        // 使用後端 API 進行登入
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code: lineCode })
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          message.success('登入成功！');
          return true;
        } else {
          message.error('登入失敗，請檢查 LINE 憑證設定');
          return false;
        }
      } else {
        // 簡化的模擬登入（當沒有後端時）
        const mockUser = {
          id: 'demo_user_001',
          displayName: '演示用戶',
          pictureUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0yMCA4MEMyMCA2NS42IDMxLjYgNTQgNDYgNTRINTRDNjguNCA1NCA4MCA2NS42IDgwIDgwVjEwMEgyMFY4MFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+',
          lineUserId: 'U' + Math.random().toString(36).substr(2, 9),
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
        message.success('登入成功！');
        return true;
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      message.error('登入過程中發生錯誤');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      if (backendUrl && !backendUrl.includes('${')) {
        // 使用後端 API 進行登出
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('登出錯誤:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      message.success('已登出');
    }
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
