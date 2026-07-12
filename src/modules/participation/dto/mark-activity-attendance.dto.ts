import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class MarkActivityAttendanceDto {
  @ApiProperty({
    description: 'ID do usuário inscrito que será marcado como presente',
    example: 42,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;
}
