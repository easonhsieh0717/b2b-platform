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

- Node.js 18+ 或 Python 3.9+
- 資料庫（PostgreSQL/MySQL）
- LINE Developer Account
- Google OAuth Credentials
- 第三方金流服務（代收代付）
- Lalamove API 金鑰

### 安裝步驟

```bash
# 複製環境變數範本
cp .env.example .env

# 安裝依賴（根據使用的技術棧）
npm install
# 或
pip install -r requirements.txt

# 執行資料庫遷移
npm run migrate
# 或
python manage.py migrate

# 啟動開發伺服器
npm run dev
# 或
python manage.py runserver
```

## 📁 專案結構

```
B2B/
├── docs/              # 文件
│   └── B2B_SPEC.md   # 產品規格文件
├── backend/           # 後端 API
├── frontend/          # 前端應用
├── mobile/            # 行動應用
├── line-bot/          # LINE Bot 服務
├── tests/             # 測試
└── README.md          # 本文件
```

## 🔑 環境變數

請參考 `.env.example` 設定以下環境變數：

- `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `PAYMENT_PROVIDER_*` (API keys, webhook secrets)
- `LALAMOVE_API_KEY` / `LALAMOVE_SECRET`
- `JWT_SECRET` / `JWT_ISSUER` / `JWT_AUDIENCE`
- `DB_URL`
- `STORAGE_BUCKET`

## 📖 文件

詳細的產品規格與設計文件請參考：[B2B_SPEC.md](./B2B_SPEC.md)

## 🛠️ 開發

### 技術棧（待決定）

- 後端：Node.js / Python
- 前端：React / Vue
- 資料庫：PostgreSQL / MySQL
- 快取：Redis
- 訊息佇列：RabbitMQ / AWS SQS

### 開發流程

1. 從 `main` 分支建立功能分支
2. 開發並提交變更
3. 建立 Pull Request
4. 通過 Code Review 後合併

## 📝 版本控制

本專案使用 Git 進行版本控制，所有變更都會記錄在 GitHub 上。

### 提交規範

- `feat`: 新功能
- `fix`: 修復問題
- `docs`: 文件更新
- `style`: 程式碼格式調整
- `refactor`: 重構
- `test`: 測試相關
- `chore`: 建置/工具相關

## 🧪 測試

```bash
# 執行測試
npm test
# 或
pytest

# 測試覆蓋率
npm run test:coverage
```

## 📊 目標 KPI

- P50 配送時間 < 120 分鐘
- D7 回購率 ≥ 60%
- 糾紛率 < 1.5%

## 📅 路線圖

- **M0–M2**：MVP（核心功能）
- **M3–M4**：缺貨雷達、Pro Seller、糾紛中心
- **M5–M6**：信用額度/保理、區域擴張、POS/庫存 API 串接

## 👥 貢獻

歡迎提交 Issue 和 Pull Request。

## 📄 授權

本專案供團隊內部使用。

---

最後更新：2024
