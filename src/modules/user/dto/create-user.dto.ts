import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  cpf!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
