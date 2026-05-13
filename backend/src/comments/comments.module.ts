import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  CommentsRestController,
  PostCommentsController,
} from './comments.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PostCommentsController, CommentsRestController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
