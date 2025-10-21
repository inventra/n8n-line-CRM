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
import './App.css';

// 受保護的路由組件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, showDatabaseInit, databaseChecked, handleDatabaseInitSuccess } = useAuth();
  
  console.log('ProtectedRoute 狀態:', { isAuthenticated, showDatabaseInit, databaseChecked });
  
  // 如果正在檢查資料庫，顯示載入中
  if (isAuthenticated && !databaseChecked) {
    console.log('顯示載入中...');
    return <div>檢查資料庫中...</div>;
  }
  
  // 如果需要初始化資料庫，顯示初始化模態框
  if (isAuthenticated && showDatabaseInit) {
    console.log('顯示初始化模態框');
    return (
      <DatabaseInitModal
        visible={showDatabaseInit}
        onClose={() => {}}
        onSuccess={handleDatabaseInitSuccess}
      />
    );
  }
  
  console.log('顯示正常內容');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 公開路由組件（已登入用戶重定向到儀表板）
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {

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
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;// Force rebuild 2025年10月21日 週二 16時50分37秒 CST
