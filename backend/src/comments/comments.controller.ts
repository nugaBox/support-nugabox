import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Controller('support-posts')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard)
export class PostCommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get(':postId/comments')
  list(@CurrentUser() user: User, @Param('postId') postId: string) {
    return this.comments.listForPost(user, postId);
  }

  @Post(':postId/comments')
  create(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(user, postId, dto);
  }
}

@Controller('comments')
@UseGuards(AuthGuard('jwt'), ActiveUserGuard)
export class CommentsRestController {
  constructor(private readonly comments: CommentsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.comments.update(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.comments.remove(user, id);
  }
}
