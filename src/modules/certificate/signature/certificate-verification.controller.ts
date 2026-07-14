// src/modules/certificate/signature/certificate-verification.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CertificateSignatureService } from './certificate-signature.service';

// Rota PÚBLICA (sem JwtAuthGuard) — qualquer pessoa pode validar um certificado.
@ApiTags('certificate')
@Controller('certificate')
export class CertificateVerificationController {
  constructor(
    private readonly signatureService: CertificateSignatureService,
  ) {}

  @Get('verify/:codigo')
  @ApiOperation({
    summary:
      'Verificação pública de autenticidade de um certificado pelo código',
  })
  @ApiOkResponse({
    description: 'Retorna se o certificado é válido e os dados da assinatura.',
  })
  verify(@Param('codigo') codigo: string) {
    return this.signatureService.verify(codigo);
  }
}
