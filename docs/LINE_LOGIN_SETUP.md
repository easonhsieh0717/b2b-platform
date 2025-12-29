# LINE Login 設置指南

## 前置準備

1. 前往 [LINE Developers](https://developers.line.biz/)
2. 登入您的 LINE 帳號
3. 建立新的 Provider（如果還沒有）

## 建立 LINE Login Channel

1. 在 LINE Developers Console 中，點擊「Create」
2. 選擇「LINE Login」
3. 填寫 Channel 資訊：
   - Channel name: `B2B 賣貨便`
   - Channel description: `B2B 店對店急件調貨平台`
   - App type: `Web app`
   - Email address: 您的 Email

## 設置 Callback URL

1. 在 Channel 設定中找到「Callback URL」
2. 添加以下 URL：
   ```
   http://localhost:5173/auth/line/callback
   ```
   如果是生產環境，添加：
   ```
   https://yourdomain.com/auth/line/callback
   ```

## 取得 Channel ID 和 Channel Secret

1. 在 Channel 設定頁面找到：
   - **Channel ID** (Channel ID)
   - **Channel secret** (Channel secret)
2. 複製這兩個值

## 更新環境變數

在 `backend/.env` 檔案中添加：

```env
LINE_CHANNEL_ID=your_channel_id_here
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CALLBACK_URL=http://localhost:5173/auth/line/callback
FRONTEND_URL=http://localhost:5173
```

## 測試流程

1. 啟動後端和前端
2. 訪問登入頁面
3. 點擊「LINE 登入」按鈕
4. 應該會跳轉到 LINE 官方授權頁面
5. 授權後會自動跳轉回應用並完成登入

## 注意事項

- Callback URL 必須與 LINE Developers Console 中設置的完全一致
- 開發環境使用 `http://localhost:5173`
- 生產環境需要使用 HTTPS
- Channel Secret 請妥善保管，不要提交到 Git

## 故障排除

### 錯誤：redirect_uri_mismatch
- 檢查 Callback URL 是否與 LINE Console 中設置的一致
- 確認 URL 沒有多餘的斜線或參數

### 錯誤：invalid_client
- 檢查 Channel ID 和 Channel Secret 是否正確
- 確認環境變數已正確載入

### 無法跳轉到 LINE 授權頁面
- 檢查後端是否正常運行
- 確認 `/api/auth/line/authorize` 路由是否正確
