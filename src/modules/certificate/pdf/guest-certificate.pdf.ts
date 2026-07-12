import * as React from 'react';
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { streamToBuffer } from './stream-to-buffer';
import { certificateStyles as styles } from './certificate.styles';

export type GuestCertificateData = {
  certificateId:     number;
  guestName:         string;
  role:              string;
  eventName:         string;
  activityName:      string;
  workloadHours?:    number | null;
  location:          string;
  eventDate:         string;
  issueDate:         Date;
  assinante1Nome?:   string;
  assinante1Titulo?: string;
  assinante2Nome?:   string;
  assinante2Titulo?: string;
};

const GUEST_CERT_TITLE: Record<string, string> = {
  Palestrante: 'Certificado de Palestrante',
  Ministrante: 'Certificado de Ministrante',
  Moderador:   'Certificado de Moderador',
};

const GUEST_ROLE_VERB: Record<string, string> = {
  Palestrante: 'palestrou na atividade',
  Ministrante: 'ministrou a atividade',
  Moderador:   'moderou a atividade',
};

function buildDocument(data: GuestCertificateData) {
  const e = React.createElement;
  const certTitle = GUEST_CERT_TITLE[data.role] ?? 'Certificado de Participação';
  const roleVerb  = GUEST_ROLE_VERB[data.role]  ?? 'participou da atividade';

  return e(Document, {},
    e(Page, { size: 'A4', orientation: 'landscape', style: styles.page },

      e(View, { style: styles.outerBorder }),
      e(View, { style: styles.innerBorder }),

      e(View, { style: styles.content },

        // Topo
        e(View, { style: styles.topSection },
          e(Text, { style: styles.certTypeLabel }, certTitle),
          e(Text, { style: styles.eventName }, data.eventName.toUpperCase()),
          e(View, { style: styles.topDivider }),
        ),

        // Corpo
        e(View, { style: styles.bodySection },
          e(Text, { style: styles.certificamosQue }, 'Certificamos que'),
          e(Text, { style: styles.participantName }, data.guestName),

          e(Text, { style: styles.descriptionText },
            `${roleVerb} `,
            e(Text, { style: styles.descriptionBold }, `"${data.activityName}"`),
            ', parte do evento ',
            e(Text, { style: styles.descriptionBold }, `"${data.eventName}"`),
            data.workloadHours
              ? `, com carga horária de `
              : '.',
          ),
          ...(data.workloadHours ? [
            e(Text, { style: styles.descriptionText },
              e(Text, { style: styles.descriptionBold }, `${data.workloadHours} hora(s)`),
              '.',
            ),
          ] : []),

          e(View, { style: styles.detailsRow },
            e(Text, { style: styles.detailText }, data.location),
            e(Text, { style: styles.detailDot }, '•'),
            e(Text, { style: styles.detailText }, data.eventDate),
          ),
        ),

        // Assinaturas
        e(View, { style: styles.signaturesSection },
          e(View, { style: styles.signatureBlock },
            e(View, { style: styles.signatureLine }),
            e(Text, { style: styles.signatureNameSpace },
              data.assinante1Nome ?? ' ',
            ),
            e(Text, { style: styles.signatureTitle },
              data.assinante1Titulo ?? ' ',
            ),
          ),
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

export async function renderGuestCertificatePdf(
  data: GuestCertificateData,
): Promise<Buffer> {
  const stream = await pdf(buildDocument(data)).toBuffer();
  return streamToBuffer(stream);
}