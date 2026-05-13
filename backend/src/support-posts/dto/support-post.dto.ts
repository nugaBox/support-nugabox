import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PostCategory, PostStatus } from '@prisma/client';

export class CreateSupportPostDto {
  @IsString()
  @IsNotEmpty()
  siteId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(PostCategory)
  category!: PostCategory;
}

export class UpdateSupportPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;
}

export class PatchPostStatusDto {
  @IsEnum(PostStatus)
  status!: PostStatus;
}

export class PatchProgressNoteDto {
  @IsString()
  progressNote!: string;
}
