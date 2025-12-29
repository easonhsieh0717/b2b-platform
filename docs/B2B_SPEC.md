# B2B 賣貨便 × Lalamove（店對店急件調貨）—產品需求與設計總結

> 目的：以 **統編** 作為主鍵識別店家，提供「上架→找貨→議價→付款→派車→對帳」的一條龍流程，達成 **2 小時內同城送達**。

---

## 0. 快速索引（TL;DR）
- 登入：**LINE Login** 或 **Google（Gmail）OAuth**，首次登入即綁定 **統編**。
- 主流程：找貨（30 秒）→ 成交 → **第三方金流代收代付** 或 **白名單自行匯款/月結** → **Lalamove 即時派單** → 到貨驗收與撥款 → 自動對帳。
- 目標 KPI：P50 配送 < 120 分、D7 回購 ≥ 60%、糾紛率 < 1.5%。

---

## 1. 產品定位 & 核心價值
- **定位**：店對店（通訊行/維修店/盤商）即時調貨平台。
- **價值主張**：
  1) **快**：同城 2 小時到店，保成交、不失單。  
  2) **準**：即時庫存、比價、IMEI/序號留存，錯貨率低。  
  3) **穩**：代收代付 + 月結白名單，對帳與開票自動化。

---

## 2. 角色與權限（Personas & RBAC）
- **買方門市（Buyer）**：可搜尋/下單/付款/驗收/開立進貨單。
- **賣方門市（Seller）**：可上架/接單/出貨/請款/開立銷貨單。
- **門市管理者（Manager）**：同一統編下多門市/多使用者，控權限、看報表。
- **平台客服/仲裁（Ops）**：爭議處理、黑白名單、人工媒合（Concierge）。

> 身份主鍵：**統編（company_tax_id）**；分店以 **branch_code** 區分；使用者以 **uid** 綁定。

---

## 3. 功能清單（MVP → Phase 2）

### 3.1 MVP（上線 0–60 天）
- **Auth**：LINE/Google 登入；首次登入需填統編與門市資訊 → 送審，目前未審核權限可以直接流覽。
- **庫存上架**：手動上架 + CSV/Google Sheets 匯入模板。
- **找貨/比價**：以品牌/型號/顏色/容量/等級/區域/距離排序。
- **下單與議價**：即時訊息（內建聊天室）或掛單接單（拍賣式/一口價）。
- **金流**（雙軌）：
  - A. 第三方支付 **代收代付**：虛擬帳號/ATM 為預設（低費），信用卡為備用。
  - B. **白名單自行匯款/月結**：需押金或授信額度，Webhook 回寫入帳。
- **物流**：Lalamove 報價→派車→即時追蹤；到貨掃描 **IMEI/序號/照片**。
- **對帳/開票**：自動彙整月結單、請款單、發票資訊（買/賣雙方）。
- **LINE Bot 通知**：下單、接單、付款確認、司機到店、完成/異常、對帳單。

### 3.2 Phase 2（擴充）
- **缺貨雷達**（安全存量門檻推播）。
- **Pro Seller** 等級（SLA & 排名加權）。
- **糾紛中心**（DOA 24h、仲裁流程、證據鏈）。
- **信用額度/保理**（授信擴張仍走第三方金流撥款）。

---

## 4. 端到端流程（E2E Flows）

### 4.1 註冊與綁定
1) 使用者以 LINE/Google 登入。  
2) 填寫 **統編**、門市資料、負責人與聯絡資訊，上傳營業登記事件照。  
3) 平台審核通過 → 建立公司（company）+ 分店（branch）+ 使用者（user）關係。

### 4.2 找貨與下單
1) 買方輸入型號/零件 → 見清單（按距離/價格/出貨速度排序）。  
2) 點選賣方條目 → 進入詳頁（庫存、近 30 天履約、評價）。  
3) 一鍵下單或訊息議價 → 成交 → 跳至付款。

### 4.3 付款與派車
- **代收代付**：付款（虛擬帳號/ATM/信用卡）→ 金流 Webhook → 系統**自動下 Lalamove**。
- **白名單**：提交付款憑證或月結授信核可 → 系統**自動下 Lalamove**。

### 4.4 出貨與驗收
1) 賣方列印/顯示出貨單 → 打包 → 交車手。  
2) 到貨由買方用 App/小程式掃 **IMEI/序號** 與驗收拍照。  
3) 成功 → 自動請款；失敗 → 進入糾紛流程。

### 4.5 對帳與開票
- 月底自動產出：**對帳總表**、每單細項、平台手續費、金流費用、可開立發票清單。

---

## 5. UI/UX 介面（最小而穩定）

> 原則：**三步內完成關鍵任務**；行動端優先；用固定位置的快速操作條（下單、掃碼、通知）。

### 5.1 首屏（首頁）
- 搜尋列（型號/零件）
- 快速篩選（距離、價格、到貨 SLA）
- 最近下單紀錄（便於複購）

### 5.2 商品清單
- 卡片：縮圖、標題、價格、庫存、距離、**平均到貨時長**、賣家等級徽章。
- 右上角：加入比較、通知我（缺貨雷達）。

### 5.3 詳細頁
- 價格、規格、剩餘量、履約指標（接單時間 P50、糾紛率）。
- 行動鍵：**一鍵下單**、**議價**、**加入常購**。

### 5.4 結帳
- 支付選項（預設虛擬帳號/ATM，信用卡為次要）。
- 收貨門市資訊（自動帶出）、備註。

### 5.5 派送追蹤
- 時間軸：已接單→已取件→配送中→已送達（Lalamove 狀態同步）。

### 5.6 驗收與請款
- 掃碼（IMEI/序號）→ 拍照 → 完成 → 自動請款。

### 5.7 對帳中心
- 月度卡片：應收/應付、平台費、金流費、下載 CSV/PDF。

### 5.8 LINE Mini-UI（行動輕量版）
- **Rich Menu**：找貨｜我的訂單｜上架｜通知中心｜對帳。
- Quick Reply：常購零件、最近 3 筆下單、缺貨雷達一鍵發單。

---

## 6. LINE 群快速推廣（Growth Kit）
- **LINE Login**：一鍵登入 → 彈出「填統編」→ 完成綁定。
- **群貼文模板**（三行文案 + 圖卡）：
  1) 缺貨不用等 D+2，**同城 2 小時到店**。  
  2) 即時比價，上百門市庫存一鍵搜。  
  3) 用 LINE 登入、綁統編就能用。
- **邀請獎勵**：完成首單雙方各得 NT$150 點數（可折抵配送/平台費）。
- **群內機器人**：輸入「#找 iPhone 15 256G 藍」→ 回傳前三名即時報價卡片。

---

## 7. 資料模型（Data Model）

### 7.1 主鍵與關聯
- `company`（PK: **company_tax_id**）
- `branch`（PK: **company_tax_id + branch_code**）
- `user`（PK: uid；FK: company_tax_id, branch_code）
- `inventory_item`（PK: item_id；FK: company_tax_id, branch_code）
- `order`（PK: order_id；FK: buyer_company_tax_id, seller_company_tax_id）
- `payment`（PK: payment_id；FK: order_id）
- `shipment`（PK: shipment_id；FK: order_id）
- `dispute`（PK: dispute_id；FK: order_id）

### 7.2 重要欄位
- `inventory_item`: brand, model, spec, color, grade, qty, price, **imei_required:boolean**
- `order`: items[], amount, **payment_mode**(escrow|bank_transfer|credit|net_terms), status
- `shipment`: provider(lalamove), quote, eta_min/max, status, **proof_photos[]**, imei_list[]
- `payment`: method(virtual_account|atm|card), fee, status, webhook_payload
- `company`: name, company_tax_id, kyc_docs, risk_level
- `user`: uid, provider(line|google), email/line_id, roles[], last_login

---

## 8. API 草案（REST）
- **Auth**
  - `POST /auth/line`、`POST /auth/google` → JWT + 首登綁定統編
- **Company/Branch**
  - `POST /company/bind`（上傳 KYC、統編）
  - `GET /company/:tax_id`
- **Inventory**
  - `POST /inventory/import`（CSV/Sheets）
  - `GET /inventory/search?q=...&geo=...`
  - `POST /inventory`（上架/更新）
- **Order**
  - `POST /orders`（建立/議價參數）
  - `GET /orders/:id`
  - `POST /orders/:id/confirm`
- **Payment**
  - `POST /payments/:orderId/prepare`（代收代付 or 白名單）
  - `POST /webhooks/payment`（第三方金流 Webhook）
- **Shipment（Lalamove）**
  - `POST /shipments/:orderId/quote`
  - `POST /shipments/:orderId/dispatch`
  - `POST /webhooks/lalamove`（狀態回推）
- **Receipt/Settlement**
  - `GET /settlements/monthly?tax_id=...`
- **Dispute**
  - `POST /disputes`、`POST /disputes/:id/resolve`

> 安全：所有端點需 JWT + RBAC；Webhook 以簽名/時間戳驗證。

---

## 9. 事件流（States & Webhooks）
**ORDER**：`CREATED → CONFIRMED → PAID|AUTHORIZED → DISPATCHED → DELIVERED → ACCEPTED|DISPUTED → SETTLED`

**PAYMENT**：`PENDING → PAID → RELEASED|REFUND_PENDING|REFUNDED`

**SHIPMENT**（Lalamove）：`QUOTED → DRIVER_ASSIGNED → PICKED_UP → DELIVERED → PROOF_UPLOADED`

---

## 10. 金流策略（雙軌）
- **代收代付（預設）**：虛擬帳號/ATM 低費為主；信用卡備用；Webhook 後自動派車。
- **白名單**：自行匯款/Net-7/Net-14，需押金或額度；對賣家「到貨即撥」T+0/T+1。
- **費用呈現**：平台服務費（% + 封頂）與金流費分開顯示；支援月彙整撥款。

---

## 11. 風險控管（Risk & Compliance）
- **KYC**：統編 + 門市照片 + 雙證；黑名單共享。
- **交易保障**：IMEI/序號/開箱照；DOA 24h；仲裁流程（Ops 介入）。
- **濫補/刷量**：新戶補貼限 14 天或 3 單；裝置指紋與 IP 限制；異常模型（Z-score）。
- **合規**：第三方支付代收代付與信託帳戶；隱私與稽核日志保留 180–365 天。

---

## 12. 指標與監控（Metrics & Monitoring）
- **供需**：匹配時間（P50/P90）、回覆率、有效庫存深度。
- **體驗**：配送耗時、準時率、糾紛率、NPS。
- **經濟**：GMV、Take Rate、補貼/GMV、金流費/GMV。
- **留存**：D7/D30 回購、月結逾期率。
- **監控**：API 成功率、Webhook 延遲、錯誤碼、風控告警（Slack/LINE）。

---

## 13. 發佈與推廣（Go-to-Market）
- **封閉測試**：雙北 30 家（20 供給/10 需求），跑 30 天。
- **誘因**：新戶 3 單免平台費 + 配送補貼券；「準時到」承諾（逾時退 50% 配送費點數）。
- **LINE 群套件**：
  - 圖卡（三張）：價值主張、流程圖、見證。
  - 標準貼文：三行文案 + 登入連結 + QR Code。
  - 指令：`#找 <品名>`、`#上架`、`#對帳`。

---

## 14. 非功能性需求（NFR）
- **可用性**：> 99.5%（營業時段）；**資料一致性**優先於最終一致。
- **效能**：搜尋 < 500ms（P95）、結帳頁 < 1.2s 首屏可互動。
- **安全**：JWT 旋轉、WAF、IP 白名單管理後台、資料加密（靜態/傳輸）。
- **備援**：多區域備份、RPO ≤ 15 分、RTO ≤ 60 分。

---

## 15. 系統設定（Env & Secrets）
- `LINE_CHANNEL_ID / LINE_CHANNEL_SECRET`
- `GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET`
- `PAYMENT_PROVIDER_*`（API keys, webhook secrets）
- `LALAMOVE_API_KEY / SECRET`
- `JWT_SECRET / ISSUER / AUDIENCE`
- `DB_URL`、`STORAGE_BUCKET`

---

## 16. 測試與驗收（UAT 清單）
- Auth：LINE/Google 登入，統編綁定與重綁保護。
- 搜尋：多條件篩選、距離排序、空庫存隱藏。
- 下單：議價 → 成交 → 代收代付付款 → Webhook → 派車。
- 物流：Lalamove 狀態全鏈打通；異常（拒收/無人/改址）覆盤。
- 驗收：IMEI/序號掃碼與照片上傳、離線補傳。
- 對帳：月結報表數值核對、CSV/PDF 匯出、發票資訊。

---

## 17. 路線圖（Roadmap）
- **M0–M2**：MVP（上述 3.1 全部）
- **M3–M4**：缺貨雷達、Pro Seller、糾紛中心
- **M5–M6**：信用額度/保理、區域擴張、POS/庫存 API 串接

## 18. 版本控制（Github）

---

## 19. 授權與版權
- 本文件供團隊內部產品/工程/營運協作使用；對外引用請覆核最新版本。
