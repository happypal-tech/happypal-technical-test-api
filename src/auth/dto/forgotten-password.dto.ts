import { IsEmail } from 'class-validator';

export class ForgottenPasswordDTO {
  @IsEmail()
  email: string;
}
