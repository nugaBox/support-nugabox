import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeLoginTokenDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
