import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PostCategory, PostStatus } from '@prisma/client';

export class ListSupportPostsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const n = Number.parseInt(String(value ?? '1'), 10);
    return Number.isNaN(n) ? 1 : n;
  })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => {
    const n = Number.parseInt(String(value ?? '20'), 10);
    return Number.isNaN(n) ? 20 : n;
  })
  pageSize?: number;
}
