import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { CreateUserDto, PutUserSitesDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.users.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.users.deactivate(id);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string) {
    return this.users.resetPasswordToUsername(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.softDelete(id);
  }

  @Get(':id/sites')
  sites(@Param('id') id: string) {
    return this.users.getUserSites(id);
  }

  @Put(':id/sites')
  putSites(@Param('id') id: string, @Body() dto: PutUserSitesDto) {
    return this.users.putUserSites(id, dto);
  }

  @Get(':id/login-token')
  loginTokenStatus(@Param('id') id: string) {
    return this.users.getLoginTokenStatus(id);
  }

  @Post(':id/login-token')
  issueLoginToken(@Param('id') id: string) {
    return this.users.issueLoginToken(id);
  }

  @Delete(':id/login-token')
  revokeLoginToken(@Param('id') id: string) {
    return this.users.revokeLoginToken(id);
  }
}
