/**
 * 画生文服务 - 使用火山引擎豆包 Vision 模型
 * 模型: doubao-seed-1.6-vision
 */

interface ImageToTextRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface ImageToTextResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ImageToTextService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = ''; // Now handled by backend proxy
    this.baseUrl = '/api/image-to-text';
    this.model = ''; // Now handled by backend proxy
  }

  /**
   * 将图片文件转换为 base64 格式
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 分析图片并生成文本描述
   */
  async analyzeImage(file: File, prompt?: string): Promise<string> {
    try {
      // 将图片转换为 base64
      const base64Image = await this.fileToBase64(file);

      // 构建请求数据
      const requestData: ImageToTextRequest = {
        model: this.model, // The backend proxy will specify the actual model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt || '请详细描述这张图片的内容，包括画面中的人物、景物、色彩、构图等元素，并用诗意的语言表达出来。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      };

      // 发送请求
      console.log('发送画生文API请求:', {
        model: this.model,
        prompt: prompt || '默认提示词',
        imageSize: `${file.size} bytes`,
        fileName: file.name
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const data: ImageToTextResponse = await response.json();
      
      console.log('收到画生文API响应:', {
        id: data.id,
        model: data.model,
        contentLength: data.choices?.[0]?.message?.content?.length || 0,
        usage: data.usage,
        fullResponse: data
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('API 返回数据格式错误：没有找到生成的内容');
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error('画生文 API 调用失败:', error);
      if (error instanceof Error) {
        throw new Error(`画生文功能暂时不可用: ${error.message}`);
      }
      throw new Error('画生文功能暂时不可用，请稍后重试');
    }
  }

  /**
   * 生成古风诗词风格的图片描述
   */
  async generatePoetry(file: File): Promise<string> {
    const prompt = `请观察这张图片，为它创作一首古风诗词。

要求：
1. 按以下格式输出（使用markdown格式）：
   ### 《诗词题目》

   诗词正文（每句一行）

   *【意境】简要说明这首诗的创作意境和画面感受（1-2句话）*

2. 诗词可采用五言绝句、七言绝句、五言律诗或七言律诗的形式
3. 题目要简洁优雅，体现诗词主题（3-5字）
4. 诗词语言典雅优美，意境深远，准确捕捉画面核心
5. 讲究平仄对仗，体现古典诗词的韵律美
6. 意境说明要点明诗词所表达的情感和画面氛围

示例格式：
### 《春江花月夜》

春江潮水连海平
海上明月共潮生
滟滟随波千万里
何处春江无月明

*【意境】此诗描绘春江月夜的壮美景色，表达对自然之美的赞叹和对宇宙永恒的思考，意境开阔深远。*`;

    return this.analyzeImage(file, prompt);
  }

  /**
   * 生成词牌风格的图片描述
   */
  async generateProse(file: File): Promise<string> {
    const prompt = `请观察这张图片，为它创作一首宋词。

要求：
1. 按以下格式输出（使用markdown格式）：
   ### 《词牌名·词题》

   上阙内容（每句一行）

   下阙内容（每句一行）

   *【意境】简要说明这首词的创作意境和情感表达（1-2句话）*

2. 采用常见词牌格式（如水调歌头、念奴娇、沁园春等）
3. 上下阙结构完整，长短句错落有致
4. 语言优美流畅，富有韵律感和音乐性
5. 生动描绘画面意境，融入细腻情感
6. 意境说明要点明词作所表达的情感和意境特色

示例格式：
### 《水调歌头·明月》

明月几时有
把酒问青天
不知天上宫阙
今夕是何年

我欲乘风归去
又恐琼楼玉宇
高处不胜寒

*【意境】此词借中秋赏月抒发人生感慨，将天上人间、离合悲欢融为一体，展现旷达超然的人生态度。*`;

    return this.analyzeImage(file, prompt);
  }

  /**
   * 生成绝句风格的图片描述
   */
  async generateStory(file: File): Promise<string> {
    const prompt = `请观察这张图片，为它创作一首绝句。

要求：
1. 按以下格式输出（使用markdown格式）：
   ### 《绝句题目》

   诗句正文（严格四句，每句一行）

   *【意境】简要说明这首绝句的意境和画面特色（1-2句话）*

2. 严格四句，可选五言或七言
3. 对仗工整，讲究平仄韵律
4. 意境完整凝练，画面感强烈
5. 语言精炼优美，意蕴深远
6. 题目简洁（2-4字），点明主题
7. 意境说明要突出绝句的画面美和情感内涵

示例格式：
### 《绝句》

两个黄鹂鸣翠柳
一行白鹭上青天
窗含西岭千秋雪
门泊东吴万里船

*【意境】此诗描绘早春时节生机勃勃的景象，色彩明丽，动静结合，展现诗人愉悦闲适的心境。*`;

    return this.analyzeImage(file, prompt);
  }

  /**
   * 生成赋体风格的图片描述
   */
  async generateFu(file: File): Promise<string> {
    const prompt = `请观察这张图片，用赋体文学形式来描绘画面。

要求：
1. 按以下格式输出（使用markdown格式）：
   ### 《赋文题目》

   赋文正文（采用骈文结构，四字句、六字句为主）

   *【意境】简要说明此赋所描绘的景象和表达的情志（1-2句话）*

2. 采用铺陈描写的手法，层次分明
3. 语言华丽典雅，辞藻丰富
4. 句式整齐对仗，富有节奏感
5. 详尽描绘画面的各个层面和细节
6. 体现"铺采摛文"的赋体特色
7. 题目要体现赋文主题（4-6字）
8. 意境说明要点明赋文的立意和艺术特色

示例格式：
### 《山川胜景赋》

观夫山川之秀，草木之荣。云蒸霞蔚，日丽风和。
青峰叠翠，碧水流长。花开烂漫，鸟语婉转。
远山如黛，近水含情。松涛阵阵，竹影幢幢。
此真天地造化，自然之美也。

*【意境】此赋以铺陈手法描绘山川秀美景色，句式对仗工整，展现大自然的壮丽与和谐之美。*`;

    return this.analyzeImage(file, prompt);
  }
}

// 创建服务实例
export const imageToTextService = new ImageToTextService();