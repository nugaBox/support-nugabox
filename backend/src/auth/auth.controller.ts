import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ActiveUserGuard } from './guards/active-user.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
  logout(@CurrentUser() user: User, @Body() dto: LogoutDto) {
    return this.auth.logout(user.id, dto.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
  me(@CurrentUser() user: User) {
    return this.auth.me(user.id);
  }
}
