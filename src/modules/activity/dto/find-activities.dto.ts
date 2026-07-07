import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllActivitiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  eventId?: number;
}