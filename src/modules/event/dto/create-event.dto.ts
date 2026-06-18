import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  Min,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  nome!: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  descricao!: string;

  @IsString()
  localizacao!: string;

  @IsString()
  responsavel!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cargaHoraria!: number;

  @Type(() => Date)
  @IsDate()
  dataInicio!: Date;

  @Type(() => Date)
  @IsDate()
  dataFim!: Date;

  @IsEnum(['pendente', 'iniciada', 'andamento', 'finalizada'])
  status!: 'pendente' | 'iniciada' | 'andamento' | 'finalizada';

  @IsString()
  @IsOptional()
  foto?: string;
}
