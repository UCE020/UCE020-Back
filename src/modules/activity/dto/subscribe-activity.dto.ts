import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class SubscribeActivityDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId!: number;
}
