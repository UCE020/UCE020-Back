import { BadRequestException } from '@nestjs/common';
import { tabelaEvento } from 'src/db/schema';

export function assertActivityDates(
  dataInicio: Date,
  dataFim: Date,
  evento: typeof tabelaEvento.$inferSelect,
) {
  if (dataFim < dataInicio) {
    throw new BadRequestException('A data de término não pode ser anterior à data de início.');
  }

  if (dataInicio < new Date()) {
    throw new BadRequestException('A data de início não pode ser no passado.');
  }

  if (dataInicio < evento.dataInicio || dataFim > evento.dataFim) {
    throw new BadRequestException('As datas da atividade devem estar dentro do intervalo do evento.');
  }
}