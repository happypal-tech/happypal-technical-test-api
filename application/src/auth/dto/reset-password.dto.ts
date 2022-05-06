import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}
