# PostgreSQL 資料庫連線問題診斷指南

## 問題症狀

當您看到以下錯誤訊息時，表示資料庫連線有問題：

- `資料庫連接失敗`
- `ECONNREFUSED`
- `authentication failed`
- `database does not exist`
- `relation does not exist`

## 診斷步驟

### 1. 檢查環境變數

確保以下環境變數已正確設定：

```bash
# 檢查環境變數
echo "POSTGRES_HOST: $POSTGRES_HOST"
echo "POSTGRES_PORT: $POSTGRES_PORT"
echo "POSTGRES_DATABASE: $POSTGRES_DATABASE"
echo "POSTGRES_USERNAME: $POSTGRES_USERNAME"
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
```

### 2. 測試資料庫連線

使用我們提供的測試腳本：

```bash
cd backend
node test-db-connection.js
```

### 3. 手動測試連線

使用 psql 命令手動測試：

```bash
psql "postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}"
```

## 常見問題與解決方案

### 問題 1: 環境變數未設定

**症狀**: `undefined` 或 `null` 值

**解決方案**:
1. 檢查 Zeabur 服務環境變數設定
2. 確保變數名稱正確（區分大小寫）
3. 重新部署服務

### 問題 2: 資料庫服務未啟動

**症狀**: `ECONNREFUSED` 錯誤

**解決方案**:
1. 檢查 PostgreSQL 服務狀態
2. 重新啟動 PostgreSQL 服務
3. 檢查服務日誌

### 問題 3: 認證失敗

**症狀**: `authentication failed` 錯誤

**解決方案**:
1. 檢查用戶名和密碼是否正確
2. 確認資料庫用戶權限
3. 檢查 PostgreSQL 認證配置

### 問題 4: 資料庫不存在

**症狀**: `database does not exist` 錯誤

**解決方案**:
1. 檢查資料庫名稱是否正確
2. 手動建立資料庫
3. 檢查資料庫權限

### 問題 5: 表不存在

**症狀**: `relation does not exist` 錯誤

**解決方案**:
1. 執行資料庫初始化腳本
2. 檢查 `database/init.sql` 是否正確執行
3. 手動建立必要的表

## 修正後的配置

### n8n-style-template.yaml 修正

我們已經修正了以下問題：

1. **環境變數一致性**: 確保 PostgreSQL 服務提供的變數名稱與後端服務使用的變數名稱一致
2. **備用變數**: 添加了標準 PostgreSQL 環境變數作為備用
3. **預設值**: 為所有配置添加了合理的預設值

### 後端服務修正

1. **多格式支援**: 支援多種環境變數格式
2. **錯誤處理**: 改進了錯誤處理和日誌記錄
3. **連線測試**: 添加了詳細的連線測試功能

## 驗證步驟

### 1. 檢查服務狀態

```bash
# 檢查 PostgreSQL 服務
curl -f http://your-postgres-service.zeabur.app/health

# 檢查後端服務
curl -f http://your-backend-service.zeabur.app/api/health
```

### 2. 檢查資料庫初始化

```bash
# 檢查系統設定表
psql "postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}" -c "SELECT * FROM system_settings;"
```

### 3. 檢查後端日誌

查看後端服務日誌，確認：
- 資料庫連線成功
- 資料庫初始化完成
- 沒有錯誤訊息

## 如果問題仍然存在

1. **檢查 Zeabur 控制台**: 查看服務日誌和環境變數
2. **重新部署**: 使用修正後的配置重新部署
3. **手動初始化**: 如果自動初始化失敗，手動執行 `database/init.sql`
4. **聯繫支援**: 如果問題持續，請提供詳細的錯誤日誌

## 預防措施

1. **定期備份**: 定期備份資料庫資料
2. **監控連線**: 設定連線監控和警報
3. **測試環境**: 在測試環境中驗證配置
4. **文檔更新**: 保持配置文檔的更新
