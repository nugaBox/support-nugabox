import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, PutUserSitesDto, UpdateUserDto } from './dto/user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normUsername(raw: string) {
    return raw.trim().toLowerCase();
  }

  async list() {
    const rows = await this.prisma.user.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    return rows.map(this.mapUser);
  }

  async create(dto: CreateUserDto) {
    const username = this.normUsername(dto.username);
    const exists = await this.prisma.user.findFirst({
      where: { username, deleted_at: null },
    });
    if (exists) throw new ConflictException('이미 사용 중인 아이디입니다.');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        password_hash: hash,
        name: dto.name.trim(),
        role: dto.role,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    return this.mapUser(user);
  }

  async getById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!user) throw new NotFoundException();
    return this.mapUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureExists(id);
    if (dto.username) {
      const username = this.normUsername(dto.username);
      const dup = await this.prisma.user.findFirst({
        where: {
          username,
          deleted_at: null,
          NOT: { id },
        },
      });
      if (dup) throw new ConflictException('이미 사용 중인 아이디입니다.');
    }
    const data: Record<string, unknown> = {};
    if (dto.username !== undefined) data.username = this.normUsername(dto.username);
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.isActive !== undefined) data.is_active = dto.isActive;
    if (dto.password !== undefined) {
      data.password_hash = await bcrypt.hash(dto.password, 10);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    return this.mapUser(user);
  }

  async activate(id: string) {
    await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { is_active: true },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    return this.mapUser(user);
  }

  async deactivate(id: string) {
    await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { is_active: false },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    await this.prisma.refreshToken.deleteMany({ where: { user_id: id } });
    return this.mapUser(user);
  }

  async softDelete(id: string) {
    await this.ensureExists(id);
    await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
    await this.prisma.refreshToken.deleteMany({ where: { user_id: id } });
    return { ok: true };
  }

  async getUserSites(userId: string) {
    await this.ensureExists(userId);
    const rows = await this.prisma.userSite.findMany({
      where: { user_id: userId },
      include: { site: true },
    });
    return rows
      .filter((r) => !r.site.deleted_at)
      .map((r) => ({
        id: r.site.id,
        name: r.site.name,
        code: r.site.code,
        description: r.site.description,
        isActive: r.site.is_active,
        createdAt: r.site.created_at.toISOString(),
        updatedAt: r.site.updated_at.toISOString(),
      }));
  }

  async putUserSites(userId: string, dto: PutUserSitesDto) {
    await this.ensureExists(userId);
    const sites = await this.prisma.site.findMany({
      where: { id: { in: dto.siteIds }, deleted_at: null },
    });
    if (sites.length !== dto.siteIds.length) {
      throw new ConflictException('존재하지 않는 사이트가 포함되어 있습니다.');
    }
    await this.prisma.$transaction([
      this.prisma.userSite.deleteMany({ where: { user_id: userId } }),
      ...dto.siteIds.map((siteId) =>
        this.prisma.userSite.create({
          data: { user_id: userId, site_id: siteId },
        }),
      ),
    ]);
    return this.getUserSites(userId);
  }

  private async ensureExists(id: string) {
    const u = await this.prisma.user.findFirst({ where: { id, deleted_at: null } });
    if (!u) throw new NotFoundException();
  }

  private mapUser(user: {
    id: string;
    username: string;
    name: string;
    role: Role;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    };
  }
}
