// src/modules/certificate/pdf/certificate.styles.ts
import { StyleSheet } from '@react-pdf/renderer';

export const certificateStyles = StyleSheet.create({
  page: {
    padding: 28,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  outerFrame: {
    flexGrow: 1,
    borderWidth: 3,
    borderColor: '#1a2744',
    padding: 10,
  },
  innerFrame: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#c9a227',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 64,
  },
  title: {
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    color: '#1a2744',
    textAlign: 'center',
  },
  divider: {
    width: 140,
    height: 2,
    backgroundColor: '#c9a227',
    marginTop: 14,
    marginBottom: 26,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.6,
    color: '#333333',
  },
  highlight: {
    fontFamily: 'Helvetica-Bold',
    color: '#1a2744',
  },
  name: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    marginVertical: 20,
    color: '#1a2744',
    textAlign: 'center',
  },
  details: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    color: '#555555',
    lineHeight: 1.5,
  },
  footerDivider: {
    width: '70%',
    height: 1,
    backgroundColor: '#d9d9d9',
    marginTop: 44,
    marginBottom: 12,
  },
  footerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
  },
  footer: {
    fontSize: 10,
    color: '#666666',
  },
});
