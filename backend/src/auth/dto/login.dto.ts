import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password!: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
