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
  location: string;
  eventDate: string;
  issueDate: Date;
};

function buildDocument(data: ParticipantCertificateData) {
  return React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: styles.page },
      React.createElement(
        View,
        { style: styles.outerFrame },
        React.createElement(
          View,
          { style: styles.innerFrame },
          React.createElement(Text, { style: styles.title }, 'CERTIFICADO'),
          React.createElement(View, { style: styles.divider }),
          React.createElement(Text, { style: styles.body }, 'Certificamos que'),
          React.createElement(Text, { style: styles.name }, data.participantName),
          React.createElement(
            Text,
            { style: styles.body },
            'participou do evento "',
            React.createElement(Text, { style: styles.highlight }, data.eventName),
            '" como ',
            React.createElement(Text, { style: styles.highlight }, data.role),
            data.workloadHours
              ? `, com carga horária total de ${data.workloadHours} hora(s).`
              : '.',
          ),
          React.createElement(
            Text,
            { style: styles.details },
            `Local: ${data.location}   •   Período: ${data.eventDate}`,
          ),
          React.createElement(View, { style: styles.footerDivider }),
          React.createElement(
            View,
            { style: styles.footerRow },
            React.createElement(
              Text,
              { style: styles.footer },
              `Emitido em ${data.issueDate.toLocaleDateString('pt-BR')}`,
            ),
            React.createElement(
              Text,
              { style: styles.footer },
              `Certificado nº ${data.certificateId}`,
            ),
          ),
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
