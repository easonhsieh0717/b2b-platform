# GitHub 倉庫建立步驟

## 快速建立倉庫

請按照以下步驟在 GitHub 上建立新倉庫：

### 步驟 1：登入 GitHub
前往 https://github.com 並登入您的帳號（easonhsieh0717）

### 步驟 2：建立新倉庫
1. 點擊右上角的 **"+"** 圖示
2. 選擇 **"New repository"**

### 步驟 3：填寫倉庫資訊
- **Repository name**: `b2b-platform`
- **Description**: `B2B 賣貨便 × Lalamove（店對店急件調貨平台）`
- **Visibility**: 選擇 **Private**（私有）或 **Public**（公開）
- **重要**：**不要**勾選以下選項：
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

因為本地已經有這些文件了。

### 步驟 4：建立倉庫
點擊 **"Create repository"** 按鈕

### 步驟 5：完成後通知
建立完成後，告訴我，我會立即推送代碼到 GitHub。

---

## 或者使用 GitHub CLI（如果已安裝）

```bash
gh repo create b2b-platform --private --description "B2B 賣貨便 × Lalamove（店對店急件調貨平台）" --source=. --remote=origin --push
```
