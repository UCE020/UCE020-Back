import { StyleSheet } from '@react-pdf/renderer';
import { Font }       from '@react-pdf/renderer';
import { join }       from 'path';

Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: join(process.cwd(), 'src', 'resources', 'fonts', 'Poppins-Regular.ttf'),
      fontWeight: 400,
    },
    {
      src: join(process.cwd(), 'src', 'resources', 'fonts', 'Poppins-Bold.ttf'),
      fontWeight: 700,
    },
    {
      src: join(process.cwd(), 'src', 'resources', 'fonts', 'Poppins-Italic.ttf'),
      fontWeight: 400,
      fontStyle: 'italic'
    },
  ],
});

export const certificateStyles = StyleSheet.create({

  page: {
    padding: 0,
    fontFamily: 'Poppins',
    backgroundColor: '#ffffff',
  },

  // Borda externa com cantos decorativos — linha verde
  outerBorder: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 2,
    borderColor: '#2EC4A0',
    borderStyle: 'solid',
  },

  // Canto superior esquerdo
  cornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopColor: '#0F1D35',
    borderLeftColor: '#0F1D35',
  },
  // Canto superior direito
  cornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopColor: '#0F1D35',
    borderRightColor: '#0F1D35',
  },
  // Canto inferior esquerdo
  cornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomColor: '#0F1D35',
    borderLeftColor: '#0F1D35',
  },
  // Canto inferior direito
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: '#0F1D35',
    borderRightColor: '#0F1D35',
  },

  // Container principal
  content: {
    flexGrow: 1,
    paddingHorizontal: 64,
    paddingTop: 32,
    paddingBottom: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Header — logo
  headerSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },

  logo: {
    width: 140,
    height: 56,
    objectFit: 'contain',
  },

  // Tipo do certificado + nome do evento
  certTypeSection: {
    alignItems: 'center',
    width: '100%',
  },

  certTypeLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0F1D35',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },

  eventName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2EC4A0',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 1.3,
  },

  // Corpo central
  bodySection: {
    alignItems: 'center',
    width: '100%',
  },

  certificamosQue: {
    fontSize: 10,
    fontWeight: 400,
    color: '#64748B',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },

  participantName: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0F1D35',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    lineHeight: 1.2,
  },

  descriptionText: {
    fontSize: 11,
    fontWeight: 400,
    color: '#475467',
    textAlign: 'center',
    lineHeight: 1.8,
    maxWidth: 500,
  },

  descriptionBold: {
    fontWeight: 700,
    color: '#0F1D35',
  },

  // Linha de detalhes — local, período, carga horária
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },

  detailBlock: {
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: '#94A3B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0F1D35',
    textAlign: 'center',
  },

  detailSeparator: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  // Assinaturas
  signaturesSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 40,
    marginTop: 40, 
  },

  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },

  signatureLine: {
    width: 180,
    height: 1,
    backgroundColor: '#0F1D35',
    marginBottom: 10, 
  },

  signatureNameSpace: {
    fontSize: 9,
    fontWeight: 400,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 3,
    lineHeight: 1.4,
  },

  signatureTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: '#0F1D35',
    textAlign: 'center',
    lineHeight: 1.5,
  },

  // Seção fixa de Apoio (logo UEFS)
  apoioSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  },

  apoioLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#94A3B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  apoioLogo: {
    width: 90,
    height: 32,
    objectFit: 'contain',
  },

  // Rodapé
  footerSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },

  footerLeft: {
    flex: 1,
    textAlign: 'left',
    fontSize: 8,
    fontWeight: 400,
    color: '#94A3B8',
  },

  footerCenter: {
    flex: 1.5,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 400,
    color: '#94A3B8',
  },

  footerRight: {
    flex: 1,
    textAlign: 'right',
    fontSize: 8,
    fontWeight: 400,
    color: '#CBD5E1',
  },
});