import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizePlain } from '../common/sanitize';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForPost(current: User, postId: string) {
    const post = await this.prisma.supportPost.findFirst({
      where: { id: postId, deleted_at: null },
    });
    if (!post) throw new NotFoundException();
    this.assertPostAccess(current, post.user_id);

    const rows = await this.prisma.comment.findMany({
      where: { post_id: postId, deleted_at: null },
      orderBy: { created_at: 'asc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    return rows.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at.toISOString(),
      user: c.user,
    }));
  }

  async create(current: User, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.supportPost.findFirst({
      where: { id: postId, deleted_at: null },
    });
    if (!post) throw new NotFoundException();
    this.assertPostAccess(current, post.user_id);

    const content = sanitizePlain(dto.content);
    const c = await this.prisma.comment.create({
      data: {
        post_id: postId,
        user_id: current.id,
        content,
      },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    return {
      id: c.id,
      content: c.content,
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at.toISOString(),
      user: c.user,
    };
  }

  async update(current: User, commentId: string, dto: UpdateCommentDto) {
    const c = await this.prisma.comment.findFirst({
      where: { id: commentId, deleted_at: null },
      include: { post: true },
    });
    if (!c) throw new NotFoundException();
    this.assertPostAccess(current, c.post.user_id);
    if (current.role !== Role.ADMIN && c.user_id !== current.id) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }
    const content = sanitizePlain(dto.content);
    const u = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: { user: { select: { id: true, name: true, role: true } } },
    });
    return {
      id: u.id,
      content: u.content,
      createdAt: u.created_at.toISOString(),
      updatedAt: u.updated_at.toISOString(),
      user: u.user,
    };
  }

  async remove(current: User, commentId: string) {
    const c = await this.prisma.comment.findFirst({
      where: { id: commentId, deleted_at: null },
      include: { post: true },
    });
    if (!c) throw new NotFoundException();
    this.assertPostAccess(current, c.post.user_id);
    if (current.role !== Role.ADMIN && c.user_id !== current.id) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deleted_at: new Date() },
    });
    return { ok: true };
  }

  private assertPostAccess(current: User, authorId: string) {
    if (current.role === Role.ADMIN) return;
    if (current.id !== authorId) {
      throw new NotFoundException();
    }
  }
}
