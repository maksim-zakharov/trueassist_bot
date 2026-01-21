import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, validateInitData } from './auth.service';
import { UserService } from '../user/user.service';
import { Telegraf } from 'telegraf';
import { UserResponseDTO } from '../_dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApplicationService } from '../application/application.service';

@Controller('/api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly bot: Telegraf,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
  ) {
    // Регистрируем обработчик контакта первым, чтобы он имел приоритет
    bot.on('contact', async (ctx) => {
      try {
        this.logger.log(`Contact received from user ${ctx.from.id}`);
        const contact = ctx.message.contact;

        // Проверка, что контакт принадлежит отправителю
        if (contact.user_id === ctx.from.id) {
          const phone = contact.phone_number;
          this.logger.log(`Processing phone ${phone} for user ${ctx.from.id}`);
          
          let item = await this.userService.getById(ctx.from.id.toString());

          // Если пользователь не найден, создаем его
          if (!item) {
            this.logger.log(`User ${ctx.from.id} not found, creating new user`);
            item = await this.userService.create({
              id: ctx.from.id.toString(),
              first_name: ctx.from.first_name || '',
              last_name: ctx.from.last_name || '',
              username: ctx.from.username,
              phone_number: phone,
            });
            this.logger.log(`User ${ctx.from.id} created with phone ${phone}`);
          } else {
            this.logger.log(`Updating phone for user ${ctx.from.id}`);
            item.phone = phone;
            // Действия с номером (сохранение в БД и т.д.)
            await this.userService.update(item);
            this.logger.log(`Phone updated for user ${ctx.from.id}`);
          }
        } else {
          this.logger.warn(`Contact user_id ${contact.user_id} does not match sender ${ctx.from.id}`);
          ctx.reply('This is not your number!');
        }
      } catch (error) {
        this.logger.error('Error handling contact:', error);
      }
    });
  }

  @Post('/login')
  async login(@Headers() headers, @Body() { role }: { role?: string }) {
    const initData = headers['telegram-init-data'] as string;
    const refId = headers['refid'] as string;

    if (!validateInitData(initData)) {
      throw new UnauthorizedException({ message: 'Invalid Telegram data' });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(decodeURIComponent(params.get('user')));

    const user = await this.authService.validateUser(userData, refId);

    return this.authService.login(user, role);
  }


  @Get('/userinfo')
  @UseGuards(AuthGuard('jwt'))
  async getUserInfo(@Req() req) {
    return plainToInstance(UserResponseDTO, req.user);
  }

  @Get('/bonuses')
  @UseGuards(AuthGuard('jwt'))
  async getBonusOperations(@Req() req) {
    return this.userService.getBonusOperations(req.user.id);
  }
}
