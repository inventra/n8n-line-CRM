# LINE CRM 部署指南

## 🚀 快速部署

### 方法 1: 使用簡化模板（推薦）

```bash
zeabur template deploy -f simple-template.yaml
```

### 方法 2: 使用完整模板

```bash
zeabur template deploy -f template.yaml
```

## 📋 部署步驟

### 1. 準備工作

1. 確保您有 Zeabur 帳號
2. 準備 LINE Bot 憑證（Channel Access Token 和 Channel Secret）
3. 決定您的域名前綴（例如：`mycompany`）

### 2. 部署服務

1. 執行部署命令
2. 填入域名：
   - n8n Domain: `你的前綴-n8n`
   - API Domain: `你的前綴-api`  
   - Frontend Domain: `你的前綴-frontend`

### 3. 自動初始化資料庫

系統會在首次訪問時自動檢查並初始化資料庫：

1. 當用戶首次登入系統時，會自動檢測資料庫是否已初始化
2. 如果未初始化，會彈出初始化模態框
3. 點擊「開始初始化」即可自動完成資料庫設定
4. 初始化過程包括：建立資料表、插入初始數據、設定權限等

### 4. 設定 LINE Bot

1. 訪問前端域名
2. 進入「系統設定」頁面
3. 填入 LINE Channel Access Token
4. 填入 LINE Channel Secret
5. 設定 Webhook URL（指向 n8n 域名）

### 5. 配置 n8n 工作流

1. 訪問 n8n 域名
2. 建立新的工作流
3. 添加 LINE Webhook 節點
4. 設定訊息處理邏輯
5. 連接 PostgreSQL 節點儲存訊息

### 6. 設定 LINE Webhook

1. 在 LINE Developers Console 中設定 Webhook URL
2. 驗證 Webhook 連接
3. 測試訊息接收

## 🔧 環境變數設定

### Frontend 環境變數
```
VITE_API_BASE=https://你的API域名.zeabur.app
VITE_N8N_API=https://你的n8n域名.zeabur.app
```

### n8n 環境變數
```
LINE_CHANNEL_ACCESS_TOKEN=你的LINE_ACCESS_TOKEN
LINE_CHANNEL_SECRET=你的LINE_CHANNEL_SECRET
```

### PostgREST 環境變數
```
PGRST_DB_ANON_ROLE=web_anon
```

## 🧪 測試部署

### 1. 測試資料庫連接
- 連接到 PostgreSQL
- 檢查資料表是否建立成功
- 驗證初始數據是否插入

### 2. 測試 API
- 訪問 `https://你的API域名.zeabur.app/line_users`
- 應該返回空的用戶列表

### 3. 測試前端
- 訪問 `https://你的前端域名.zeabur.app`
- 應該看到登入頁面

### 4. 測試 n8n
- 訪問 `https://你的n8n域名.zeabur.app`
- 應該看到 n8n 介面

### 5. 測試 LINE Bot
- 發送訊息到 LINE Bot
- 檢查 n8n 工作流是否觸發
- 檢查資料庫是否儲存訊息

## 🐛 常見問題

### 1. 部署失敗
- 檢查域名格式是否正確
- 確保域名前綴唯一
- 檢查 Zeabur 服務狀態

### 2. 資料庫連接失敗
- 檢查 PostgreSQL 服務狀態
- 驗證連接字串
- 確認資料庫已初始化

### 3. 前端無法載入
- 檢查環境變數設定
- 確認 API 域名可訪問
- 檢查瀏覽器控制台錯誤

### 4. n8n 工作流不執行
- 檢查 LINE 憑證設定
- 驗證 Webhook URL
- 檢查工作流配置

### 5. LINE Bot 無回應
- 檢查 Webhook 設定
- 驗證 n8n 工作流
- 檢查 LINE 憑證

## 📞 技術支援

如果遇到問題：

1. 檢查 Zeabur 服務日誌
2. 查看 n8n 執行日誌
3. 檢查 PostgreSQL 連接
4. 驗證環境變數設定

## 🔄 更新部署

要更新系統：

1. 推送代碼到 GitHub
2. Zeabur 會自動重新部署
3. 檢查服務狀態
4. 測試功能是否正常

## 📊 監控和維護

### 定期檢查
- 服務運行狀態
- 資料庫性能
- 錯誤日誌
- 用戶反饋

### 備份策略
- 定期備份資料庫
- 備份 n8n 工作流
- 保存重要配置

---

**部署完成後，您就擁有一個完整的 LINE CRM 系統！** 🎉
