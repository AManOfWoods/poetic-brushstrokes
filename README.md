# 诗画传情 🎨

> 让古典诗词与AI绘画艺术完美融合的创作平台

一个基于Vue 3的AI诗画创作工具，运用火山引擎豆包大模型，为用户提供"诗生画"和"画生诗"两大核心功能，将中华传统文化与现代AI技术完美结合。

![诗画传情](https://img.shields.io/badge/诗画传情-AI创作平台-brightgreen)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4)

## ✨ 核心功能

### 🖼️ 诗生画
- 输入古诗词或文字描述，AI为您生成精美画作
- 支持四种传统绘画风格：
  - **水墨风** - 传统中国水墨画风格，意境深远
  - **工笔风** - 线条精细，色彩鲜艳的工笔画风格
  - **山水风** - 云雾缭绕的传统山水画风格
  - **古风** - 典雅端庄的古典书画风格

### 📝 画生诗
- 上传画作图片，AI生成对应的诗词内容
- 支持四种传统文学体裁：
  - **古风诗** - 古典风格的五言七言诗
  - **词牌** - 传统词牌风格创作
  - **绝句** - 简洁优美的绝句风格
  - **赋体** - 铺陈描写的赋体风格

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式系统**: Tailwind CSS + 中国传统美学设计
- **AI服务**: 火山引擎豆包大模型
  - 文生图: `doubao-xl`
  - 图生文: `doubao-seed-1.6-vision`
- **UI组件**: 自定义传统风格组件
- **状态管理**: Vue 3 Provide/Inject

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/poetic-brushstrokes.git

# 进入项目目录
cd poetic-brushstrokes

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

项目将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
src/
├── components/           # 组件目录
│   ├── HomePage.vue     # 主页组件
│   ├── TextToImageModule.vue  # 诗生画模块
│   └── ImageToTextModule.vue  # 画生诗模块
├── pages/               # 页面目录
│   └── Home.vue        # 主页面
├── services/           # API服务
│   ├── textToImage.ts  # 诗生画API服务
│   └── imageToText.ts  # 画生诗API服务
├── assets/             # 静态资源
│   └── bg.jpg          # 背景图片
└── main.ts             # 应用入口
```

## 🎨 设计特色

### 传统美学设计系统
- **色彩体系**: 墨洗、丝白、竹绿、山雾等中国传统色彩
- **视觉效果**: 水墨渐变背景、纸质纹理、传统书画意境
- **交互体验**: 流畅的动画过渡、直观的操作界面
- **文化元素**: 融入古典诗词文化的选择器和界面设计

### 响应式设计
- 支持桌面端和移动端访问
- 自适应布局，优雅的视觉呈现
- 精确的8%:80%:12%布局比例设计

## 🔧 核心功能实现

### 全局状态管理
- 使用Vue 3的Provide/Inject实现全局生成状态管理
- 生成过程中自动禁止页面切换，确保流程完整性

### API集成
- 完整的错误处理和用户反馈机制
- 详细的控制台日志记录，便于调试
- 通过Vite代理解决CORS跨域问题

### 智能交互
- 实时清除历史结果和错误信息
- 加载状态指示和进度反馈
- 风格化提示词系统，提升生成质量

## 🚀 部署指南

### Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Netlify部署

1. 在Netlify中连接你的Git仓库
2. 设置构建命令: `npm run build`
3. 设置发布目录: `dist`

## 📖 使用说明

### 诗生画功能
1. 进入"诗生画"页面
2. 在文本框中输入诗词或文字描述
3. 选择喜欢的绘画风格（水墨/工笔/山水/古风）
4. 点击"生成画作"按钮
5. 等待AI生成精美的画作

### 画生诗功能
1. 进入"画生诗"页面
2. 点击上传区域选择图片文件
3. 选择想要的诗词体裁（古风诗/词牌/绝句/赋体）
4. 点击"生成诗词"按钮
5. 欣赏AI创作的诗词作品

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [火山引擎](https://www.volcengine.com/) - 提供强大的AI能力支持
- [Lucide Vue](https://lucide.dev/) - 精美的图标库

---

<div align="center">

**让传统文化在AI时代焕发新的光彩** ✨

[在线体验](http://localhost:5173) | [项目文档](./docs) | [问题反馈](./issues)

</div>
