// src/modules/certificate/pdf/guest-certificate.pdf.ts
import * as React from 'react';
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { streamToBuffer } from './stream-to-buffer';
import { certificateStyles as styles } from './certificate.styles';

export type GuestCertificateData = {
  certificateId: number;
  guestName: string;
  role: string;
  eventName: string;
  activityName: string;
  workloadHours?: number | null;
  issueDate: Date;
};

function buildDocument(data: GuestCertificateData) {
  const participationText = data.workloadHours
    ? `participou como ${data.role} da atividade "${data.activityName}", parte do evento "${data.eventName}", com carga horária de ${data.workloadHours} hora(s).`
    : `participou como ${data.role} da atividade "${data.activityName}", parte do evento "${data.eventName}".`;

  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: styles.page },
      React.createElement(
        View,
        { style: styles.frame },
        React.createElement(Text, { style: styles.title }, 'Certificado'),
        React.createElement(Text, { style: styles.body }, 'Certificamos que'),
        React.createElement(Text, { style: styles.name }, data.guestName),
        React.createElement(Text, { style: styles.body }, participationText),
        React.createElement(
          Text,
          { style: styles.body },
          `Emitido em ${data.issueDate.toLocaleDateString('pt-BR')}.`,
        ),
        React.createElement(
          Text,
          { style: styles.footer },
          `Certificado nº ${data.certificateId}`,
        ),
      ),
    ),
  );
}

export async function renderGuestCertificatePdf(
  data: GuestCertificateData,
): Promise<Buffer> {
  const stream = await pdf(buildDocument(data)).toBuffer();
  return streamToBuffer(stream);
}
