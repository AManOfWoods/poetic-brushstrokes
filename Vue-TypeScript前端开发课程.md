# Vue.js + TypeScript 前端开发课程
## 基于"诗画传情"项目的实战教学

---

## 课程概览

### 目标学员
- 具备 HTML/CSS/JavaScript 基础知识的初学者
- 希望学习现代前端框架的开发者
- 对文化创意类项目感兴趣的学习者

### 学习成果
完成本课程后，您将能够：
1. 掌握 Vue 3 Composition API 的核心概念和使用方法
2. 熟练使用 TypeScript 进行类型安全的前端开发
3. 运用 Tailwind CSS 快速构建美观的用户界面
4. 实现文件上传、数据持久化等常见前端功能
5. 集成第三方 AI 服务（文生图、图生文）
6. 独立完成一个完整的全栈式前端应用

### 预计学习时长
40-50 小时（包含实践练习）

---

## 模块一：环境搭建与项目初始化

### 学习目标
- 理解现代前端工具链的作用
- 掌握 Vite 项目的创建和配置
- 了解项目目录结构的最佳实践

### 核心概念
1. **Vite 构建工具**：下一代前端构建工具，特点是快速的冷启动和热更新
2. **TypeScript**：JavaScript 的超集，提供静态类型检查
3. **Tailwind CSS**：实用优先的 CSS 框架

### 实践步骤

#### 1.1 创建 Vue + TypeScript 项目
```bash
# 使用 Vite 创建项目
npm create vite@latest poetic-brushstrokes -- --template vue-ts

# 进入项目目录
cd poetic-brushstrokes

# 安装依赖
npm install
```

**为什么使用 Vite？**
传统的 webpack 在大型项目中启动慢，而 Vite 利用浏览器原生 ES 模块支持，实现秒级启动和即时热更新。

#### 1.2 安装项目依赖
```bash
# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装 UI 图标库
npm install lucide-vue-next

# 安装工具库
npm install axios marked class-variance-authority clsx tailwind-merge
```

#### 1.3 配置 Tailwind CSS
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink-wash': '#2C3E50',
        'bamboo-green': '#7CB342',
        'silk-white': '#FAF9F6',
        'mountain-mist': '#95A5A6',
        'accent': '#E67E22',
      },
    },
  },
  plugins: [],
}
```

**设计思路**：自定义颜色主题符合中国风美学，如"墨色"、"竹绿"、"丝白"等。

### 练习任务
1. 创建一个新的 Vite + Vue + TypeScript 项目
2. 配置 Tailwind CSS 并验证是否生效
3. 创建一个简单的 Hello World 组件，使用自定义颜色

### 常见问题
**Q：为什么选择 TypeScript 而不是纯 JavaScript？**
A：TypeScript 提供类型检查，能在编译阶段发现错误，减少运行时 bug，特别适合中大型项目。

**Q：Tailwind CSS 会增加最终打包体积吗？**
A：不会。Tailwind 使用 PurgeCSS 自动删除未使用的样式，最终打包体积很小。

---

## 模块二：Vue 3 Composition API 基础

### 学习目标
- 理解 Composition API 相对于 Options API 的优势
- 掌握 ref、reactive、computed 等核心响应式 API
- 学会组件间通信（props、emit）

### 核心概念

#### 2.1 为什么使用 Composition API？
Options API（选项式）虽然简单，但在大型组件中，逻辑分散在 data、methods、computed 等不同选项中，难以维护。Composition API 允许按逻辑功能组织代码。

#### 2.2 响应式数据：ref vs reactive

**ref** - 用于基本类型数据
```typescript
import { ref } from 'vue'

const count = ref(0)
const name = ref('张三')

// 访问值需要 .value
console.log(count.value) // 0
count.value++
```

**reactive** - 用于对象类型数据
```typescript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: '张三', age: 20 }
})

// 直接访问属性
console.log(state.count) // 0
state.count++
```

**项目实例**：在诗生画模块中
```typescript
// src/components/TextToImageModule.vue
const inputText = ref('')  // 用户输入的诗词文本
const selectedStyle = ref('ink-wash')  // 选中的风格
const generatedImage = ref<string | null>(null)  // 生成的图片 URL
```

#### 2.3 计算属性 computed
```typescript
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 计算属性会自动追踪依赖，依赖变化时重新计算
const fullName = computed(() => {
  return firstName.value + lastName.value
})
```

**项目实例**：背景样式计算
```typescript
// src/pages/Home.vue
const customBackground = ref<string>('')

const backgroundStyle = computed(() => {
  if (customBackground.value) {
    return {
      backgroundImage: `url(${customBackground.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {}
})
```

### 实战案例：创建诗词推荐组件

```vue
<template>
  <div class="poetry-card">
    <h3>{{ poetry.title }}</h3>
    <p>{{ poetry.content }}</p>
    <button @click="handleLike">
      {{ liked ? '已收藏' : '收藏' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义类型接口
interface Poetry {
  title: string
  content: string
  author: string
}

// 接收父组件传递的数据
const props = defineProps<{
  poetry: Poetry
}>()

// 定义事件
const emit = defineEmits<{
  liked: [title: string]
}>()

// 本地状态
const liked = ref(false)

// 事件处理函数
const handleLike = () => {
  liked.value = !liked.value
  if (liked.value) {
    emit('liked', props.poetry.title)
  }
}
</script>
```

### 练习任务
1. 创建一个计数器组件，使用 ref 和 computed
2. 创建一个用户信息展示组件，使用 reactive
3. 实现父子组件通信：父组件传递诗词数据，子组件点击时通知父组件

### 常见陷阱
1. **忘记 .value**：使用 ref 时忘记 `.value` 是最常见错误
2. **解构 reactive 失去响应性**：`const { count } = reactive({ count: 0 })` 会失去响应性
3. **在模板中不需要 .value**：模板会自动解包

---

## 模块三：组件化开发与路由管理

### 学习目标
- 掌握单文件组件（SFC）的结构
- 理解组件生命周期钩子
- 学会组件复用和模块化设计

### 核心概念

#### 3.1 单文件组件（SFC）结构
```vue
<template>
  <!-- 模板：定义 HTML 结构 -->
</template>

<script setup lang="ts">
  // 逻辑：使用 Composition API
</script>

<style scoped>
  /* 样式：scoped 确保样式仅作用于当前组件 */
</style>
```

#### 3.2 生命周期钩子
```typescript
import { onMounted, onUnmounted, watch } from 'vue'

// 组件挂载后执行
onMounted(() => {
  console.log('组件已挂载')
  // 适合：启动定时器、加载数据、添加事件监听
})

// 组件卸载前执行
onUnmounted(() => {
  console.log('组件即将卸载')
  // 适合：清除定时器、移除事件监听、释放资源
})

// 监听数据变化
watch(() => props.value, (newVal, oldVal) => {
  console.log('数据变化', newVal, oldVal)
})
```

**项目实例**：画生诗模块的轮播功能
```typescript
// src/components/ImageToTextModule.vue
const currentExampleIndex = ref(0)
let carouselTimer: number | null = null

const startCarousel = () => {
  carouselTimer = window.setInterval(() => {
    currentExampleIndex.value =
      (currentExampleIndex.value + 1) % exampleImages.length
  }, 5000)
}

onMounted(() => {
  startCarousel()  // 组件挂载时启动轮播
})

onUnmounted(() => {
  if (carouselTimer) {
    clearInterval(carouselTimer)  // 组件卸载时清除定时器
  }
})
```

**为什么要清除定时器？**
如果不清除，组件销毁后定时器仍在运行，造成内存泄漏。

#### 3.3 组件通信模式

**1. Props（父→子）**
```typescript
// 父组件
<PoetryWidget :widget-size="widgetSize" />

// 子组件
const props = defineProps<{
  widgetSize?: string
}>()
```

**2. Emits（子→父）**
```typescript
// 子组件
const emit = defineEmits<{
  'select-poetry': [text: string]
}>()

emit('select-poetry', poetryText)

// 父组件
<PoetryWidget @select-poetry="handlePoetrySelect" />
```

**3. Provide/Inject（跨层级通信）**
```typescript
// 祖先组件
import { provide, ref } from 'vue'

const isGenerating = ref(false)
provide('isGenerating', isGenerating)

// 后代组件
import { inject } from 'vue'

const globalIsGenerating = inject<any>('isGenerating')
```

**项目实例**：全局生成状态管理
```typescript
// src/pages/Home.vue（根组件）
const isGenerating = ref(false)
provide('isGenerating', isGenerating)

// src/components/TextToImageModule.vue（子组件）
const globalIsGenerating = inject<any>('isGenerating')

watch(isGenerating, (newValue) => {
  if (globalIsGenerating) {
    globalIsGenerating.value = newValue
  }
})
```

**设计意图**：多个模块需要知道当前是否有 AI 生成任务在运行，以禁用某些操作（如切换页面）。

### 实战案例：构建导航栏组件

```vue
<template>
  <div class="nav-container">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="handleTabClick(tab.value)"
      :class="[
        'nav-button',
        activeTab === tab.value ? 'active' : 'inactive'
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  value: string
  label: string
}

const tabs: Tab[] = [
  { value: 'home', label: '诗画传情' },
  { value: 'text-to-image', label: '诗生画' },
  { value: 'image-to-text', label: '画生诗' },
  { value: 'favorites', label: '我的收藏' }
]

const activeTab = ref('home')

const handleTabClick = (tab: string) => {
  activeTab.value = tab
}
</script>

<style scoped>
.nav-container {
  display: flex;
  gap: 0.5rem;
  background: white;
  border-radius: 9999px;
  padding: 0.5rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.3s;
}

.nav-button.active {
  background: linear-gradient(to right, #E67E22, #D35400);
  color: white;
}

.nav-button.inactive {
  color: #95A5A6;
}
</style>
```

### 练习任务
1. 创建一个卡片组件，包含标题、内容和操作按钮
2. 使用 onMounted 加载数据（模拟异步请求）
3. 实现父子组件双向通信

---

## 模块四：TypeScript 类型系统进阶

### 学习目标
- 掌握接口（Interface）和类型别名（Type）的使用
- 理解泛型的作用
- 学会为组件和函数编写类型定义

### 核心概念

#### 4.1 接口定义
```typescript
// src/data/poetry.ts
export interface Poetry {
  title: string
  author: string
  dynasty: string
  content: string
  description?: string  // ? 表示可选属性
  image?: string
}
```

**为什么使用接口？**
接口定义数据结构，让代码更易理解和维护，编辑器可以提供智能提示。

#### 4.2 类型别名与联合类型
```typescript
type WidgetSize = 'small' | 'medium' | 'large'
type PoetryType = 'poetry' | 'prose' | 'story' | 'fu'

const widgetSize = ref<WidgetSize>('large')
const selectedPoetryType = ref<PoetryType>('poetry')
```

**联合类型的好处**：只能赋值为指定的几个值，防止拼写错误。

#### 4.3 函数类型定义
```typescript
// src/services/textToImage.ts
class TextToImageService {
  // 返回值类型为 Promise<string>
  async generateImage(text: string, style: string): Promise<string> {
    try {
      const response = await axios.post('/api/text-to-image', {
        text,
        style
      })
      return response.data.imageUrl
    } catch (error) {
      throw new Error('生成失败')
    }
  }
}
```

#### 4.4 泛型的使用
```typescript
// 泛型函数
function getValue<T>(array: T[], index: number): T {
  return array[index]
}

const numbers = [1, 2, 3]
const firstNumber = getValue<number>(numbers, 0)  // 类型为 number

const names = ['张三', '李四']
const firstName = getValue<string>(names, 0)  // 类型为 string
```

**项目实例**：收藏服务
```typescript
// src/services/favorite.ts
interface FavoriteItem {
  id: string
  type: 'text-to-image' | 'image-to-text'
  content: string
  result: string
  style: string
  timestamp: number
}

class FavoriteService {
  private storageKey = 'poetic-brushstrokes-favorites'

  getAll(): FavoriteItem[] {
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : []
  }

  add(item: Omit<FavoriteItem, 'id' | 'timestamp'>): void {
    const favorites = this.getAll()
    const newItem: FavoriteItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    favorites.unshift(newItem)
    localStorage.setItem(this.storageKey, JSON.stringify(favorites))
  }
}
```

**类型技巧**：`Omit<FavoriteItem, 'id' | 'timestamp'>` 表示从 FavoriteItem 中排除 id 和 timestamp 字段。

### 练习任务
1. 为"诗词数据库"定义接口
2. 创建一个泛型函数来过滤数组
3. 为 API 请求函数添加类型定义

### 常见错误
1. **any 类型滥用**：失去类型检查的意义
2. **类型断言过度**：`as` 应谨慎使用
3. **忽略可选属性**：访问前应检查是否存在

---

## 模块五：Tailwind CSS 快速布局

### 学习目标
- 理解实用优先（Utility-First）CSS 的理念
- 掌握 Tailwind 常用类名
- 学会使用 Flexbox 和 Grid 布局

### 核心概念

#### 5.1 实用优先 vs 传统 CSS
**传统方式**：
```css
.button {
  background-color: #E67E22;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
```

**Tailwind 方式**：
```html
<button class="bg-accent text-white px-4 py-2 rounded-lg">
  按钮
</button>
```

**优势**：
1. 无需命名：不用纠结类名
2. 响应式：`md:text-lg` 轻松实现
3. 一致性：设计系统内置

#### 5.2 布局基础

**Flexbox 布局**
```html
<!-- 水平居中 -->
<div class="flex justify-center items-center">
  <p>居中内容</p>
</div>

<!-- 响应式网格 -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>卡片1</div>
  <div>卡片2</div>
</div>
```

**项目实例**：主页功能卡片
```html
<!-- src/components/HomePage.vue -->
<div class="grid md:grid-cols-2 gap-6">
  <!-- 诗生画卡片 -->
  <div class="p-8 glass-card hover:shadow-2xl transition-all">
    <h3 class="text-2xl font-bold">诗生画</h3>
    <p>输入古诗词，AI 为您生成对应意境的绘画作品</p>
  </div>

  <!-- 画生诗卡片 -->
  <div class="p-8 glass-card hover:shadow-2xl transition-all">
    <h3 class="text-2xl font-bold">画生诗</h3>
    <p>上传绘画作品，AI 为您创作对应的诗词</p>
  </div>
</div>
```

#### 5.3 响应式设计
```html
<!-- 移动端单列，平板及以上双列 -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <!-- 内容 -->
</div>

<!-- 移动端小字，桌面端大字 -->
<h1 class="text-2xl md:text-4xl">标题</h1>

<!-- 移动端隐藏，桌面端显示 -->
<div class="hidden md:block">仅桌面端显示</div>
```

**断点说明**：
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

#### 5.4 自定义样式

**方式一：在 Tailwind 配置中扩展**
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'ink-wash': '#2C3E50',
    },
    spacing: {
      '128': '32rem',
    }
  }
}
```

**方式二：使用 @apply 指令**
```css
<style scoped>
.poetry-card {
  @apply p-6 bg-white rounded-xl shadow-lg;
}

.poetry-card:hover {
  @apply shadow-2xl transform -translate-y-1;
}
</style>
```

**项目实例**：毛玻璃效果
```css
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
```

### 实战案例：创建诗词展示卡片

```vue
<template>
  <div class="relative overflow-hidden p-6 rounded-2xl border-2 border-amber-200/50 hover:border-amber-300 transition-all duration-500 group cursor-pointer">
    <!-- 背景渐变 -->
    <div class="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

    <!-- 内容 -->
    <div class="relative z-10">
      <h4 class="text-xl font-bold text-ink-wash mb-2 text-center">
        《{{ poetry.title }}》
      </h4>
      <p class="text-sm text-ink-wash/90 leading-loose whitespace-pre-line text-center">
        {{ poetry.content }}
      </p>
      <div class="mt-4 text-xs text-mountain-mist text-center">
        {{ poetry.dynasty }} · {{ poetry.author }}
      </div>
    </div>
  </div>
</template>
```

**设计细节**：
- `group`：父元素设置，子元素可用 `group-hover:` 响应
- `transition-all duration-500`：平滑过渡动画
- `backdrop-filter`：背景模糊效果

### 练习任务
1. 使用 Flexbox 创建一个顶部导航栏
2. 使用 Grid 创建一个照片墙（3列布局）
3. 实现一个响应式卡片组件

---

## 模块六：文件处理与 FileReader API

### 学习目标
- 掌握文件上传的实现方法
- 理解 FileReader API 的使用
- 学会图片预览功能

### 核心概念

#### 6.1 文件上传基础
```html
<template>
  <!-- 隐藏原生 input，用 label 触发 -->
  <label for="file-upload" class="cursor-pointer">
    <div class="upload-button">上传文件</div>
  </label>
  <input
    id="file-upload"
    type="file"
    accept="image/*"
    @change="handleFileChange"
    class="hidden"
  />
</template>
```

**为什么隐藏 input？**
原生 `<input type="file">` 样式难以定制，通过 `<label>` 触发可以自定义样式。

#### 6.2 FileReader API
```typescript
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('文件过大，请选择小于5MB的图片')
      return
    }

    // 读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      // imageUrl 是 base64 编码的图片数据
      console.log(imageUrl)
    }
    reader.readAsDataURL(file)
  }
}
```

**项目实例**：画生诗上传功能
```typescript
// src/components/ImageToTextModule.vue
const uploadedImage = ref<string | null>(null)
const uploadedFile = ref<File | null>(null)

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    uploadedFile.value = file  // 保存 File 对象用于 API 请求

    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string  // 保存 base64 用于预览
      generatedPoetry.value = null  // 清空之前的生成结果
      errorMessage.value = null
    }
    reader.readAsDataURL(file)
  }
}
```

#### 6.3 图片预览
```vue
<template>
  <div class="preview-container">
    <img
      v-if="uploadedImage"
      :src="uploadedImage"
      alt="预览"
      class="w-full h-full object-cover"
    />
    <div v-else class="placeholder">
      <p>点击上传图片</p>
    </div>
  </div>
</template>
```

#### 6.4 从 URL 加载示例图片
```typescript
// 加载示例图片并转换为 File 对象
const loadExampleImage = async (imageUrl: string, fileName: string) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], fileName, { type: 'image/png' })

    uploadedFile.value = file
    uploadedImage.value = imageUrl
  } catch (error) {
    console.error('加载失败:', error)
  }
}
```

**应用场景**：点击示例图片时，将其转换为可上传的 File 对象。

### 实战案例：完整的图片上传组件

```vue
<template>
  <div class="upload-area">
    <!-- 预览区域 -->
    <div class="preview" @click="triggerUpload">
      <img v-if="previewUrl" :src="previewUrl" alt="预览" />
      <div v-else class="placeholder">
        <FileImageIcon class="w-12 h-12 text-gray-400" />
        <p>点击上传图片</p>
        <p class="text-xs text-gray-500">支持 JPG、PNG，最大 5MB</p>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      class="hidden"
    />

    <!-- 操作按钮 -->
    <div v-if="previewUrl" class="actions">
      <button @click.stop="clearImage">清除</button>
      <button @click.stop="triggerUpload">重新上传</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileImage as FileImageIcon } from 'lucide-vue-next'

const emit = defineEmits<{
  uploaded: [file: File, url: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const currentFile = ref<File | null>(null)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('文件过大，请选择小于 5MB 的图片')
    return
  }

  // 读取预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    currentFile.value = file
    emit('uploaded', file, previewUrl.value)
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  previewUrl.value = null
  currentFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #7CB342;
}

.preview {
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #9CA3AF;
}
</style>
```

### 练习任务
1. 实现一个支持拖拽上传的文件上传组件
2. 添加文件类型和大小验证
3. 实现多文件上传（选择多张图片）

---

## 模块七：localStorage 数据持久化

### 学习目标
- 理解 localStorage 的特点和限制
- 掌握数据的序列化与反序列化
- 学会设计本地存储结构

### 核心概念

#### 7.1 localStorage 基础
```typescript
// 存储字符串
localStorage.setItem('username', '张三')

// 读取字符串
const username = localStorage.getItem('username')

// 删除数据
localStorage.removeItem('username')

// 清空所有数据
localStorage.clear()
```

**特点**：
- 容量约 5MB
- 仅支持字符串类型
- 持久化存储，浏览器关闭后数据仍存在
- 同源策略限制

#### 7.2 存储对象数据
```typescript
// 存储对象（需要序列化）
const user = { name: '张三', age: 20 }
localStorage.setItem('user', JSON.stringify(user))

// 读取对象（需要反序列化）
const userStr = localStorage.getItem('user')
const user = userStr ? JSON.parse(userStr) : null
```

**项目实例**：收藏服务
```typescript
// src/services/favorite.ts
interface FavoriteItem {
  id: string
  type: 'text-to-image' | 'image-to-text'
  content: string
  result: string
  style: string
  timestamp: number
}

class FavoriteService {
  private storageKey = 'poetic-brushstrokes-favorites'

  // 获取所有收藏
  getAll(): FavoriteItem[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('读取收藏失败:', error)
      return []
    }
  }

  // 添加收藏
  add(item: Omit<FavoriteItem, 'id' | 'timestamp'>): void {
    try {
      const favorites = this.getAll()
      const newItem: FavoriteItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now()
      }
      favorites.unshift(newItem)
      localStorage.setItem(this.storageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw new Error('收藏失败，请重试')
    }
  }

  // 删除收藏
  remove(id: string): void {
    try {
      const favorites = this.getAll()
      const filtered = favorites.filter(item => item.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    } catch (error) {
      console.error('删除收藏失败:', error)
      throw new Error('删除失败，请重试')
    }
  }
}

export const favoriteService = new FavoriteService()
```

#### 7.3 设置持久化
```typescript
// src/pages/Home.vue
const customBackground = ref<string>('')
const widgetSize = ref<string>('large')

// 加载设置
const loadSettings = () => {
  try {
    const savedBg = localStorage.getItem('custom-background')
    const savedSize = localStorage.getItem('widget-size')

    if (savedBg) {
      customBackground.value = savedBg
    }
    if (savedSize) {
      widgetSize.value = savedSize
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = () => {
  try {
    if (customBackground.value) {
      localStorage.setItem('custom-background', customBackground.value)
    }
    localStorage.setItem('widget-size', widgetSize.value)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

onMounted(() => {
  loadSettings()
})
```

#### 7.4 异常处理
```typescript
const safeSave = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('存储空间已满，请清理收藏或设置')
    } else {
      console.error('存储失败:', error)
    }
    return false
  }
}
```

**常见错误**：
1. **QuotaExceededError**：超出存储配额
2. **SecurityError**：隐私模式下可能禁用
3. **JSON 解析错误**：数据损坏

### 练习任务
1. 实现一个待办事项应用，数据存储在 localStorage
2. 添加清空收藏功能
3. 实现数据导出/导入功能（JSON 格式）

---

## 模块八：AI 服务集成（API 调用）

### 学习目标
- 理解前后端分离架构
- 掌握 Axios 发起 HTTP 请求
- 学会处理异步操作和错误

### 核心概念

#### 8.1 Axios 基础
```typescript
import axios from 'axios'

// GET 请求
const response = await axios.get('/api/poetry', {
  params: { id: 1 }
})

// POST 请求
const response = await axios.post('/api/generate', {
  text: '床前明月光',
  style: 'ink-wash'
})

// 上传文件
const formData = new FormData()
formData.append('image', file)
const response = await axios.post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

#### 8.2 服务封装
```typescript
// src/services/textToImage.ts
import axios from 'axios'

class TextToImageService {
  private apiUrl = '/api/text-to-image'

  // 生成水墨画
  async generateInkWash(text: string): Promise<string> {
    try {
      const response = await axios.post(this.apiUrl, {
        text,
        style: 'ink-wash',
        prompt: `中国传统水墨画风格，${text}，写意风格，留白艺术`
      })
      return response.data.imageUrl
    } catch (error) {
      console.error('生成失败:', error)
      throw new Error('AI 生成失败，请重试')
    }
  }

  // 生成工笔画
  async generateGongbi(text: string): Promise<string> {
    const response = await axios.post(this.apiUrl, {
      text,
      style: 'gongbi',
      prompt: `中国工笔画风格，${text}，细腻精致，色彩典雅`
    })
    return response.data.imageUrl
  }

  // 通用生成方法
  async generateImage(text: string, style: string): Promise<string> {
    const response = await axios.post(this.apiUrl, {
      text,
      style
    })
    return response.data.imageUrl
  }
}

export const textToImageService = new TextToImageService()
```

**设计模式**：
- **单例模式**：整个应用共享一个服务实例
- **封装细节**：组件无需关心 API 具体实现

#### 8.3 异步状态管理
```typescript
// src/components/TextToImageModule.vue
const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const handleGenerate = async () => {
  if (!inputText.value.trim()) return

  isGenerating.value = true
  errorMessage.value = null

  try {
    const result = await textToImageService.generateInkWash(inputText.value)
    generatedImage.value = result
  } catch (error) {
    console.error('生成失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}
```

**状态设计**：
- `isGenerating`：加载状态（显示加载动画）
- `generatedImage`：成功结果
- `errorMessage`：错误信息

#### 8.4 图片上传到 AI 服务
```typescript
// src/services/imageToText.ts
class ImageToTextService {
  private apiUrl = '/api/image-to-text'

  async generatePoetry(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', 'poetry')

    try {
      const response = await axios.post(this.apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.text
    } catch (error) {
      throw new Error('AI 创作失败，请重试')
    }
  }
}

export const imageToTextService = new ImageToTextService()
```

#### 8.5 错误处理最佳实践
```typescript
const handleGenerate = async () => {
  isGenerating.value = true
  errorMessage.value = null

  try {
    const result = await textToImageService.generateImage(inputText.value, selectedStyle.value)
    generatedImage.value = result
  } catch (error) {
    // 详细错误处理
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage.value = 'API 密钥无效，请检查配置'
      } else if (error.response?.status === 429) {
        errorMessage.value = '请求过于频繁，请稍后再试'
      } else if (error.response?.status >= 500) {
        errorMessage.value = '服务器错误，请稍后再试'
      } else {
        errorMessage.value = error.response?.data?.message || '生成失败'
      }
    } else {
      errorMessage.value = '网络错误，请检查网络连接'
    }
  } finally {
    isGenerating.value = false
  }
}
```

### 实战案例：完整的 AI 图片生成流程

```vue
<template>
  <div class="generator">
    <!-- 输入区域 -->
    <textarea
      v-model="inputText"
      placeholder="输入古诗词..."
      :disabled="isGenerating"
    />

    <!-- 风格选择 -->
    <div class="styles">
      <button
        v-for="style in styles"
        :key="style.value"
        @click="selectedStyle = style.value"
        :class="{ active: selectedStyle === style.value }"
        :disabled="isGenerating"
      >
        {{ style.label }}
      </button>
    </div>

    <!-- 生成按钮 -->
    <button
      @click="handleGenerate"
      :disabled="!inputText.trim() || isGenerating"
      class="generate-btn"
    >
      <div v-if="isGenerating" class="spinner" />
      {{ isGenerating ? '正在创作...' : '生成画作' }}
    </button>

    <!-- 结果显示 -->
    <div class="result">
      <div v-if="errorMessage" class="error">
        {{ errorMessage }}
      </div>
      <img v-else-if="generatedImage" :src="generatedImage" alt="生成的画作" />
      <div v-else class="placeholder">
        画作将在这里显示
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { textToImageService } from '@/services/textToImage'

const inputText = ref('')
const selectedStyle = ref('ink-wash')
const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const styles = [
  { value: 'ink-wash', label: '水墨写意' },
  { value: 'gongbi', label: '工笔细描' },
  { value: 'landscape', label: '山水古风' }
]

const handleGenerate = async () => {
  if (!inputText.value.trim()) return

  isGenerating.value = true
  errorMessage.value = null

  try {
    let result: string

    switch (selectedStyle.value) {
      case 'ink-wash':
        result = await textToImageService.generateInkWash(inputText.value)
        break
      case 'gongbi':
        result = await textToImageService.generateGongbi(inputText.value)
        break
      case 'landscape':
        result = await textToImageService.generateLandscape(inputText.value)
        break
      default:
        result = await textToImageService.generateImage(inputText.value, selectedStyle.value)
    }

    generatedImage.value = result
  } catch (error) {
    console.error('生成失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '生成失败，请重试'
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### 练习任务
1. 封装一个通用的 HTTP 请求服务
2. 实现请求超时处理（10秒超时）
3. 添加请求重试机制（失败后自动重试）

---

## 模块九：高级动画与交互

### 学习目标
- 掌握 Vue 过渡动画
- 实现拖拽功能
- 学会轮播图组件开发

### 核心概念

#### 9.1 Vue Transition 组件
```vue
<template>
  <Transition name="fade">
    <div v-if="show">淡入淡出的内容</div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**项目实例**：诗词切换动画
```vue
<!-- src/components/PoetryWidget.vue -->
<Transition name="poetry-fade" mode="out-in">
  <div :key="poetry.title" class="poetry-content">
    <h4>{{ poetry.title }}</h4>
    <p>{{ poetry.content }}</p>
  </div>
</Transition>

<style scoped>
.poetry-fade-enter-active,
.poetry-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.poetry-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.poetry-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
```

**关键属性**：
- `mode="out-in"`：先离开动画，再进入动画
- `:key`：Vue 据此判断是否需要切换

#### 9.2 拖拽功能实现
```typescript
// src/components/PoetryWidget.vue
const widgetRef = ref<HTMLDivElement | null>(null)
const position = ref({ x: 20, y: 100 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  const rect = widgetRef.value?.getBoundingClientRect()
  if (rect) {
    dragOffset.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
```

**模板使用**：
```vue
<div
  ref="widgetRef"
  :style="{
    left: `${position.x}px`,
    top: `${position.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab'
  }"
  @mousedown="handleMouseDown"
>
  可拖拽的内容
</div>
```

#### 9.3 轮播图实现
```typescript
// src/components/ImageToTextModule.vue
const currentExampleIndex = ref(0)
const autoPlay = ref(true)
let carouselTimer: number | null = null

const nextExample = () => {
  currentExampleIndex.value = (currentExampleIndex.value + 1) % exampleImages.length
}

const prevExample = () => {
  currentExampleIndex.value = (currentExampleIndex.value - 1 + exampleImages.length) % exampleImages.length
}

const startCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
  }
  if (autoPlay.value) {
    carouselTimer = window.setInterval(() => {
      nextExample()
    }, 5000)
  }
}

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

watch(autoPlay, (newValue) => {
  if (newValue) {
    startCarousel()
  } else {
    stopCarousel()
  }
})

onMounted(() => {
  if (autoPlay.value) {
    startCarousel()
  }
})

onUnmounted(() => {
  stopCarousel()
})
```

**模板部分**：
```vue
<Transition name="slide-fade" mode="out-in">
  <div :key="currentExampleIndex">
    <img :src="exampleImages[currentExampleIndex].url" />
  </div>
</Transition>

<!-- 控制按钮 -->
<button @click="prevExample">上一张</button>
<button @click="nextExample">下一张</button>
<button @click="autoPlay = !autoPlay">
  {{ autoPlay ? '暂停' : '播放' }}
</button>

<!-- 指示器 -->
<div class="indicators">
  <div
    v-for="(_, idx) in exampleImages"
    :key="idx"
    @click="currentExampleIndex = idx"
    :class="{ active: idx === currentExampleIndex }"
  />
</div>
```

#### 9.4 进度条动画
```typescript
const progress = ref(0)
let progressTimer: number | null = null

const startProgress = () => {
  progress.value = 0
  const interval = 50  // 每50ms更新一次
  const duration = 5000  // 5秒总时长
  const increment = (100 * interval) / duration

  progressTimer = window.setInterval(() => {
    progress.value += increment
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(progressTimer!)
    }
  }, interval)
}
```

**模板**：
```vue
<div class="progress-bar">
  <div
    class="progress-fill"
    :style="{ width: `${progress}%` }"
  />
</div>

<style scoped>
.progress-bar {
  height: 4px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #E67E22, #D35400);
  transition: width 0.1s linear;
}
</style>
```

### 练习任务
1. 实现一个淡入淡出的提示框组件
2. 创建一个可拖拽的对话框
3. 开发一个支持左右滑动的图片画廊

---

## 模块十：性能优化与最佳实践

### 学习目标
- 理解 Vue 性能优化原理
- 掌握代码分割和懒加载
- 学会调试和排查问题

### 核心概念

#### 10.1 组件懒加载
```typescript
// src/pages/Home.vue
import { defineAsyncComponent } from 'vue'

// 懒加载组件
const TextToImageModule = defineAsyncComponent(() =>
  import('@/components/TextToImageModule.vue')
)

const ImageToTextModule = defineAsyncComponent(() =>
  import('@/components/ImageToTextModule.vue')
)
```

**为什么懒加载？**
初始加载时只加载首页，其他页面组件在需要时才加载，减少首屏时间。

#### 10.2 计算属性缓存
```typescript
// 不推荐：每次调用都重新计算
const fullName = () => {
  return firstName.value + lastName.value
}

// 推荐：计算属性有缓存
const fullName = computed(() => {
  return firstName.value + lastName.value
})
```

#### 10.3 v-if vs v-show
```vue
<!-- v-if：条件渲染，DOM 会被销毁/创建 -->
<div v-if="showContent">内容</div>

<!-- v-show：切换 display 样式，DOM 始终存在 -->
<div v-show="showContent">内容</div>
```

**使用建议**：
- 频繁切换：用 `v-show`
- 条件很少变化：用 `v-if`

#### 10.4 列表渲染优化
```vue
<!-- 必须提供 key -->
<div
  v-for="item in items"
  :key="item.id"
>
  {{ item.name }}
</div>

<!-- 不推荐：使用 index 作为 key -->
<div
  v-for="(item, index) in items"
  :key="index"
>
  {{ item.name }}
</div>
```

**为什么需要 key？**
Vue 使用 key 追踪节点身份，重用和重新排序现有元素，提高渲染效率。

#### 10.5 图片优化
```vue
<template>
  <img
    :src="imageSrc"
    loading="lazy"
    alt="描述"
    class="w-full h-auto"
  />
</template>
```

**优化技巧**：
1. `loading="lazy"`：懒加载图片
2. 使用合适的图片格式（WebP）
3. 提供图片尺寸属性，避免重排

#### 10.6 防抖与节流
```typescript
// 防抖：延迟执行，多次触发只执行最后一次
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// 使用
const handleSearch = debounce((query: string) => {
  console.log('搜索:', query)
}, 300)
```

```typescript
// 节流：限制执行频率，一段时间内只执行一次
const throttle = (fn: Function, delay: number) => {
  let lastTime = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }
}

// 使用
const handleScroll = throttle(() => {
  console.log('滚动事件')
}, 200)
```

### 调试技巧

#### 10.7 Vue Devtools
```typescript
// 在开发环境暴露组件供调试
if (import.meta.env.DEV) {
  window.__app = app
}
```

#### 10.8 性能监测
```typescript
// 组件渲染性能
const startTime = performance.now()

// ... 执行代码

const endTime = performance.now()
console.log(`执行耗时: ${endTime - startTime}ms`)
```

### 最佳实践清单

1. **代码组织**
   - 按功能模块划分目录
   - 单个文件不超过 300 行
   - 提取可复用逻辑到 composables

2. **类型安全**
   - 为所有 API 定义接口
   - 避免使用 `any` 类型
   - 启用严格模式

3. **样式管理**
   - 使用 scoped 避免样式污染
   - 提取公共样式到全局 CSS
   - 合理使用 Tailwind 自定义

4. **状态管理**
   - 简单状态用 ref/reactive
   - 跨组件状态用 provide/inject
   - 复杂应用考虑 Pinia

5. **错误处理**
   - 所有异步操作都要 try-catch
   - 提供用户友好的错误提示
   - 记录错误日志

### 练习任务
1. 优化一个包含大量数据的列表组件
2. 实现搜索输入框的防抖功能
3. 使用 Vue Devtools 分析组件性能

---

## 综合项目：诗画传情完整实现

### 项目目标
运用所有模块知识，独立完成"诗画传情"应用的核心功能。

### 功能清单
1. 首页导航
2. 诗生画功能
3. 画生诗功能
4. 诗词推荐小组件
5. 收藏管理
6. 系统设置

### 实施步骤

#### 阶段一：项目搭建（2小时）
- 创建 Vite + Vue + TypeScript 项目
- 配置 Tailwind CSS
- 设计目录结构

#### 阶段二：首页开发（3小时）
- 创建导航组件
- 实现功能卡片
- 添加背景和动画

#### 阶段三：诗生画模块（5小时）
- 文本输入界面
- 风格选择
- AI 服务调用
- 结果展示和操作

#### 阶段四：画生诗模块（5小时）
- 图片上传组件
- 示例轮播
- AI 诗词生成
- Markdown 渲染

#### 阶段五：诗词推荐（4小时）
- 诗词数据准备
- 浮动窗口
- 拖拽功能
- 自动切换

#### 阶段六：收藏与设置（4小时）
- localStorage 封装
- 收藏列表
- 设置面板
- 数据持久化

#### 阶段七：测试与优化（3小时）
- 功能测试
- 性能优化
- 响应式调整
- 错误处理

### 评估标准
1. 功能完整性：所有功能正常运行
2. 代码质量：遵循最佳实践，类型安全
3. 用户体验：界面美观，交互流畅
4. 性能表现：加载快速，无明显卡顿

---

## 扩展学习资源

### 官方文档
- Vue 3 官方文档：https://cn.vuejs.org/
- TypeScript 手册：https://www.typescriptlang.org/zh/
- Tailwind CSS 文档：https://tailwindcss.com/

### 进阶主题
1. **状态管理**：学习 Pinia
2. **路由管理**：深入 Vue Router
3. **测试**：使用 Vitest 编写单元测试
4. **构建优化**：Vite 配置和打包优化
5. **TypeScript 进阶**：高级类型和泛型

### 项目实战建议
1. 完成本课程后，尝试独立开发类似项目
2. 参与开源项目，学习优秀代码
3. 阅读 Vue 源码，理解框架原理

---

## 总结

通过本课程，您已经学习了：

1. **Vue 3 核心**：Composition API、响应式系统、组件化
2. **TypeScript**：类型系统、接口定义、类型安全
3. **Tailwind CSS**：实用优先 CSS、快速布局、响应式设计
4. **前端工程化**：Vite 构建、模块化、最佳实践
5. **实用技能**：文件上传、数据持久化、AI 服务集成、动画交互

恭喜您完成学习！继续实践，您将成为一名优秀的前端开发者。

---

**课程反馈**
如有疑问或建议，欢迎与我交流。祝学习愉快！
