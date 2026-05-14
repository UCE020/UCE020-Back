import { Type } from 'class-transformer';
import { IsString, IsNumber, Min, IsOptional, isEnum, IsEnum } from 'class-validator';
import { categoriaAtividadeEnum } from 'src/db/schema/schema';

export class CreateActivityDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(categoriaAtividadeEnum.enumValues)
  type!: typeof categoriaAtividadeEnum.enumValues[number];

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  eventId!: number;
}
