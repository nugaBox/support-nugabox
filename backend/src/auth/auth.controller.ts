import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshDto } from './dto/login.dto';
import { ExchangeLoginTokenDto } from './dto/login-token.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
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

  @Post('login-token')
  loginWithToken(@Body() dto: ExchangeLoginTokenDto) {
    return this.auth.loginWithToken(dto.token);
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

  @Patch('me')
  @UseGuards(AuthGuard('jwt'), ActiveUserGuard)
  patchMe(@CurrentUser() user: User, @Body() dto: UpdateMyProfileDto) {
    return this.auth.updateMyProfile(user.id, dto);
  }
}
