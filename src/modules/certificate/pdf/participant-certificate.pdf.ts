import * as React from 'react';
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { streamToBuffer } from './stream-to-buffer';
import { certificateStyles as styles } from './certificate.styles';

export type ParticipantCertificateData = {
  certificateId:     number;
  participantName:   string;
  role:              string;
  eventName:         string;
  workloadHours?:    number | null;
  location:          string;
  eventDate:         string;
  issueDate:         Date;
  assinante1Nome?:   string;
  assinante1Titulo?: string;
  assinante2Nome?:   string;
  assinante2Titulo?: string;
};

const ROLE_CERT_TITLE: Record<string, string> = {
  Ouvinte:     'Certificado de Participação',
  Monitor:     'Certificado de Monitoria',
  Organizador: 'Certificado de Organização',
};

function buildDocument(data: ParticipantCertificateData) {
  const e = React.createElement;
  const certTitle = ROLE_CERT_TITLE[data.role] ?? 'Certificado de Participação';

  const roleDescriptions: Record<string, string> = {
    Ouvinte:     'participou do evento',
    Monitor:     'atuou como monitor no evento',
    Organizador: 'atuou como organizador do evento',
  };
  const roleVerb = roleDescriptions[data.role] ?? 'participou do evento';

  return e(Document, {},
    e(Page, { size: 'A4', orientation: 'landscape', style: styles.page },

      // Bordas decorativas
      e(View, { style: styles.outerBorder }),
      e(View, { style: styles.innerBorder }),

      // Conteúdo
      e(View, { style: styles.content },

        // Topo — tipo do certificado + nome do evento
        e(View, { style: styles.topSection },
          e(Text, { style: styles.certTypeLabel }, certTitle),
          e(Text, { style: styles.eventName }, data.eventName.toUpperCase()),
          e(View, { style: styles.topDivider }),
        ),

        // Corpo — nome do participante
        e(View, { style: styles.bodySection },
          e(Text, { style: styles.certificamosQue }, 'Certificamos que'),
          e(Text, { style: styles.participantName }, data.participantName),

          e(Text, { style: styles.descriptionText },
            `${roleVerb} `,
            e(Text, { style: styles.descriptionBold }, `"${data.eventName}"`),
            data.workloadHours
              ? `, desempenhando uma carga horária de `
              : '.',
          ),
          ...(data.workloadHours ? [
            e(Text, { style: styles.descriptionText },
              e(Text, { style: styles.descriptionBold }, `${data.workloadHours} hora(s)`),
              ' pela participação.',
            ),
          ] : []),

          // Local e período
          e(View, { style: styles.detailsRow },
            e(Text, { style: styles.detailText }, data.location),
            e(Text, { style: styles.detailDot }, '•'),
            e(Text, { style: styles.detailText }, data.eventDate),
          ),
        ),

        // Assinaturas
        e(View, { style: styles.signaturesSection },
          // Assinante 1
          e(View, { style: styles.signatureBlock },
            e(View, { style: styles.signatureLine }),
            e(Text, { style: styles.signatureNameSpace },
              data.assinante1Nome ?? ' ',
            ),
            e(Text, { style: styles.signatureTitle },
              data.assinante1Titulo ?? ' ',
            ),
          ),
          // Assinante 2
          e(View, { style: styles.signatureBlock },
            e(View, { style: styles.signatureLine }),
            e(Text, { style: styles.signatureNameSpace },
              data.assinante2Nome ?? ' ',
            ),
            e(Text, { style: styles.signatureTitle },
              data.assinante2Titulo ?? ' ',
            ),
          ),
        ),

        // Rodapé
        e(View, { style: styles.footerSection },
          e(Text, { style: styles.footerText },
            `Emitido em ${data.issueDate.toLocaleDateString('pt-BR')}`,
          ),
          e(Text, { style: styles.footerBrand }, 'ASSINAÊ'),
          e(Text, { style: styles.footerText },
            `Certificado nº ${data.certificateId}`,
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