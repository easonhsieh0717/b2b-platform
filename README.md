# B2B 賣貨便 × Lalamove

> 店對店急件調貨平台 - 2 小時內同城送達

## 📋 專案簡介

這是一個專為通訊行、維修店、盤商設計的 B2B 即時調貨平台，整合 Lalamove 物流服務，提供「上架→找貨→議價→付款→派車→對帳」的一條龍流程。

### 核心價值

- **快**：同城 2 小時到店，保成交、不失單
- **準**：即時庫存、比價、IMEI/序號留存，錯貨率低
- **穩**：代收代付 + 月結白名單，對帳與開票自動化

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn
- SQLite（開發環境，生產環境建議使用 PostgreSQL）

### 安裝步驟

#### 1. 後端設置

```bash
cd backend

# 安裝依賴
npm install

# 複製環境變數範本（需要手動建立 .env 文件）
# 參考 backend/.env.example

# 初始化資料庫
npx prisma generate
npx prisma migrate dev --name init

# 啟動開發伺服器
npm run dev
```

後端 API 將運行在 http://localhost:3000

#### 2. 前端設置

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

前端應用將運行在 http://localhost:5173

### 環境變數設置

在 `backend/.env` 中設置：

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:5173
```

## 📁 專案結構

```
B2B/
├── docs/              # 文件
│   ├── B2B_SPEC.md   # 產品規格文件
│   └── ...
├── backend/           # 後端 API
│   ├── src/
│   │   ├── routes/   # API 路由
│   │   ├── middleware/ # 中間件
│   │   └── utils/    # 工具函數
│   └── prisma/       # 資料庫 schema
├── frontend/          # 前端應用
│   └── src/
│       ├── pages/    # 頁面組件
│       ├── components/ # 共用組件
│       └── store/    # 狀態管理
└── README.md
```

## 🛠️ 技術棧

### 後端
- Node.js + Express + TypeScript
- Prisma ORM
- SQLite（開發）/ PostgreSQL（生產）
- JWT 認證

### 前端
- React + TypeScript
- Vite
- Tailwind CSS
- React Query
- Zustand
- React Router

## 📖 功能清單

### MVP 功能（已完成 80%）

- ✅ 認證系統（LINE/Google 登入模擬）
- ✅ 統編綁定與註冊
- ✅ 庫存上架（手動）
- ✅ 找貨/比價搜尋
- ✅ 下單功能
- ✅ 訂單管理
- ✅ 付款流程（模擬）
- ✅ 物流追蹤（模擬）
- ✅ 驗收功能

### 待完成

- ⏳ LINE Bot 通知
- ⏳ CSV 匯入庫存
- ⏳ 對帳/開票功能
- ⏳ 議價聊天室
- ⏳ 實際 LINE/Google OAuth 整合
- ⏳ 實際 Lalamove API 整合
- ⏳ 實際第三方金流整合

## 🧪 測試

目前系統處於開發階段，主要功能已可測試：

1. **註冊流程**：
   - 訪問 http://localhost:5173
   - 點擊「登入」
   - 使用 LINE 或 Google 登入（模擬）
   - 填寫統編和店家資訊完成註冊

2. **上架商品**：
   - 登入後點擊「我的庫存」
   - 點擊「新增商品」
   - 填寫商品資訊並儲存

3. **找貨下單**：
   - 點擊「找貨」
   - 搜尋商品
   - 點擊商品進入詳情頁
   - 點擊「立即下單」
   - 填寫數量並建立訂單

4. **訂單流程**：
   - 賣家確認訂單
   - 買家付款（模擬）
   - 賣家取得物流報價並派車
   - 買家驗收

## 📝 開發狀態

目前已完成約 **80%** 的核心功能，可以進行完整流程測試。

## 📄 授權

本專案供團隊內部使用。

---

最後更新：2024
