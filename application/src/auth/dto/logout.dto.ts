import { IsBoolean, IsOptional } from 'class-validator';

export class LogoutDTO {
  @IsBoolean()
  @IsOptional()
  all?: boolean;
}
