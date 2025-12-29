# GitHub 設置指南

## 初始化本地倉庫

專案已經初始化了 Git 倉庫，現在需要連接到 GitHub 遠端倉庫。

## 步驟 1：在 GitHub 建立新倉庫

1. 登入 GitHub
2. 點擊右上角的 "+" → "New repository"
3. 輸入倉庫名稱（例如：`b2b-platform`）
4. 選擇公開或私有
5. **不要**初始化 README、.gitignore 或 license（因為本地已經有了）
6. 點擊 "Create repository"

## 步驟 2：連接遠端倉庫

在本地執行以下命令（將 `YOUR_USERNAME` 和 `REPO_NAME` 替換為實際值）：

```bash
# 添加遠端倉庫
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 或使用 SSH
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# 驗證遠端倉庫
git remote -v
```

## 步驟 3：推送初始版本

```bash
# 推送主分支到 GitHub
git push -u origin master

# 如果 GitHub 使用 main 作為預設分支
git branch -M main
git push -u origin main
```

## 步驟 4：設置分支保護規則（可選但建議）

在 GitHub 倉庫設置中：
1. 進入 Settings → Branches
2. 添加分支保護規則
3. 選擇 `main` 或 `master` 分支
4. 啟用：
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

## 日常開發流程

### 建立功能分支

```bash
# 從 develop 建立新分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 開發並提交
git add .
git commit -m "feat: 描述你的功能"

# 推送到遠端
git push origin feature/your-feature-name
```

### 建立 Pull Request

1. 在 GitHub 上點擊 "New Pull Request"
2. 選擇你的功能分支
3. 填寫 PR 描述
4. 請求 Code Review
5. 通過後合併

### 同步最新變更

```bash
# 更新本地 develop 分支
git checkout develop
git pull origin develop

# 在功能分支上同步
git checkout feature/your-feature-name
git merge develop
```

## 標籤管理

### 建立版本標籤

```bash
# 建立標籤
git tag -a v1.0.0 -m "版本 1.0.0 發布"

# 推送標籤到 GitHub
git push origin v1.0.0

# 推送所有標籤
git push origin --tags
```

### 查看標籤

```bash
# 列出所有標籤
git tag

# 查看標籤詳情
git show v1.0.0
```

## 常見問題

### 如何更改遠端倉庫 URL？

```bash
# 查看當前遠端 URL
git remote -v

# 更改遠端 URL
git remote set-url origin NEW_URL
```

### 如何移除遠端倉庫？

```bash
git remote remove origin
```

### 如何從遠端倉庫拉取最新變更？

```bash
# 拉取並合併
git pull origin branch-name

# 只拉取不合併
git fetch origin
```

## 參考資源

- [Git 官方文件](https://git-scm.com/doc)
- [GitHub 文件](https://docs.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
