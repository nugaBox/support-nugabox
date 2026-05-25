import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { User } from '@prisma/client';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttachmentsService } from './attachments.service';
import { createAttachmentDisposition } from './attachment-filename';

const maxMb = Number.parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10);

@Controller()
@UseGuards(AuthGuard('jwt'), ActiveUserGuard)
export class AttachmentsController {
  constructor(private readonly attachments: AttachmentsService) {}

  @Post('support-posts/:postId/attachments')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: memoryStorage(),
      limits: { fileSize: maxMb * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) {
      return [];
    }
    return this.attachments.saveMany(user, postId, files);
  }

  @Get('attachments/:id/download')
  async download(@CurrentUser() user: User, @Param('id') id: string) {
    const { stream, fileName, mimeType } =
      await this.attachments.getDownloadStream(user, id);
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: createAttachmentDisposition(fileName),
    });
  }

  @Delete('attachments/:id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.attachments.remove(user, id);
  }
}
