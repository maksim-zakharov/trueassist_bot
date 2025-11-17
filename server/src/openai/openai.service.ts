import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma.service';
import { BaseService, ServiceExecutors, ServiceVariant } from '@prisma/client';
import { PorterStemmerRu } from 'natural';

@Injectable()
export class OpenaiService {
  private logger = new Logger(OpenaiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenAI,
  ) {}

  private normalizeText(text: string): string {
    return PorterStemmerRu.tokenizeAndStem(text)
      .join(' ')
      .replace(/[^а-яё\s]/gi, '');
  }

  async detectBaseService(text: string): Promise<BaseService | null> {
    const services = await this.prisma.baseService.findMany({
      include: { executors: true, variants: true },
    });

    const prompt = `Определи основную услугу из списка: ${services
      .map((s) =>
        JSON.stringify({
          id: s.id,
          name: s.name,
        }),
      )
      .join(', ')}. 
    Ответ в JSON: {
        serviceId: number,
        matchedText: string // оригинальное найденное словосочетание из текста
    }`;

    const result = await this.chatGptRequest(prompt, text);
    return services.find((s) => s.id === result?.serviceId);
  }

  async detectServiceWithVariant(text: string): Promise<{
    service: BaseService | null;
    variant: ServiceVariant | null;
    displayName?: string;
    keyPhrases: string[];
  }> {
    const services = await this.prisma.baseService.findMany({
      include: {
        variants: true,
      },
    });

    const prompt = `Определи услугу и вариант из списка. Ответ в JSON: {
        "serviceId": number,
        "variantId": number?,
        "displayName": string,
        "keyPhrases": string[]
        }
    
        Доступные услуги:
        ${services
          .map(
            (s) =>
              `- ${s.name} [ID:${s.id}]: ${s.variants.map((v) => `${v.nameAccusative} [ID:${v.id}]`).join(', ')}`,
          )
          .join('\n')}
        
        Правила:
        1. Если вариант не указан явно - оставляй variantId пустым
        2. Для общих запросов ("Нужна химчистка") сохраняй фразы только для услуги
        3. Для уточненных запросов ("Генеральная уборка квартиры") сохраняй фразы для варианта
        4. В keyPhrases - только фразы, напрямую связанные с конкретными услугами. Игнорируй общие слова: "контакты", "подскажите", "нужен" и т.д. Максимальная длина фразы - 3 слова. Приводи фразы к начальной форме.
        5. В displayName - всегда включай базовое название услуги в displayName. Приводи фразы к родительному падежу, например "генеральной уборки квартиры", все слова с маленькой буквы.
      
        Примеры:
        Текст: "Химчистка дивана"
        Ответ: {
            "serviceId": 2,
            "displayName": "химчистки дивана",
            "keyPhrases": ["химчистка диван"]
        }
        
        Текст: "Генеральная уборка после ремонта"
        Ответ: {
            "serviceId": 1,
            "variantId": 3,
            "displayName": "генеральной уборки после ремонта", 
            "keyPhrases": ["генеральная уборка", "уборка после ремонта"]
        }
      `;

    const result = await this.chatGptRequest(prompt, text);

    // Валидация результата
    const service = services.find((s) => s.id === result?.serviceId);
    const variant = services
      .find((s) => s.id === result?.serviceId)
      ?.variants?.find((v) => v.id === result.variantId);

    // Фильтрация и нормализация фраз
    const processedPhrases = (result?.keyPhrases || [])
      .map((phrase) => this.normalizeText(phrase))
      .filter((phrase) => phrase.length >= 3);

    return {
      service,
      variant,
      displayName: result?.displayName,
      keyPhrases: [...new Set<string>(processedPhrases)], // Удаление дубликатов
    };
  }

  private async chatGptRequest(
    systemPrompt: string,
    userText: string,
  ): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      this.logger.error(`ChatGPT error: ${error.message}`);
      return null;
    }
  }
}
