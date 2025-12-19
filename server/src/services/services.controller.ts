import {
  Controller,
  Get,
  Logger,
  OnModuleInit,
  UseInterceptors,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Context, Markup, Telegraf } from 'telegraf';
import { PrismaService } from '../prisma.service';
import { OpenaiService } from '../openai/openai.service';
import { PorterStemmerRu } from 'natural';
import { ChatService } from '../chat/chat.service';

@Controller('/api/services')
@UseInterceptors(CacheInterceptor)
export class ServicesController implements OnModuleInit {
  private logger = new Logger(ServicesController.name);
  private keywordCache: Map<string, number> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly bot: Telegraf,
    private readonly servicesService: ServicesService,
    private readonly openaiService: OpenaiService,
    private readonly chatService: ChatService,
  ) {
    // Обработчик кнопки "Не нужно, спасибо"
    bot.action('delete_message', async (ctx) => {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        this.logger.error('Delete error:', error);
      }
    });
    // this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('photo', (ctx) => this.chatService.photoFromTGToAdmin(ctx));

    this.bot.on('text', this.handleMessage.bind(this));
  }

  async onModuleInit() {
    await this.refreshKeywordCache();
  }

  async refreshKeywordCache() {
    const keywords = await this.prisma.keyword.findMany();
    keywords.forEach((keyword) =>
      this.keywordCache.set(keyword.value, keyword.serviceId),
    );
  }

  private normalizeText(text: string): string {
    return PorterStemmerRu.tokenizeAndStem(text)
      .join(' ')
      .replace(/[^а-яё\s]/gi, '');
  }

  async AIFlow(ctx: Context) {
    const text = (ctx.message as any)?.text;
    if (!text) return;

    // Получаем ID сообщения для ответа
    const replyToId = ctx.message.message_id;

    // const normalizedText = this.normalizeText(text.toLowerCase());

    // Проверка ключевых слов
    // const foundKeyword = Array.from(this.keywordCache.keys()).find((kw) =>
    //   normalizedText.includes(kw.toLowerCase()),
    // );
    //
    // // Если найдено ключевое слово - идем в базу за сервисом
    // if (!foundKeyword) {
    //   this.logger.log(`Ключевых слов не найдено`);
    //   return;
    // }

    // const service = await this.prisma.baseService.findUnique({
    //     where: {id: this.keywordCache.get(foundKeyword)},
    //     include: {
    //         variants: true,
    //         executors: true
    //     }
    // })
    //
    // if (!service) {
    //     this.logger.log('Не нашли услугу по ключевому слову, идем в GPT')
    //     return;
    // }

    // this.logger.log(`Найдена услуга ${service?.name}`)

    // if (!service) {
    //     this.logger.log('Не нашли услугу по ключевому слову, идем в GPT')
    //     service = await this.openaiService.detectBaseService(text);
    // }

    // 2. Определяем ServiceVariant через ChatGPT
    const { service, variant, displayName, keyPhrases } =
      await this.openaiService.detectServiceWithVariant(text);

    const newKeyPhrases = keyPhrases.filter((kp) => !this.keywordCache.has(kp));

    this.logger.log(
      `Вариант: ${variant?.name || '-'}, отображение: ${displayName}, найдено новых фраз: ${keyPhrases.length}`,
    );
    if (newKeyPhrases.length) {
      await this.prisma.keyword.createMany({
        data: newKeyPhrases.map((value) => ({
          value,
          serviceId: service.id,
          variantId: variant?.id,
        })),
        skipDuplicates: true,
      });

      newKeyPhrases.forEach((nkp) => this.keywordCache.set(nkp, service.id));
    }

    let url = `https://t.me/trueassist_bot?startapp=service_${service.id}`;
    if (variant) {
      url += `_variant_${variant.id}`;
    }
    const executors = await this.prisma.user.findMany({
      where: {
        application: {
          status: 'APPROVED',
          OR: [
            {
              variants: {
                some: {
                  variantId: variant?.id,
                },
              },
            },
            {
              variants: {
                some: {
                  variant: {
                    baseServiceId: service.id,
                  },
                },
              },
            },
          ],
        },
      },
    });

    await ctx.replyWithMarkdown(
      `Hi! We found ${executors.length} providers for ${displayName}.`,
      {
        // Ответ на конкретное сообщение
        reply_parameters: {
          message_id: replyToId,
        },
        reply_markup: {
          inline_keyboard: [
            [Markup.button.url('🔍 Choose a professional', url)],
            [Markup.button.callback('❌ No, thanks', 'delete_message')],
          ],
        },
      },
    );
  }

  async PrivateFlow(ctx: Context) {
    const text = (ctx.message as any)?.text;
    if (!text) return;

    // Игнорируем Telegram-команды (например, /start), чтобы они не улетали в админский чат
    if (text.startsWith('/')) {
      return;
    }

    await this.chatService.messageFromTGToAdmin(ctx);
  }

  async handleMessage(ctx: Context) {
    try {
      // Написал в личку
      if (ctx.chat.type === 'private') {
        return this.PrivateFlow(ctx);
      }
      // Написал в группу
      if (ctx.chat.type === 'group') {
        return this.AIFlow(ctx);
      }
    } catch (error) {
      this.logger.error('Message handling error:', error);
    }
  }

  @Get('/')
  // @CacheKey('SERVICES')
  // @CacheTTL(3600 * 24)
  getAll() {
    return this.servicesService.getAll();
  }

  // @Post('/')
  // addAddress(@Body() {id, ...body}: Service): any {
  //     return this.servicesService.create(body);
  // }
  //
  // @Put('/:id')
  // editAddress(@Param('id') id: number, @Body() body: any): any {
  //     return this.servicesService.update(body);
  // }
  //
  // @Delete('/:id')
  // deleteAddress(@Param('id') id: number): any {
  //     return this.servicesService.delete(Number(id));
  // }
}
