// src/modules/certificate/pdf/certificate.styles.ts
import { StyleSheet } from '@react-pdf/renderer';

export const certificateStyles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
  },
  frame: {
    flexGrow: 1,
    borderWidth: 2,
    borderColor: '#1a2744',
    paddingVertical: 56,
    paddingHorizontal: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 28,
    color: '#1a2744',
  },
  body: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 1.5,
    color: '#333333',
  },
  name: {
    fontSize: 20,
    marginVertical: 16,
    color: '#1a2744',
  },
  footer: {
    marginTop: 48,
    fontSize: 9,
    color: '#666666',
  },
});
