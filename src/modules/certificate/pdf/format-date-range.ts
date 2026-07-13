// src/modules/certificate/pdf/format-date-range.ts

export function formatDateRange(dataInicio: Date, dataFim: Date): string {
  const inicio = new Date(dataInicio).toLocaleDateString('pt-BR');
  const fim = new Date(dataFim).toLocaleDateString('pt-BR');

  return inicio === fim ? inicio : `${inicio} a ${fim}`;
}
