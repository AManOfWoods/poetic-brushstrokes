/**
 * 诗生画服务 - 使用火山引擎豆包文生图模型
 * API Key: f9e0848d-3d27-4357-8ac1-c4e5bafcd650
 */

interface TextToImageRequest {
  model: string;
  prompt: string;
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
}

interface TextToImageResponse {
  created: number;
  data: Array<{
    url: string;
    b64_json?: string;
  }>;
}

export class TextToImageService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = '/api/text-to-image';
    // API Key and model are now handled by the backend proxy
    this.apiKey = '';
    this.model = '';
  }

  /**
   * 根据风格生成对应的提示词前缀
   */
  private getStylePrompt(style: string): string {
    const stylePrompts = {
      'ink-wash': '中国传统水墨画，写意手法，墨色浓淡层次丰富，虚实相生，留白得当，笔触灵动飘逸，意境深远悠长，',
      'gongbi': '中国工笔画，线条精细入微，设色典雅华丽，晕染细腻柔和，细节刻画精致，构图严谨工整，色彩明艳纯正，',
      'landscape': '中国山水画，远山层叠，近水潺潺，云雾缭绕于山谷，松柏点缀于峰峦，意境幽深静谧，构图疏密有致，气韵生动，',
      'cartoon': 'Q版卡通插画，造型圆润可爱，比例夸张萌趣，色彩明快鲜亮，线条简洁流畅，表情生动活泼，充满童趣，',
      'anime': '日系动漫风格，画面唯美梦幻，色彩绚丽丰富，光影效果强烈，人物形象精致，场景细节丰富，充满奇幻想象力，',
      'crayon': '儿童蜡笔画，笔触粗犷自然，色彩饱和明亮，线条稚拙可爱，涂色不规则有趣，充满童真童趣，温馨治愈，'
    };
    return stylePrompts[style] || '';
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\r?\n+/g, '；')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildPrompt(text: string, style: string): string {
    const stylePrefix = this.getStylePrompt(style);
    const normalizedText = this.normalizeText(text);

    return [
      `${stylePrefix}请先准确理解这段诗词或文字的核心意象，再把它转化为一幅高度相关的完整画面。`,
      `原文仅用于理解意境，不要逐字照搬：${normalizedText}`,
      '画面重点：紧扣原文中的季节、时间、地点、主体、动作和情绪，只保留最核心的1到3个视觉主体；优先呈现与诗意最相关的一幕；宁可简洁留白，也不要添加无关的人物、建筑、物件或装饰。',
      '构图要求：主体清晰，层次分明，空间关系自然，色调统一，氛围准确，突出东方审美、诗意叙事与真实细节。',
      '如果诗意较抽象，请提炼为最能代表诗意的自然或人物场景，确保图文高度一致，不要出现与原文冲突的内容。',
      '严格禁止：画面中不要出现任何文字内容，不要出现诗句原文、标题、题字、书法、印章、落款、对联、标签、数字、字母、水印、logo、招牌文字、边框文字。',
      'English constraints: no text, no Chinese characters, no calligraphy, no letters, no watermark, no logo, textless image only.',
      '输出目标：高质量，精美细腻，艺术感强，4K质感，适合展示。'
    ].join(' ');
  }

  /**
   * 生成图片
   */
  async generateImage(text: string, style: string = 'ink-wash'): Promise<string> {
    try {
      // 构建完整的提示词
      const fullPrompt = this.buildPrompt(text, style);

      // 构建请求数据 - model 会由后端服务器自动添加
      const requestData: Partial<TextToImageRequest> = {
        prompt: fullPrompt,
        size: '1024x1024',
        quality: 'hd',
        n: 1
      };

      // 发送请求
      console.log('发送诗生画API请求:', {
        originalText: text,
        style: style,
        fullPrompt: fullPrompt,
        size: requestData.size
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
        console.error('诗生画API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const data: TextToImageResponse = await response.json();
      
      console.log('收到诗生画API响应:', {
        created: data.created,
        imageCount: data.data?.length || 0,
        hasUrl: !!data.data?.[0]?.url,
        fullResponse: data
      });

      if (!data.data || data.data.length === 0) {
        throw new Error('API 返回数据格式错误：没有找到生成的图片');
      }

      if (!data.data[0].url) {
        throw new Error('API 返回数据格式错误：图片URL为空');
      }

      return data.data[0].url;

    } catch (error) {
      console.error('诗生画 API 调用失败:', error);
      if (error instanceof Error) {
        throw new Error(`诗生画功能暂时不可用: ${error.message}`);
      }
      throw new Error('诗生画功能暂时不可用，请稍后重试');
    }
  }

  /**
   * 生成水墨风格图片
   */
  async generateInkWash(text: string): Promise<string> {
    return this.generateImage(text, 'ink-wash');
  }

  /**
   * 生成工笔风格图片
   */
  async generateGongbi(text: string): Promise<string> {
    return this.generateImage(text, 'gongbi');
  }

  /**
   * 生成山水风格图片
   */
  async generateLandscape(text: string): Promise<string> {
    return this.generateImage(text, 'landscape');
  }

  /**
   * 生成Q版卡通图片
   */
  async generateCartoon(text: string): Promise<string> {
    return this.generateImage(text, 'cartoon');
  }

  /**
   * 生成奇幻动漫图片
   */
  async generateAnime(text: string): Promise<string> {
    return this.generateImage(text, 'anime');
  }

  /**
   * 生成蜡笔手绘图片
   */
  async generateCrayon(text: string): Promise<string> {
    return this.generateImage(text, 'crayon');
  }
}

// 创建服务实例
export const textToImageService = new TextToImageService();
