// src/modules/certificate/certificate.module.ts
import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { AuthModule } from '../auth/auth.module';
import { CertificateRepository } from './repository/certificate.respository';
import { CertificateFileStorageService } from './storage/certificate-file-storage.service';
import { CertificateMeController } from './controller/certificate-me.controller';
import { CertificateController } from './controller/certificate.controller';
import { CertificateGuestController } from './controller/certificate-guest.controller';
import { CertificateParticipantController } from './controller/certificate-participant.controller';
import { CertificateDetailController } from './controller/certificate-detail.controller';
import { CertificateSignatureService } from './signature/certificate-signature.service';
import { CertificateSignatureController } from './signature/certificate-signature.controller';
import { CertificateVerificationController } from './signature/certificate-verification.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    CertificateController,
    CertificateGuestController,
    CertificateParticipantController,
    CertificateMeController,
    CertificateDetailController,
    CertificateSignatureController,
    CertificateVerificationController,
  ],
  providers: [
    CertificateService,
    CertificateRepository,
    CertificateFileStorageService,
    CertificateSignatureService,
  ],
})
export class CertificateModule {}
