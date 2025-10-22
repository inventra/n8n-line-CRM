# PostgreSQL 部署問題修正

## 🐛 問題分析

您的 `n8n-style-template.yaml` 中的 PostgreSQL 配置有幾個問題：

1. **模板版本不匹配**: 使用了 `PREBUILT_V2` 但配置方式不正確
2. **缺少配置檔案**: 沒有 PostgreSQL 配置檔案
3. **缺少健康檢查**: 沒有健康檢查機制
4. **缺少依賴關係**: 服務之間沒有正確的依賴關係

## ✅ 修正內容

### 1. PostgreSQL 服務修正

```yaml
# 修正前
template: PREBUILT_V2
source:
    image: postgres:17

# 修正後
template: PREBUILT
source:
    image: postgres:17
    command:
        - docker-entrypoint.sh
        - -c
        - config_file=/etc/postgresql/postgresql.conf
```

### 2. 添加配置檔案

```yaml
configs:
    - path: /etc/postgresql/postgresql.conf
      template: |
        # PostgreSQL 配置
        listen_addresses = '*'
        max_connections = 100
        shared_buffers = 128MB
        # ... 其他配置
```

### 3. 添加健康檢查

```yaml
healthCheck:
    type: TCP
    port: database
```

### 4. 添加依賴關係

```yaml
# Backend 服務
dependencies:
    - postgresql

# n8n 服務
dependencies:
    - postgresql
```

### 5. 添加環境變數

```yaml
POSTGRES_URI:
    default: ${POSTGRES_CONNECTION_STRING}
    expose: true
```

## 🔧 主要修正點

### PostgreSQL 服務
- ✅ 改用 `PREBUILT` 模板
- ✅ 添加 PostgreSQL 配置檔案
- ✅ 添加健康檢查
- ✅ 添加 `POSTGRES_URI` 環境變數

### Backend 服務
- ✅ 添加對 PostgreSQL 的依賴關係
- ✅ 確保環境變數正確配置

### n8n 服務
- ✅ 添加對 PostgreSQL 的依賴關係
- ✅ 添加健康檢查
- ✅ 確保資料庫連接配置正確

## 🚀 部署順序

修正後的部署順序：

1. **PostgreSQL** → 首先啟動，建立資料庫
2. **Backend** → 等待 PostgreSQL 就緒後啟動
3. **n8n** → 等待 PostgreSQL 就緒後啟動
4. **Frontend** → 最後啟動

## 📋 驗證步驟

部署完成後，請檢查：

1. **PostgreSQL 健康狀態**: 檢查資料庫是否正常運行
2. **Backend 連接**: 檢查 Backend 是否能連接到資料庫
3. **n8n 連接**: 檢查 n8n 是否能連接到資料庫
4. **API 測試**: 測試 Backend API 是否正常

## 🎯 預期效果

修正後應該能夠：

- ✅ PostgreSQL 正常啟動和運行
- ✅ Backend 服務能正常連接資料庫
- ✅ n8n 服務能正常連接資料庫
- ✅ 所有服務按正確順序啟動
- ✅ 健康檢查正常通過
