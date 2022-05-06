import { IsEmail, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
