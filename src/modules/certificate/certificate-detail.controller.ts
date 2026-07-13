// src/modules/certificate/certificate-detail.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CertificateService } from './certificate.service';

@ApiTags('certificate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('certificate')
export class CertificateDetailController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um certificado (de convidado ou de participante) pelo id',
  })
  @ApiOkResponse({ description: 'Certificado encontrado.' })
  @ApiNotFoundResponse({ description: 'Certificado não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  getCertificateById(@Param('id') id: string) {
    return this.certificateService.getCertificateById(id);
  }
}
