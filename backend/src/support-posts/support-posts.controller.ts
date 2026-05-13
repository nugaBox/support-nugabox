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
import { User } from '@prisma/client';
import { SupportPostsService } from './support-posts.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import {
  CreateSupportPostDto,
  PatchPostStatusDto,
  PatchProgressNoteDto,
  UpdateSupportPostDto,
} from './dto/support-post.dto';
import { ListSupportPostsQueryDto } from './dto/list-query.dto';

@Controller('support-posts')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard)
export class SupportPostsController {
  constructor(private readonly posts: SupportPostsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() query: ListSupportPostsQueryDto) {
    return this.posts.list(user, query);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateSupportPostDto) {
    return this.posts.create(user, dto);
  }

  @Get(':id')
  getOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.posts.getOne(user, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSupportPostDto,
  ) {
    return this.posts.update(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.posts.softDelete(user, id);
  }

  @Patch(':id/status')
  patchStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: PatchPostStatusDto,
  ) {
    return this.posts.patchStatus(user, id, dto);
  }

  @Patch(':id/progress-note')
  patchProgress(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: PatchProgressNoteDto,
  ) {
    return this.posts.patchProgressNote(user, id, dto);
  }
}
