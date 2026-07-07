import { PartialType, OmitType} from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { Type } from 'class-transformer';
import { UpdateActivityDto } from 'src/modules/activity/dto/update-acitivity.dto';
import { IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';

class ActivityItemDto extends UpdateActivityDto {
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['atividades'] as const),
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityItemDto)
  atividades?: ActivityItemDto[];
}
