// src/modules/certificate/signature/certificate-signature.controller.ts
import {
  Controller,
  Post,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import type { RequestWithUser } from 'src/common/types/request-with-user.type';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { CertificateSignatureService } from './certificate-signature.service';

@ApiTags('certificate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event/:eventoId/certificate')
export class CertificateSignatureController {
  constructor(
    private readonly signatureService: CertificateSignatureService,
  ) {}

  @Post('sign')
  @ApiOperation({
    summary:
      'Assinar em lote todos os certificados do evento (participantes, atividades e convidados)',
  })
  @ApiOkResponse({ description: 'Certificados assinados com sucesso.' })
  @ApiNotFoundResponse({
    description: 'Nenhum certificado pendente de assinatura.',
  })
  @ApiForbiddenResponse({
    description: 'Apenas organizadores podem assinar certificados.',
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiQuery({
    name: 'force',
    required: false,
    type: Boolean,
    description:
      'Se true, reassina também os certificados já assinados (regera o PDF).',
  })
  signEventCertificates(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Req() req: RequestWithUser,
    @Query('force', new ParseBoolPipe({ optional: true })) force = false,
  ) {
    return this.signatureService.signEventCertificates(
      eventoId,
      req.user.sub,
      force,
    );
  }
}
