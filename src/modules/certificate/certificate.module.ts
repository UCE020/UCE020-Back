// src/modules/certificate/certificate.module.ts
import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateGuestController } from './certificate-guest.controller';
import { CertificateParticipantController } from './certificate-participant.controller';
import { CertificateDetailController } from './certificate-detail.controller';
import { CertificateService } from './certificate.service';
import { AuthModule } from '../auth/auth.module';
import { CertificateRepository } from './repository/certificate.respository';
import { CertificateFileStorageService } from './storage/certificate-file-storage.service';
import { SupabaseStorageModule } from 'src/common/storage/supabase-storage.module';

@Module({
  imports: [AuthModule, SupabaseStorageModule],
  controllers: [
    CertificateController,
    CertificateGuestController,
    CertificateParticipantController,
    CertificateDetailController,
  ],
  providers: [
    CertificateService,
    CertificateRepository,
    CertificateFileStorageService,
  ],
})
export class CertificateModule {}
