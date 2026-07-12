import { StyleSheet } from '@react-pdf/renderer';

export const certificateStyles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },

  // Borda externa decorativa
  outerBorder: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 2,
    borderColor: '#0F1D35',
  },

  // Borda interna decorativa
  innerBorder: {
    position: 'absolute',
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
    borderWidth: 0.5,
    borderColor: '#2EC4A0',
  },

  // Container principal
  content: {
    flexGrow: 1,
    paddingHorizontal: 64,
    paddingVertical: 36,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Topo
  topSection: {
    alignItems: 'center',
    width: '100%',
  },

  certTypeLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#2EC4A0',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },

  eventName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0F1D35',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 1.3,
    marginBottom: 4,
  },

  topDivider: {
    width: '60%',
    height: 1,
    backgroundColor: '#2EC4A0',
    marginTop: 12,
  },

  // Corpo central
  bodySection: {
    alignItems: 'center',
    width: '100%',
  },

  certificamosQue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10,
  },

  participantName: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: '#0F1D35',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
    lineHeight: 1.2,
  },

  descriptionText: {
    fontSize: 12,
    color: '#475467',
    textAlign: 'center',
    lineHeight: 1.8,
    maxWidth: 480,
  },

  descriptionBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0F1D35',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },

  detailText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },

  detailDot: {
    fontSize: 10,
    color: '#2EC4A0',
  },

  // Assinaturas
  signaturesSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },

  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },

  signatureLine: {
    width: 180,
    height: 1,
    backgroundColor: '#0F1D35',
    marginBottom: 8,
  },

  signatureNameSpace: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 4,
    fontStyle: 'italic',
  },

  signatureTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0F1D35',
    textAlign: 'center',
    lineHeight: 1.5,
  },

  // Rodapé
  footerSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },

  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },

  footerBrand: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#2EC4A0',
    letterSpacing: 1.5,
  },
});