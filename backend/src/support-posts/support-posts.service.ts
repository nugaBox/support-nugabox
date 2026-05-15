import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PostCategory,
  PostStatus,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SitesService } from '../sites/sites.service';
import { sanitizeRichText } from '../common/sanitize';
import {
  CreateSupportPostDto,
  PatchPostStatusDto,
  PatchProgressNoteDto,
  UpdateSupportPostDto,
} from './dto/support-post.dto';
import { ListSupportPostsQueryDto } from './dto/list-query.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SupportPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sites: SitesService,
    private readonly notifications: NotificationService,
  ) {}

  async list(current: User, query: ListSupportPostsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const andFilters: Prisma.SupportPostWhereInput[] = [];

    if (query.search?.trim()) {
      const q = query.search.trim();
      andFilters.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.SupportPostWhereInput = {
      deleted_at: null,
      ...(current.role === Role.MEMBER ? { user_id: current.id } : {}),
      ...(query.siteId ? { site_id: query.siteId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(current.role === Role.ADMIN && query.authorId
        ? { user_id: query.authorId }
        : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            created_at: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...(andFilters.length ? { AND: andFilters } : {}),
    };

    const [total, statusGroups, rows] = await this.prisma.$transaction([
      this.prisma.supportPost.count({ where }),
      this.prisma.supportPost.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.supportPost.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updated_at: 'desc' },
        include: {
          site: true,
          author: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of Object.values(PostStatus)) {
      statusCounts[s] = 0;
    }
    for (const g of statusGroups) {
      const c = g._count;
      const n = typeof c === 'object' && c !== null && '_all' in c ? Number(c._all) : 0;
      statusCounts[g.status] = n;
    }

    return {
      items: rows.map((r) => this.mapListItem(r)),
      total,
      page,
      pageSize,
      statusCounts,
    };
  }

  async getOne(current: User, id: string) {
    const post = await this.prisma.supportPost.findFirst({
      where: { id, deleted_at: null },
      include: {
        site: true,
        author: { select: { id: true, name: true, username: true, role: true } },
        attachments: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
        },
        comments: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        history: {
          orderBy: { created_at: 'desc' },
          include: {
            changedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!post) throw new NotFoundException();
    this.assertPostReadable(current, post.user_id);
    return this.mapDetail(post);
  }

  async create(current: User, dto: CreateSupportPostDto) {
    await this.sites.assertUserCanUseSite(current, dto.siteId);
    const content = sanitizeRichText(dto.content);
    const post = await this.prisma.supportPost.create({
      data: {
        site_id: dto.siteId,
        user_id: current.id,
        title: dto.title.trim(),
        content,
        category: dto.category,
        status: PostStatus.WAITING,
        is_private: true,
      },
      include: {
        site: true,
        author: { select: { id: true, name: true, username: true, role: true } },
      },
    });
    void this.notifications
      .notifyPostCreated({
        postId: post.id,
        siteName: post.site.name,
        category: post.category,
        status: post.status,
        title: post.title,
        authorName: post.author.name,
        createdAtIso: post.created_at.toISOString(),
      })
      .catch(() => undefined);
    return this.getOne(current, post.id);
  }

  async update(current: User, id: string, dto: UpdateSupportPostDto) {
    await this.findAccessiblePost(current, id);
    const content =
      dto.content !== undefined ? sanitizeRichText(dto.content) : undefined;
    const updated = await this.prisma.supportPost.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
      },
      include: {
        site: true,
        author: { select: { id: true, name: true, username: true, role: true } },
        attachments: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
        },
        comments: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        history: {
          orderBy: { created_at: 'desc' },
          include: {
            changedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
    return this.mapDetail(updated);
  }

  async softDelete(current: User, id: string) {
    await this.findAccessiblePost(current, id);
    await this.prisma.supportPost.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return { ok: true };
  }

  async patchStatus(current: User, id: string, dto: PatchPostStatusDto) {
    if (current.role !== Role.ADMIN) {
      throw new ForbiddenException('상태 변경은 관리자만 가능합니다.');
    }
    const post = await this.prisma.supportPost.findFirst({
      where: { id, deleted_at: null },
      include: { site: true, author: { select: { id: true, name: true } } },
    });
    if (!post) throw new NotFoundException();
    const before = post.status;
    const after = dto.status;
    await this.prisma.$transaction(async (tx) => {
      await tx.supportPost.update({
        where: { id },
        data: { status: after },
      });
      await tx.statusHistory.create({
        data: {
          post_id: id,
          before_status: before,
          after_status: after,
          changed_by_user_id: current.id,
        },
      });
    });
    void this.notifications
      .notifyPostStatusChanged({
        postId: post.id,
        siteName: post.site.name,
        title: post.title,
        authorName: post.author.name,
        beforeStatus: before,
        afterStatus: after,
        changedByName: current.name,
        changedAtIso: new Date().toISOString(),
      })
      .catch(() => undefined);
    return this.getOne(current, id);
  }

  async patchProgressNote(current: User, id: string, dto: PatchProgressNoteDto) {
    if (current.role !== Role.ADMIN) {
      throw new ForbiddenException('진행내용 수정은 관리자만 가능합니다.');
    }
    const existing = await this.prisma.supportPost.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) throw new NotFoundException();
    const note = sanitizeRichText(dto.progressNote);
    const updated = await this.prisma.supportPost.update({
      where: { id },
      data: { progress_note: note },
      include: {
        site: true,
        author: { select: { id: true, name: true, username: true, role: true } },
        attachments: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
        },
        comments: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
          include: {
            user: { select: { id: true, username: true } },
          },
        },
        history: {
          orderBy: { created_at: 'desc' },
          include: {
            changedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
    return this.mapDetail(updated);
  }

  private async findAccessiblePost(current: User, id: string) {
    const post = await this.prisma.supportPost.findFirst({
      where: { id, deleted_at: null },
    });
    if (!post) throw new NotFoundException();
    this.assertPostReadable(current, post.user_id);
    return post;
  }

  private assertPostReadable(current: User, authorId: string) {
    if (current.role === Role.ADMIN) return;
    if (current.id !== authorId) {
      throw new NotFoundException();
    }
  }

  private mapListItem(row: {
    id: string;
    title: string;
    category: PostCategory;
    status: PostStatus;
    created_at: Date;
    updated_at: Date;
    site: { id: string; name: string };
    author: { id: string; name: string; username: string; role: Role };
  }) {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      site: { id: row.site.id, name: row.site.name },
      author: {
        id: row.author.id,
        name: row.author.name,
        username: row.author.username,
        role: row.author.role,
      },
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  private mapDetail(
    post: {
      id: string;
      title: string;
      content: string;
      category: PostCategory;
      status: PostStatus;
      progress_note: string | null;
      created_at: Date;
      updated_at: Date;
      site: { id: string; name: string; code: string };
      author: { id: string; name: string; username: string; role: Role };
      attachments: Array<{
        id: string;
        original_name: string;
        mime_type: string;
        size: number;
        created_at: Date;
      }>;
      comments: Array<{
        id: string;
        content: string;
        created_at: Date;
        updated_at: Date;
        user: { id: string; username: string };
      }>;
      history: Array<{
        id: string;
        before_status: PostStatus;
        after_status: PostStatus;
        created_at: Date;
        changedBy: { id: string; name: string };
      }>;
    },
  ) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      progressNote: post.progress_note,
      site: {
        id: post.site.id,
        name: post.site.name,
        code: post.site.code,
      },
      author: post.author,
      attachments: post.attachments.map((a) => ({
        id: a.id,
        originalName: a.original_name,
        mimeType: a.mime_type,
        size: a.size,
        createdAt: a.created_at.toISOString(),
      })),
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
        user: { id: c.user.id, username: c.user.username },
      })),
      statusHistory: post.history.map((h) => ({
        id: h.id,
        beforeStatus: h.before_status,
        afterStatus: h.after_status,
        changedAt: h.created_at.toISOString(),
        changedBy: h.changedBy,
      })),
      createdAt: post.created_at.toISOString(),
      updatedAt: post.updated_at.toISOString(),
    };
  }
}
