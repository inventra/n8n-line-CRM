import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Groups from './pages/Groups';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Test from './pages/Test';
import DatabaseInitModal from './components/DatabaseInitModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { checkDatabaseInitialized } from './utils/databaseInit';
import './App.css';

// 受保護的路由組件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 公開路由組件（已登入用戶重定向到儀表板）
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  const [showInitModal, setShowInitModal] = useState(false);
  const [initChecked, setInitChecked] = useState(false);

  useEffect(() => {
    // 檢查資料庫是否已初始化
    const checkInit = async () => {
      try {
        // 只有在有 API 基礎 URL 時才檢查
        if (import.meta.env.VITE_API_BASE) {
          const isInitialized = await checkDatabaseInitialized();
          if (!isInitialized) {
            setShowInitModal(true);
          }
        }
        setInitChecked(true);
      } catch (error) {
        console.error('檢查資料庫狀態失敗:', error);
        setInitChecked(true);
      }
    };

    checkInit();
  }, []);

  const handleInitSuccess = () => {
    setShowInitModal(false);
    // 可以添加其他初始化成功後的邏輯
  };

  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/test" element={<Test />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/groups" element={
                <ProtectedRoute>
                  <Layout>
                    <Groups />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
        
        {/* 資料庫初始化模態框 */}
        {initChecked && (
          <DatabaseInitModal
            visible={showInitModal}
            onClose={() => setShowInitModal(false)}
            onSuccess={handleInitSuccess}
          />
        )}
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;// Force rebuild 2025年10月21日 週二 16時50分37秒 CST
