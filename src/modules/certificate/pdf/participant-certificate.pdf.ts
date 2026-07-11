// src/modules/certificate/pdf/participant-certificate.pdf.ts
import * as React from 'react';
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { streamToBuffer } from './stream-to-buffer';
import { certificateStyles as styles } from './certificate.styles';

export type ParticipantCertificateData = {
  certificateId: number;
  participantName: string;
  role: string;
  eventName: string;
  workloadHours?: number | null;
  issueDate: Date;
};

function buildDocument(data: ParticipantCertificateData) {
  const participationText = data.workloadHours
    ? `participou do evento "${data.eventName}" como ${data.role}, com carga horária total de ${data.workloadHours} hora(s).`
    : `participou do evento "${data.eventName}" como ${data.role}.`;

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
        React.createElement(Text, { style: styles.name }, data.participantName),
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

export async function renderParticipantCertificatePdf(
  data: ParticipantCertificateData,
): Promise<Buffer> {
  const stream = await pdf(buildDocument(data)).toBuffer();
  return streamToBuffer(stream);
}
