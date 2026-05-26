import { Type } from 'class-transformer';
import { IsNumber, IsDate, Min } from 'class-validator';

export class CreateParticipationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  eventId!: number;

  @Type(() => Date)
  @IsDate()
  registrationDate!: Date;
}
