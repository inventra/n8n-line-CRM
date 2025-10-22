# LINE CRM 版本控制策略

## 分支策略

### **main 分支**
- **用途**：開發分支，用於日常開發和測試
- **特點**：頻繁更新，可能不穩定
- **部署**：不建議直接用於生產環境

### **production 分支**
- **用途**：生產分支，穩定版本
- **特點**：經過測試，穩定可靠
- **部署**：用於生產環境部署

## 版本更新流程

### **開發階段**
```bash
# 1. 在 main 分支開發
git checkout main
# 進行開發和測試...

# 2. 提交到 main 分支
git add .
git commit -m "feat: 新功能"
git push origin main
```

### **發布到生產**
```bash
# 1. 切換到 production 分支
git checkout production

# 2. 合併 main 分支的更新
git merge main

# 3. 推送到 production 分支
git push origin production

# 4. 部署會自動使用 production 分支的最新代碼
```

## 部署配置

### **模板配置**
```yaml
# n8n-style-template.yaml
source:
  source: GITHUB
  repo: 1080205971
  branch: production  # 使用 production 分支
  rootDirectory: /backend
```

### **版本控制優勢**
- ✅ **穩定部署**：production 分支經過測試
- ✅ **版本控制**：可以選擇何時更新生產環境
- ✅ **回滾能力**：可以快速回滾到之前的版本
- ✅ **並行開發**：main 分支可以繼續開發新功能

## 實際操作範例

### **場景 1：開發新功能**
```bash
# 在 main 分支開發
git checkout main
# 開發新功能...
git add .
git commit -m "feat: 添加新功能"
git push origin main
# 此時 production 分支不受影響
```

### **場景 2：發布到生產**
```bash
# 當新功能測試完成後
git checkout production
git merge main
git push origin production
# 部署會自動使用新的 production 分支代碼
```

### **場景 3：緊急修復**
```bash
# 直接在 production 分支修復
git checkout production
# 修復問題...
git add .
git commit -m "fix: 緊急修復"
git push origin production
# 同時更新 main 分支
git checkout main
git merge production
git push origin main
```

## 與 n8n 的對比

### **n8n 的版本控制**
- n8n 使用 Docker 鏡像標籤控制版本
- 在 Zeabur 後台可以選擇特定版本
- 例如：`n8nio/n8n:1.0.0` 或 `n8nio/n8n:latest`

### **LINE CRM 的版本控制**
- 使用 Git 分支控制版本
- 通過切換分支來控制部署版本
- 更靈活，可以自定義版本策略

## 建議的版本命名

### **Git 標籤版本**
```bash
# 創建版本標籤
git tag v1.0.0
git tag v1.1.0
git tag v1.2.0

# 推送到遠程
git push origin --tags
```

### **分支版本**
```bash
# 創建版本分支
git checkout -b v1.0.0
git push origin v1.0.0

# 在模板中使用特定版本
branch: v1.0.0
```

## 監控和回滾

### **版本監控**
- 使用 Git 歷史查看版本變更
- 使用 Zeabur 日誌監控部署狀態
- 使用健康檢查 API 監控服務狀態

### **快速回滾**
```bash
# 回滾到上一個版本
git checkout production
git reset --hard HEAD~1
git push origin production --force

# 或回滾到特定版本
git checkout v1.0.0
git checkout -b production
git push origin production --force
```

這樣您就可以像 n8n 一樣控制版本更新了！🎯
