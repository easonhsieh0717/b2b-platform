# 快速開始測試指南

## 📋 前置準備

確保您已安裝：
- Node.js 18 或更高版本
- npm 或 yarn

## 🚀 快速啟動（5 分鐘）

### 步驟 1：安裝後端依賴並初始化資料庫

打開第一個終端視窗（Command Prompt 或 PowerShell）：

```bash
cd C:\Cursor\B2B\backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 步驟 2：建立後端環境變數檔案

在 `backend` 目錄下建立 `.env` 檔案（如果還沒有）：

```bash
cd C:\Cursor\B2B\backend
```

建立 `.env` 檔案，內容如下：

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_ISSUER=b2b-platform
JWT_AUDIENCE=b2b-users
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:5173
```

### 步驟 3：啟動後端伺服器

在同一個終端視窗：

```bash
npm run dev
```

您應該看到：
```
🚀 伺服器運行在 http://localhost:3000
```

**保持這個終端視窗開啟！**

### 步驟 4：安裝前端依賴

打開第二個終端視窗：

```bash
cd C:\Cursor\B2B\frontend
npm install
```

### 步驟 5：啟動前端開發伺服器

在同一個終端視窗：

```bash
npm run dev
```

您應該看到：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## ✅ 驗證系統運行

1. 打開瀏覽器訪問：http://localhost:5173
2. 您應該看到 B2B 賣貨便的首頁
3. 後端 API 健康檢查：http://localhost:3000/health

## 🧪 開始測試

### 測試場景 1：註冊賣家帳號

1. 訪問 http://localhost:5173
2. 點擊右上角「登入」
3. 選擇「LINE 登入」標籤
4. 輸入：
   - LINE ID: `seller001`
   - 姓名: `王老闆`（選填）
5. 點擊「登入」
6. 填寫註冊表單：
   - 統編: `12345678`
   - 公司名稱: `測試通訊行`
   - 分店代碼: `001`
   - 分店名稱: `總店`
   - 地址: `台北市信義區信義路五段7號`
   - 城市: `台北市`
   - 區域: `信義區`
   - 電話: `02-1234-5678`（選填）
   - 姓名: `王老闆`
7. 點擊「完成註冊」

### 測試場景 2：上架商品

1. 登入後，點擊導航欄「我的庫存」
2. 點擊「新增商品」按鈕
3. 填寫商品資訊：
   - 品牌: `Apple`
   - 型號: `iPhone 15 Pro`
   - 規格: `256GB`
   - 顏色: `藍色鈦金屬`
   - 容量: `256GB`
   - 等級: `全新`
   - 數量: `5`
   - 價格: `35000`
   - 勾選「需要 IMEI/序號」
4. 點擊「儲存」

### 測試場景 3：註冊買家並下單

1. 登出或使用無痕視窗
2. 點擊「登入」→ 選擇「Google 登入」
3. 輸入：
   - Email: `buyer@test.com`
   - Google ID: `buyer001`
   - 姓名: `李老闆`
4. 點擊「登入」
5. 填寫註冊資訊：
   - 統編: `87654321`
   - 公司名稱: `測試維修店`
   - 分店代碼: `001`
   - 分店名稱: `總店`
   - 地址: `新北市板橋區文化路一段188巷`
   - 城市: `新北市`
   - 區域: `板橋區`
   - 姓名: `李老闆`
6. 完成註冊後，點擊「找貨」
7. 搜尋或點擊剛才上架的商品
8. 點擊「立即下單」
9. 填寫數量: `1`
10. 點擊「建立訂單」

### 測試場景 4：完成訂單流程

#### 4.1 賣家確認訂單
1. 使用賣家帳號登入
2. 點擊「訂單」
3. 點擊訂單進入詳情
4. 點擊「確認訂單」

#### 4.2 買家付款
1. 使用買家帳號登入
2. 點擊「訂單」→ 進入訂單詳情
3. 點擊「付款（虛擬帳號/ATM）」
4. 在彈出視窗點擊「確定」模擬付款

#### 4.3 賣家派車
1. 使用賣家帳號
2. 在訂單詳情頁點擊「取得物流報價」
3. 點擊「派車」

#### 4.4 買家驗收
1. 使用買家帳號
2. 在訂單詳情頁點擊「驗收完成」

## 🐛 常見問題

### 問題 1：後端無法啟動

**錯誤**: `Cannot find module '@prisma/client'`

**解決**:
```bash
cd backend
npm install
npx prisma generate
```

### 問題 2：資料庫錯誤

**錯誤**: `SQLite database file not found`

**解決**:
```bash
cd backend
npx prisma migrate dev --name init
```

### 問題 3：前端無法連接後端

**檢查**:
1. 確認後端正在運行（http://localhost:3000/health）
2. 檢查 `backend/.env` 中的 `CORS_ORIGIN` 是否為 `http://localhost:5173`
3. 確認前端代理設定（`frontend/vite.config.ts`）

### 問題 4：端口被占用

**解決**:
- 後端：修改 `backend/.env` 中的 `PORT=3001`
- 前端：修改 `frontend/vite.config.ts` 中的 `server.port`

## 📝 測試檢查清單

- [ ] 後端成功啟動（http://localhost:3000/health 返回 `{"status":"ok"}`）
- [ ] 前端成功啟動（http://localhost:5173 顯示首頁）
- [ ] 可以註冊賣家帳號
- [ ] 可以上架商品
- [ ] 可以註冊買家帳號
- [ ] 可以搜尋商品
- [ ] 可以建立訂單
- [ ] 賣家可以確認訂單
- [ ] 買家可以付款（模擬）
- [ ] 賣家可以派車
- [ ] 買家可以驗收

## 🎯 下一步

完成基本測試後，我們可以：
1. 整合實際的 LINE OAuth
2. 整合實際的 Lalamove API
3. 整合實際的第三方金流
4. 實作 LINE Bot 通知功能

---

**需要幫助？** 請檢查終端視窗的錯誤訊息，或查看 `docs/TESTING_GUIDE.md` 獲取更詳細的說明。
