# GitHub 上传和部署教程

**10分钟完成，配图说明，零基础可学**

---

## 准备工作（确认你有这些）

- ✅ 代码已经在本地（就是你现在的项目）
- ✅ 已经提交到Git（刚才已完成）
- ✅ 有GitHub账号（没有的话去 https://github.com 注册）

---

## 第一步：在GitHub上创建仓库

### 1. 登录GitHub

浏览器打开：https://github.com

### 2. 点击右上角 "+" → "New repository"

```
┌──────────────────────┐
│  +  ▼               │  ← 点这里
│  └─ New repository  │
└──────────────────────┘
```

### 3. 填写仓库信息

**Repository name（仓库名）：** `poetic-brushstrokes`
或者你喜欢的名字，只能用英文和连字符

**Description（描述，可选）：**
```
诗画传情 - AI诗画创作工具。输入古诗词生成绘画，上传图片生成诗词。
```

**Public/Private（公开/私有）：**
- 选 **Public**（公开，免费部署）
- 或 **Private**（私有，需要付费部署）

**❌ 不要勾选任何初始化选项：**
- ❌ Add a README file
- ❌ Add .gitignore
- ❌ Choose a license

（因为我们已经有这些文件了）

### 4. 点击绿色按钮 "Create repository"

---

## 第二步：连接本地和GitHub仓库

### 创建完仓库后，GitHub会显示一堆命令

你会看到类似这样的页面：

```
Quick setup — if you've done this kind of thing before
...or push an existing repository from the command line

git remote add origin https://github.com/你的用户名/poetic-brushstrokes.git
git branch -M main
git push -u origin main
```

### 复制这些命令（重要！）

**方法1：** 手动复制上面3条命令

**方法2：** 点击命令右边的复制按钮📋

---

## 第三步：在终端执行命令

### 打开你的终端（Terminal）

**Mac：** 按 `Command + Space`，输入 `Terminal`

**当前你应该已经在项目目录里了**

### 执行命令（把刚才复制的命令粘贴进去）

**注意：把下面的命令替换成你从GitHub复制的！**

```bash
# 添加远程仓库（把 YOUR_USERNAME 替换成你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/poetic-brushstrokes.git

# 重命名分支为main
git branch -M main

# 推送代码到GitHub
git push -u origin main
```

**实际命令示例：**
如果你的GitHub用户名是 `andy123`，命令就是：
```bash
git remote add origin https://github.com/andy123/poetic-brushstrokes.git
git branch -M main
git push -u origin main
```

### 第一次推送需要登录

**会弹出登录窗口：**
- 输入你的GitHub用户名
- 输入密码（或Personal Access Token）

**如果提示需要Token：**
1. 去 https://github.com/settings/tokens
2. 点 "Generate new token" → "Classic"
3. 勾选 `repo` 权限
4. 点 "Generate token"
5. 复制Token（只显示一次，保存好）
6. 在密码框粘贴Token

### 看到这样的输出就成功了！

```
Enumerating objects: 53, done.
Counting objects: 100% (53/53), done.
Delta compression using up to 8 threads
Compressing objects: 100% (48/48), done.
Writing objects: 100% (53/53), 2.45 MiB | 1.23 MiB/s, done.
Total 53 (delta 3), reused 0 (delta 0), pack-reused 0
To https://github.com/YOUR_USERNAME/poetic-brushstrokes.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 第四步：确认代码已上传

### 刷新GitHub页面

回到浏览器，刷新你的仓库页面，应该看到：

```
┌──────────────────────────────────┐
│ poetic-brushstrokes              │
│                                  │
│ 📂 src/                          │
│ 📂 public/                       │
│ 📄 package.json                  │
│ 📄 README.md                     │
│ ...更多文件                       │
│                                  │
│ 53 files · 12092 insertions     │
└──────────────────────────────────┘
```

✅ **成功！代码已经在GitHub上了！**

---

## 第五步：部署上线（选择方案）

现在有2个免费部署方案，都超简单：

### 方案A：Vercel（推荐，最简单）

### 方案B：Netlify（备选）

---

## 🚀 方案A：用Vercel部署（3分钟上线）

### 1. 登录Vercel

浏览器打开：https://vercel.com

点 "Sign Up"（注册）或 "Login"（登录）

**建议：用GitHub账号登录**（一键授权，超方便）

### 2. 导入项目

登录后，点 **"Add New..."** → **"Project"**

### 3. 从GitHub导入

**看到你的GitHub仓库列表：**

找到 `poetic-brushstrokes`，点 **"Import"**

### 4. 配置项目（重要！）

**Framework Preset：** 选 `Vite`

**Root Directory：** 保持默认 `./`

**Build Command：** 自动填写 `npm run build` ✅

**Output Directory：** 自动填写 `dist` ✅

**Environment Variables（环境变量）：**

⚠️ **重要：需要添加API密钥**

点 "Add" 添加环境变量：

```
变量名：VITE_DOUBAO_API_KEY
值：你的火山引擎API密钥
```

```
变量名：VITE_DOUBAO_BASE_URL
值：https://ark.cn-beijing.volces.com/api/v3
```

### 5. 点击 "Deploy"

等待1-2分钟，看到：

```
🎉 Congratulations!
Your project has been deployed!

Visit: https://poetic-brushstrokes.vercel.app
```

✅ **上线成功！点链接就能访问！**

---

## 🚀 方案B：用Netlify部署（备选）

### 1. 登录Netlify

浏览器打开：https://www.netlify.com

点 "Sign Up"（注册）或 "Login"（登录）

**建议：用GitHub账号登录**

### 2. 导入项目

点 **"Add new site"** → **"Import an existing project"**

### 3. 选择GitHub

点 **"GitHub"**，授权Netlify访问你的仓库

### 4. 选择仓库

找到 `poetic-brushstrokes`，点击

### 5. 配置部署

**Build command：** `npm run build`

**Publish directory：** `dist`

**环境变量（Environment variables）：**

点 "Show advanced" → "New variable"

添加：
```
VITE_DOUBAO_API_KEY = 你的API密钥
VITE_DOUBAO_BASE_URL = https://ark.cn-beijing.volces.com/api/v3
```

### 6. 点击 "Deploy site"

等待1-2分钟，看到：

```
Site is live!
https://your-site-name.netlify.app
```

✅ **上线成功！**

---

## 常见问题

### Q1：API密钥怎么获取？

**A：**
1. 登录火山引擎控制台
2. 找到API密钥管理
3. 创建新密钥
4. 复制密钥（只显示一次）

### Q2：部署后图片不显示？

**A：** 检查 `public/poetry-images/` 文件夹里的图片是否都上传了

### Q3：部署后功能不工作？

**A：** 检查环境变量是否正确设置

### Q4：想修改代码重新部署？

**A：**
```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push

# Vercel/Netlify会自动重新部署！
```

### Q5：域名太长，想换成自己的域名？

**A：**

**Vercel：** Settings → Domains → Add
**Netlify：** Site settings → Domain management → Add custom domain

---

## 后续维护

### 每次修改代码后：

```bash
# 1. 添加修改的文件
git add .

# 2. 提交
git commit -m "修改说明"

# 3. 推送到GitHub
git push

# 4. 自动部署（Vercel/Netlify会自动检测并重新部署）
```

### 查看部署历史

**Vercel：** Deployments 标签页
**Netlify：** Deploys 标签页

---

## 成功检查清单

- ✅ 代码在GitHub上能看到
- ✅ Vercel/Netlify显示 "Deployment successful"
- ✅ 访问网址能打开页面
- ✅ 功能正常工作
- ✅ 图片正常显示

---

## 分享你的作品

### 获取链接

**Vercel：** `https://your-project.vercel.app`
**Netlify：** `https://your-project.netlify.app`

### 修改README.md

在GitHub仓库里添加：

```markdown
## 在线访问

🌐 **线上地址：** https://your-project.vercel.app

## 功能特色

- 诗生画：输入古诗词，AI生成绘画
- 画生诗：上传图片，AI创作诗词
- 美育诗词推荐窗口
- 系统设置（背景、窗口大小）
- 收藏管理
```

---

## 恭喜你！🎉

你的作品已经上线，全世界都能访问了！

**接下来可以：**
- 分享给朋友和家人
- 放到简历里（展示你的项目）
- 继续添加新功能
- 收集用户反馈改进

---

**有问题随时问我！** 💬
