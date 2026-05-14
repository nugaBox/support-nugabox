import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  @Matches(USERNAME_RE, {
    message: '아이디는 영문, 숫자, . _ - 만 사용할 수 있습니다.',
  })
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(Role)
  role!: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 32)
  @Matches(USERNAME_RE, {
    message: '아이디는 영문, 숫자, . _ - 만 사용할 수 있습니다.',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PutUserSitesDto {
  /** 매핑할 사이트 ID 전체 목록 (교체 방식) */
  @IsString({ each: true })
  siteIds!: string[];
}
