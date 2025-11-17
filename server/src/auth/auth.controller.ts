import {
  Body,
  Controller,
  Get,
  Headers,
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
  constructor(
    private readonly bot: Telegraf,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
  ) {
    bot.on('contact', async (ctx) => {
      const contact = ctx.message.contact;

      // Проверка, что контакт принадлежит отправителю
      if (contact.user_id === ctx.from.id) {
        const phone = contact.phone_number;
        const item = await this.userService.getById(ctx.from.id.toString());

        item.phone = phone;

        // Действия с номером (сохранение в БД и т.д.)
        await this.userService.update(item);
      } else {
        ctx.reply('Это не ваш номер!');
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

  // @Patch('/phone')
  // @UseGuards(AuthGuard('jwt'))
  // async patchPhone(@Req() req, @Body() body: User) {
  //     const item = await this.userService.getById(req.user.id);
  //
  //     if (body.phone)
  //         item.phone = body.phone;
  //
  //     await this.userService.update(item);
  // }

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
