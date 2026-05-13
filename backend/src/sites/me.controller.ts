import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { SitesService } from './sites.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';

/** GET /me/sites — 등록 화면용 활성 사이트 목록 */
@Controller('me')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard)
export class MeController {
  constructor(private readonly sites: SitesService) {}

  @Get('sites')
  mySites(@CurrentUser() user: User) {
    return this.sites.listForUser(user, true);
  }
}
