import { IsOptional, IsString } from 'class-validator';

/** 본인 프로필 수정 — 아이디(username)는 변경 불가 */
export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
