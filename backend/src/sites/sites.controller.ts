import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { SitesService } from './sites.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';

@Controller('sites')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard)
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const only = activeOnly === 'true' || activeOnly === '1';
    return this.sites.listForUser(user, only);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSiteDto) {
    return this.sites.create(dto);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  get(@Param('id') id: string) {
    return this.sites.getByIdAdmin(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.sites.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.sites.softDelete(id);
  }
}
