# LINE CRM MVP 系統

一個完整的 LINE CRM 管理系統，使用 React + Ant Design 前端，PostgreSQL 資料庫，n8n 工作流自動化，和 PostgREST API。

## 🚀 功能特色

### 核心功能
- **LINE 登入認證** - 使用 LINE 帳號登入系統
- **用戶管理** - 管理 LINE 用戶，支援自定義名稱和標籤
- **群組管理** - 管理 LINE 群組，支援群組標籤和備註
- **訊息管理** - 查看和管理所有 LINE 訊息
- **數據分析** - 詳細的統計分析和圖表
- **系統設定** - 管理 LINE Bot 憑證和系統配置

### 技術架構
- **前端**: React 19 + Ant Design 5 + React Router
- **後端**: PostgREST (自動生成 REST API)
- **資料庫**: PostgreSQL 17
- **工作流**: n8n (自動化處理 LINE Webhook)
- **部署**: Zeabur 一鍵部署

## 📊 資料庫結構

系統包含以下主要資料表：

### 核心表
- `system_settings` - 系統設定
- `line_users` - LINE 用戶資料
- `line_groups` - LINE 群組資料
- `messages` - 訊息記錄
- `tags` - 標籤管理

### 關聯表
- `group_members` - 群組成員關聯
- `user_tags` - 用戶標籤關聯
- `group_tags` - 群組標籤關聯
- `message_attachments` - 訊息附件

### 統計表
- `daily_stats` - 每日統計
- `workflow_logs` - 工作流日誌

## 🛠 部署指南

### 1. 使用 Zeabur 模板部署

1. 在 Zeabur 選擇此模板
2. 填入必要的域名：
   - n8n Domain: `你的前綴-n8n`
   - API Domain: `你的前綴-api`
   - Frontend Domain: `你的前綴-frontend`

### 2. 部署後設定

#### 步驟 1: 自動初始化資料庫
系統會在首次訪問時自動檢查並初始化資料庫：

1. 當用戶首次登入系統時，會自動檢測資料庫是否已初始化
2. 如果未初始化，會彈出初始化模態框
3. 點擊「開始初始化」即可自動完成資料庫設定
4. 初始化過程包括：建立資料表、插入初始數據、設定權限等

#### 步驟 2: 設定 LINE Bot 憑證
1. 進入 `settings` 頁面
2. 填入 LINE Channel Access Token
3. 填入 LINE Channel Secret
4. 設定 Webhook URL

#### 步驟 3: 配置 n8n 工作流
1. 訪問 n8n 域名
2. 建立 LINE Webhook 處理流程
3. 設定訊息儲存到 PostgreSQL

#### 步驟 4: 設定 LINE Webhook
1. 在 LINE Developers Console 設定 Webhook URL
2. 驗證 Webhook 連接

## 📱 頁面功能

### 儀表板 (Dashboard)
- 系統概覽統計
- 訊息趨勢圖表
- 最近訊息列表
- 快速統計數據

### 用戶管理 (Users)
- 用戶列表和搜尋
- 自定義用戶名稱
- 標籤管理
- 用戶統計

### 群組管理 (Groups)
- 群組列表和搜尋
- 自定義群組名稱
- 群組標籤
- 成員統計

### 訊息管理 (Messages)
- 訊息列表和篩選
- 訊息詳情查看
- 訊息類型分析
- 時間範圍篩選

### 數據分析 (Analytics)
- 訊息趨勢分析
- 用戶活動統計
- 熱門用戶/群組
- 24小時活動分佈
- 成長率指標

### 系統設定 (Settings)
- LINE Bot 憑證管理
- 系統配置
- 連接測試
- 系統資訊

## 🔧 開發指南

### 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 建置生產版本
npm run build
```

### 環境變數

```env
VITE_API_BASE=https://你的API域名.zeabur.app
VITE_N8N_API=https://你的n8n域名.zeabur.app
```

### API 端點

系統使用 PostgREST 自動生成 REST API：

- `GET /line_users` - 獲取用戶列表
- `GET /line_groups` - 獲取群組列表
- `GET /messages` - 獲取訊息列表
- `GET /system_settings` - 獲取系統設定
- `POST /auth/line-login` - LINE 登入

## 📈 統計分析功能

### 提供的分析數據
1. **用戶統計**
   - 總用戶數、活躍用戶、新用戶
   - 用戶成長率、訊息數統計

2. **群組統計**
   - 總群組數、成員數統計
   - 群組活躍度分析

3. **訊息分析**
   - 訊息類型分佈（文字、圖片、貼圖等）
   - 24小時活動分佈
   - 訊息趨勢圖表

4. **熱門排行**
   - 熱門用戶排行
   - 熱門群組排行
   - 成長率分析

## 🏷 標籤系統

### 預設標籤
- **VIP客戶** - 重要客戶標籤
- **新客戶** - 新加入的客戶
- **活躍用戶** - 經常互動的用戶
- **潛在客戶** - 有潛力的客戶
- **問題用戶** - 需要特別關注的用戶
- **群組管理** - 群組管理相關
- **測試群組** - 測試用途的群組

### 標籤功能
- 支援自定義標籤
- 標籤顏色管理
- 標籤使用統計
- 批量標籤操作

## 🔐 安全特性

- LINE OAuth 2.0 認證
- JWT Token 管理
- 角色權限控制
- 資料加密存儲

## 📞 技術支援

如有問題，請參考：
1. 系統設定頁面的連接測試功能
2. n8n 工作流日誌
3. PostgreSQL 資料庫日誌

## 🚀 未來規劃

- AI 情感分析
- 自動回覆功能
- 進階報表生成
- 多語言支援
- 移動端適配

---

**LINE CRM MVP 系統** - 讓 LINE 客戶關係管理變得簡單高效！