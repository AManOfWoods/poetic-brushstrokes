# Render 部署教程

**5分钟上线，超级简单**

---

## 前提条件

✅ 代码已经推送到GitHub（刚才已完成）
✅ 有Render账号（没有的话现在注册）

---

## 步骤1：登录Render

### 打开浏览器

访问：**https://dashboard.render.com/**

### 注册/登录

**推荐：用GitHub账号登录**（一键授权，超方便）

1. 点击 **"Sign Up"** 或 **"Get Started"**
2. 选择 **"GitHub"**
3. 授权Render访问你的GitHub仓库

---

## 步骤2：创建新服务

### 点击 "New +"

在页面右上角，点击 **"New +"** 按钮

### 选择 "Static Site"

```
┌─────────────────────────┐
│ New +                   │
│ ├─ Web Service          │
│ ├─ Static Site    ← 选这个
│ ├─ Private Service      │
│ └─ ...                  │
└─────────────────────────┘
```

---

## 步骤3：连接GitHub仓库

### 方法1：从列表选择

如果你看到仓库列表，找到：

**poetic-brushstrokes**

点击右边的 **"Connect"** 按钮

---

### 方法2：手动输入

如果看不到仓库，点 **"Configure account"**：

1. 授权Render访问你的GitHub
2. 选择 **"Only select repositories"**
3. 选择 **"poetic-brushstrokes"**
4. 点 **"Install"**

回到Render，刷新页面，就能看到仓库了

---

## 步骤4：配置部署设置

### 基本设置

**Name（网站名称）：**
```
poetic-brushstrokes
```
（或者你喜欢的名字，会影响URL）

**Branch（分支）：**
```
main
```

**Root Directory（根目录）：**
```
留空（或填 . ）
```

---

### 构建设置

**Build Command（构建命令）：**
```
npm install && npm run build
```

**Publish Directory（发布目录）：**
```
dist
```

---

### 环境变量（重要！）

点击 **"Advanced"** 展开高级设置

#### 添加Node版本

点 **"Add Environment Variable"**

```
Key:   NODE_VERSION
Value: 18
```

#### 添加API密钥（如果需要）

再次点 **"Add Environment Variable"**

```
Key:   VITE_DOUBAO_API_KEY
Value: （粘贴你的火山引擎API密钥）
```

```
Key:   VITE_DOUBAO_BASE_URL
Value: https://ark.cn-beijing.volces.com/api/v3
```

⚠️ **注意：** 如果你的API密钥是在前端调用的，这里需要添加。但更安全的做法是通过后端代理。

---

## 步骤5：部署！

### 点击 "Create Static Site"

点击页面底部的蓝色按钮

### 等待部署

会看到构建日志：

```
==> Cloning from https://github.com/AManOfWoods/poetic-brushstrokes...
==> Running build command 'npm install && npm run build'
==> Installing dependencies...
==> Building Vite project...
==> Build successful!
==> Your site is live at https://poetic-brushstrokes.onrender.com
```

**大约需要2-3分钟**

---

## 步骤6：访问你的网站

### 部署成功！

看到绿色的 **"Live"** 标志

### 点击网址

```
https://poetic-brushstrokes.onrender.com
```

或者你自定义的URL

**🎉 网站上线了！**

---

## 配置自定义域名（可选）

### 在Render面板

1. 点击你的网站
2. 左侧菜单选择 **"Settings"**
3. 找到 **"Custom Domains"**
4. 点击 **"Add Custom Domain"**
5. 输入你的域名（比如 `www.yoursite.com`）
6. 按提示在域名注册商那里添加DNS记录

---

## 自动部署

### 每次推送代码到GitHub，Render会自动重新部署！

```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push

# Render会自动检测并重新部署！
```

### 查看部署历史

点击左侧菜单的 **"Deploys"**，可以看到所有部署记录

---

## 常见问题

### Q1：部署失败怎么办？

**A：** 点击失败的部署，查看日志：

常见原因：
1. **构建命令错误** → 检查 `package.json` 的 `scripts`
2. **Node版本不对** → 确认环境变量 `NODE_VERSION` 为 `18`
3. **依赖安装失败** → 检查 `package.json` 是否完整

---

### Q2：图片不显示？

**A：** 检查：
1. 图片是否在 `public/` 目录
2. 图片路径是否正确（绝对路径如 `/poetry-images/1.png`）
3. 图片是否已推送到GitHub

---

### Q3：API功能不工作？

**A：** 检查：
1. 环境变量是否正确设置
2. API密钥是否有效
3. 后端服务（server.cjs）是否需要单独部署

⚠️ **重要：**
- 静态网站部署**不包含后端**
- 如果你的 `server.cjs` 需要运行，需要创建一个 **Web Service**

---

### Q4：免费版有什么限制？

**A：** Render免费版：
- ✅ 无限静态网站
- ✅ 自定义域名
- ✅ 自动HTTPS
- ✅ 自动部署
- ⚠️ 网站闲置后会休眠（访问时需要几秒唤醒）
- ⚠️ 每月100GB带宽

---

### Q5：需要部署后端吗？

**A：** 查看你的 `server.cjs`：

如果只是代理API请求，有两个选择：

**方案1：只部署前端**（静态网站）
- 前端直接调用火山引擎API
- 需要在Render添加环境变量
- 简单快速

**方案2：前端+后端分别部署**
- 前端：Static Site
- 后端：Web Service（需要另外创建）
- 更安全，API密钥不暴露

---

## 部署后端（如果需要）

### 创建Web Service

1. 点击 **"New +"** → **"Web Service"**
2. 连接同一个GitHub仓库
3. 配置：

```
Name: poetic-brushstrokes-api
Branch: main
Root Directory: .
Build Command: npm install
Start Command: node server.cjs
```

4. 环境变量：

```
VITE_DOUBAO_API_KEY = 你的密钥
VITE_DOUBAO_BASE_URL = https://ark.cn-beijing.volces.com/api/v3
PORT = 10000
```

5. 点击 **"Create Web Service"**

6. 记下后端URL（如 `https://poetic-brushstrokes-api.onrender.com`）

7. 修改前端代码，API请求指向后端URL

---

## 监控和日志

### 查看访问日志

左侧菜单 → **"Logs"**

### 查看部署状态

左侧菜单 → **"Deploys"**

### 性能监控

左侧菜单 → **"Metrics"**（付费版功能）

---

## 对比：Render vs Vercel vs Netlify

| 特性 | Render | Vercel | Netlify |
|------|--------|--------|---------|
| **静态网站** | ✅ 免费 | ✅ 免费 | ✅ 免费 |
| **后端部署** | ✅ 支持 | ⚠️ Serverless | ⚠️ Functions |
| **数据库** | ✅ 支持 | ❌ | ❌ |
| **自定义域名** | ✅ 免费 | ✅ 免费 | ✅ 免费 |
| **自动HTTPS** | ✅ | ✅ | ✅ |
| **冷启动** | ⚠️ 有（免费版） | ✅ 无 | ✅ 无 |
| **构建速度** | 中等 | 快 | 快 |
| **适合场景** | 全栈应用 | 前端+边缘计算 | 前端+JAMstack |

---

## 成功检查清单

- ✅ 在Render创建了Static Site
- ✅ 连接了GitHub仓库
- ✅ 配置了构建命令和发布目录
- ✅ 添加了环境变量（如果需要）
- ✅ 部署显示 "Live"
- ✅ 访问URL能打开网站
- ✅ 功能正常工作

---

## 下一步

### 分享你的作品

你的网站URL：
```
https://poetic-brushstrokes.onrender.com
```

可以分享给朋友、家人，或放到简历里！

### 持续改进

- 每次修改代码，`git push` 后自动部署
- 在Render面板查看部署日志
- 根据用户反馈持续优化

---

## 需要帮助？

📧 Render官方文档：https://render.com/docs
💬 有问题随时问我！

---

**恭喜你！🎉 网站已经上线了！**
