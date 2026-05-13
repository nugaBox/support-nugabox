import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  /** 목록: ADMIN은 전체(삭제 제외), MEMBER는 매핑된 활성 사이트만 */
  async listForUser(user: User, activeOnly?: boolean) {
    if (user.role === Role.ADMIN) {
      const list = await this.prisma.site.findMany({
        where: {
          deleted_at: null,
          ...(activeOnly ? { is_active: true } : {}),
        },
        orderBy: { name: 'asc' },
      });
      return list.map((s) => this.mapSite(s));
    }
    const rows = await this.prisma.userSite.findMany({
      where: { user_id: user.id },
      include: { site: true },
    });
    return rows
      .map((r) => r.site)
      .filter((s) => !s.deleted_at && s.is_active && (!activeOnly || s.is_active))
      .map((s) => this.mapSite(s));
  }

  async create(dto: CreateSiteDto) {
    const code = dto.code.trim().toUpperCase();
    const dup = await this.prisma.site.findFirst({
      where: { code, deleted_at: null },
    });
    if (dup) throw new ConflictException('이미 사용 중인 사이트 코드입니다.');
    const site = await this.prisma.site.create({
      data: {
        name: dto.name.trim(),
        code,
        description: dto.description?.trim() ?? null,
        is_active: dto.isActive ?? true,
      },
    });
    return this.mapSite(site);
  }

  async getByIdAdmin(id: string) {
    const site = await this.prisma.site.findFirst({
      where: { id, deleted_at: null },
    });
    if (!site) throw new NotFoundException();
    return this.mapSite(site);
  }

  async update(id: string, dto: UpdateSiteDto) {
    await this.ensureExists(id);
    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const dup = await this.prisma.site.findFirst({
        where: { code, deleted_at: null, NOT: { id } },
      });
      if (dup) throw new ConflictException('이미 사용 중인 사이트 코드입니다.');
      dto.code = code;
    }
    const site = await this.prisma.site.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isActive !== undefined ? { is_active: dto.isActive } : {}),
      },
    });
    return this.mapSite(site);
  }

  async softDelete(id: string) {
    await this.ensureExists(id);
    await this.prisma.site.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
    return { ok: true };
  }

  /** 문의 등록 시 사이트 선택 검증 */
  async assertUserCanUseSite(user: User, siteId: string) {
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, deleted_at: null, is_active: true },
    });
    if (!site) throw new NotFoundException('사이트를 찾을 수 없습니다.');
    if (user.role === Role.ADMIN) return site;
    const map = await this.prisma.userSite.findFirst({
      where: { user_id: user.id, site_id: siteId },
    });
    if (!map) {
      throw new ForbiddenException('선택한 사이트에 대한 접근 권한이 없습니다.');
    }
    return site;
  }

  private async ensureExists(id: string) {
    const s = await this.prisma.site.findFirst({ where: { id, deleted_at: null } });
    if (!s) throw new NotFoundException();
  }

  private mapSite(site: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: site.id,
      name: site.name,
      code: site.code,
      description: site.description,
      isActive: site.is_active,
      createdAt: site.created_at.toISOString(),
      updatedAt: site.updated_at.toISOString(),
    };
  }
}
