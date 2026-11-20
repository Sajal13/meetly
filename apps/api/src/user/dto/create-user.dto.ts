import { IsEmail, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @Min(6)
  password: string;
}
