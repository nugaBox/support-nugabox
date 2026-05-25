import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENTS_PER_POST,
} from './attachment.constants';
import { normalizeAttachmentFileName } from './attachment-filename';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private uploadDir(): string {
    return process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
  }

  async saveMany(current: User, postId: string, files: Express.Multer.File[]) {
    const post = await this.prisma.supportPost.findFirst({
      where: { id: postId, deleted_at: null },
    });
    if (!post) throw new NotFoundException();
    this.assertPostAccess(current, post.user_id);

    const existing = await this.prisma.attachment.count({
      where: { post_id: postId, deleted_at: null },
    });
    if (existing + files.length > MAX_ATTACHMENTS_PER_POST) {
      throw new BadRequestException(
        `첨부파일은 최대 ${MAX_ATTACHMENTS_PER_POST}개까지 가능합니다.`,
      );
    }

    const dir = this.uploadDir();
    await fs.promises.mkdir(dir, { recursive: true });

    const created = [];
    for (const file of files) {
      const originalName = normalizeAttachmentFileName(file.originalname);
      this.validateFile(file, originalName);
      const ext = path.extname(originalName).slice(1).toLowerCase();
      const stored = `${uuidv4()}.${ext}`;
      const dest = path.join(dir, stored);
      await fs.promises.writeFile(dest, file.buffer);

      const row = await this.prisma.attachment.create({
        data: {
          post_id: postId,
          original_name: originalName,
          stored_name: stored,
          mime_type: file.mimetype,
          size: file.size,
          path: dest,
        },
      });
      created.push(row);
    }

    return created.map((a) => ({
      id: a.id,
      originalName: normalizeAttachmentFileName(a.original_name),
      mimeType: a.mime_type,
      size: a.size,
      createdAt: a.created_at.toISOString(),
    }));
  }

  async remove(current: User, attachmentId: string) {
    const att = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, deleted_at: null },
      include: { post: true },
    });
    if (!att) throw new NotFoundException();
    this.assertPostAccess(current, att.post.user_id);

    await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: { deleted_at: new Date() },
    });
    try {
      await fs.promises.unlink(att.path);
    } catch {
      /* 파일 없음 등은 무시 */
    }
    return { ok: true };
  }

  async getDownloadStream(current: User, attachmentId: string) {
    const att = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, deleted_at: null },
      include: { post: true },
    });
    if (!att) throw new NotFoundException();
    this.assertPostAccess(current, att.post.user_id);

    if (!fs.existsSync(att.path)) {
      throw new NotFoundException('파일이 존재하지 않습니다.');
    }
    const stream = fs.createReadStream(att.path);
    return {
      stream,
      fileName: normalizeAttachmentFileName(att.original_name),
      mimeType: att.mime_type,
      size: att.size,
    };
  }

  private assertPostAccess(current: User, authorId: string) {
    if (current.role === Role.ADMIN) return;
    if (current.id !== authorId) {
      throw new NotFoundException();
    }
  }

  private validateFile(file: Express.Multer.File, originalName: string) {
    const maxMb = Number.parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10);
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(`파일당 최대 ${maxMb}MB까지 업로드 가능합니다.`);
    }
    const ext = path.extname(originalName).slice(1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException('허용되지 않은 확장자입니다.');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('허용되지 않은 MIME 타입입니다.');
    }
  }
}
