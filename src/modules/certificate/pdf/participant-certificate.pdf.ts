import * as React from 'react';
import { Document, Page, Text, View, Image, pdf } from '@react-pdf/renderer';
import { streamToBuffer }       from './stream-to-buffer';
import { certificateStyles as styles } from './certificate.styles';
import { LOGO_ASSINAE_SRC, LOGO_UEFS_SRC } from 'src/resources/certificatesConfig/certificate.assets';

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
  Ouvinte:     'CERTIFICADO DE PARTICIPAÇÃO',
  Monitor:     'CERTIFICADO DE MONITORIA',
  Organizador: 'CERTIFICADO DE ORGANIZAÇÃO',
};

const ROLE_VERB: Record<string, string> = {
  Ouvinte:     'participou do evento',
  Monitor:     'atuou como monitor no evento',
  Organizador: 'atuou como organizador do evento',
};

function buildDocument(data: ParticipantCertificateData) {
  const e = React.createElement;
  const certTitle = ROLE_CERT_TITLE[data.role] ?? 'CERTIFICADO DE PARTICIPAÇÃO';
  const roleVerb  = ROLE_VERB[data.role]       ?? 'participou do evento';

  return e(Document, {},
    e(Page, { size: 'A4', orientation: 'landscape', style: styles.page },

      // Borda verde
      e(View, { style: styles.outerBorder }),

      // Cantos decorativos em azul escuro
      e(View, { style: styles.cornerTL }),
      e(View, { style: styles.cornerTR }),
      e(View, { style: styles.cornerBL }),
      e(View, { style: styles.cornerBR }),

      e(View, { style: styles.content },

        // Logo
        e(View, { style: styles.headerSection },
          e(Image, { src: LOGO_ASSINAE_SRC, style: styles.logo }),
        ),

        // Tipo + nome do evento
        e(View, { style: styles.certTypeSection },
          e(Text, { style: styles.certTypeLabel }, certTitle),
          e(Text, { style: styles.eventName },     data.eventName),
        ),

        // Corpo
        e(View, { style: styles.bodySection },
          e(Text, { style: styles.certificamosQue }, 'Certificamos que'),
          e(Text, { style: styles.participantName }, data.participantName),

          e(Text, { style: styles.descriptionText },
            `${roleVerb} `,
            e(Text, { style: styles.descriptionBold }, `"${data.eventName}"`),
            data.workloadHours
              ? ', com carga horária de '
              : '.',
          ),
          ...(data.workloadHours ? [
            e(Text, { style: styles.descriptionText },
              e(Text, { style: styles.descriptionBold }, `${data.workloadHours} hora(s)`),
              ' pela participação.',
            ),
          ] : []),

          // Detalhes
          e(View, { style: styles.detailsRow },
            e(View, { style: styles.detailBlock },
              e(Text, { style: styles.detailLabel }, 'Local'),
              e(Text, { style: styles.detailValue }, data.location),
            ),
            e(View, { style: styles.detailSeparator }),
            e(View, { style: styles.detailBlock },
              e(Text, { style: styles.detailLabel }, 'Período'),
              e(Text, { style: styles.detailValue }, data.eventDate),
            ),
            ...(data.workloadHours ? [
              e(View, { style: styles.detailSeparator }),
              e(View, { style: styles.detailBlock },
                e(Text, { style: styles.detailLabel }, 'Carga Horária'),
                e(Text, { style: styles.detailValue }, `${data.workloadHours}h`),
              ),
            ] : []),
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

        // Apoio (fixa) — logo UEFS
        e(View, { style: styles.apoioSection },
          e(Text, { style: styles.apoioLabel }, 'Apoio:'),
          e(Image, { src: LOGO_UEFS_SRC, style: styles.apoioLogo }),
        ),

        // Rodapé (Atualizado com as novas classes de simetria)
        e(View, { style: styles.footerSection },
          e(Text, { style: styles.footerLeft }, `Emitido em ${data.issueDate.toLocaleDateString('pt-BR')}`),
          e(Text, { style: styles.footerCenter }, 'Universidade Estadual de Feira de Santana — UEFS'),
          e(Text, { style: styles.footerRight }, `Certificado nº ${data.certificateId}`),
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