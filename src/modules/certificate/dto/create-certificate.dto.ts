import { Type } from 'class-transformer';
import { IsNumber, IsDate, IsString, Min } from 'class-validator';

export class CreateCertificateDto {
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
  issueDate!: Date;

  @IsString()
  number!: string;
}
