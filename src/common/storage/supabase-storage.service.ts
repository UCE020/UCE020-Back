import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import 'multer';

export type SupabaseStorageFolder = 'Perfil' | 'Evento' | 'Atividades' | 'Outros';

interface UploadBufferParams {
  folder: SupabaseStorageFolder;
  buffer: Buffer;
  originalName: string;
  contentType?: string;
  ownerId?: number | string;
}

const STORAGE_FOLDERS: SupabaseStorageFolder[] = [
  'Perfil',
  'Evento',
  'Atividades',
  'Outros',
];
const IMAGE_FOLDERS: SupabaseStorageFolder[] = ['Perfil', 'Evento', 'Atividades'];
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class SupabaseStorageService implements OnModuleInit {
  private readonly supabaseUrl: string;
  private readonly serviceKey: string;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;
  private readonly ensuredFolders = new Set<SupabaseStorageFolder>();

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.getRequiredEnv('SUPABASE_URL').replace(/\/+$/, '');
    this.serviceKey = this.getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'uploads';
    this.publicBaseUrl = this.configService
      .get<string>('SUPABASE_PUBLIC_STORAGE_URL')
      ?.replace(/\/+$/, '');
  }

  async onModuleInit() {
    await Promise.all(STORAGE_FOLDERS.map((folder) => this.ensureFolder(folder)));
  }

  async uploadBuffer({
    folder,
    buffer,
    originalName,
    contentType,
    ownerId,
  }: UploadBufferParams): Promise<string> {
    if (!buffer?.length) {
      throw new BadRequestException('Arquivo vazio ou inválido');
    }

    this.validateUpload(folder, buffer, originalName, contentType);

    await this.ensureFolder(folder);

    const filename = this.buildFilename(originalName, ownerId);
    const objectPath = `${folder}/${filename}`;
    const response = await this.fetchStorage(`/object/${this.bucket}/${objectPath}`, {
      method: 'POST',
      headers: {
        'cache-control': '3600',
        'content-type': contentType ?? 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: this.toBodyInit(buffer),
    });

    await this.assertStorageResponse(
      response,
      'Não foi possível enviar o arquivo ao Supabase',
    );

    return this.getPublicUrl(objectPath);
  }

  async uploadMulterFile(
    folder: SupabaseStorageFolder,
    file: Express.Multer.File,
    ownerId?: number | string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadBuffer({
      folder,
      buffer: file.buffer,
      originalName: file.originalname,
      contentType: file.mimetype,
      ownerId,
    });
  }

  async uploadDataUrl(
    folder: SupabaseStorageFolder,
    dataUrl: string,
    ownerId?: number | string,
  ): Promise<string> {
    const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
    if (!match) {
      throw new BadRequestException('Arquivo em base64 invalido');
    }

    const [, contentType, base64] = match;
    const extension = this.extensionFromContentType(contentType);

    return this.uploadBuffer({
      folder,
      buffer: Buffer.from(base64, 'base64'),
      originalName: `upload${extension}`,
      contentType,
      ownerId,
    });
  }

  async removeByPublicUrl(fileUrl?: string | null): Promise<void> {
    const objectPath = this.extractObjectPathFromPublicUrl(fileUrl);
    if (!objectPath) return;

    const response = await this.fetchStorage(`/object/${this.bucket}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prefixes: [objectPath] }),
    });

    await this.assertStorageResponse(
      response,
      'Não foi possível remover o arquivo do Supabase',
    );
  }

  async tryRemoveByPublicUrl(fileUrl?: string | null): Promise<boolean> {
    try {
      await this.removeByPublicUrl(fileUrl);
      return true;
    } catch {
      return false;
    }
  }

  async ensureFolder(folder: SupabaseStorageFolder): Promise<void> {
    if (this.ensuredFolders.has(folder)) return;

    const prefix = `${folder}/`;
    const listResponse = await this.fetchStorage(`/object/list/${this.bucket}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1 }),
    });

    await this.assertStorageResponse(
      listResponse,
      `Não foi possível verificar a pasta ${folder} no Supabase`,
    );

    const files = (await listResponse.json()) as unknown[];
    if (files.length === 0) {
      const markerResponse = await this.fetchStorage(
        `/object/${this.bucket}/${folder}/.keep`,
        {
          method: 'POST',
          headers: {
            'cache-control': '3600',
            'content-type': 'text/plain',
            'x-upsert': 'true',
          },
          body: this.toBodyInit(Buffer.from('')),
        },
      );

      await this.assertStorageResponse(
        markerResponse,
        `Não foi possível criar a pasta ${folder} no Supabase`,
      );
    }

    this.ensuredFolders.add(folder);
  }

  private fetchStorage(path: string, init: RequestInit): Promise<Response> {
    return fetch(`${this.supabaseUrl}/storage/v1${path}`, {
      ...init,
      headers: {
        apikey: this.serviceKey,
        authorization: `Bearer ${this.serviceKey}`,
        ...init.headers,
      },
    });
  }

  private toBodyInit(buffer: Buffer): BodyInit {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as BodyInit;
  }

  private async assertStorageResponse(response: Response, message: string) {
    if (response.ok) return;

    const details = await response.text();
    throw new InternalServerErrorException(
      `${message}: ${response.status} ${details}`,
    );
  }

  private getRequiredEnv(name: string): string {
    const value = this.configService.get<string>(name);
    if (!value) {
      throw new InternalServerErrorException(
        `Variável de ambiente ${name} não configurada`,
      );
    }

    return value;
  }

  private buildFilename(originalName: string, ownerId?: number | string): string {
    const extension = extname(originalName).toLowerCase();
    const rawName = originalName.slice(0, originalName.length - extension.length);
    const safeName = rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    const prefix = ownerId === undefined ? '' : `${ownerId}-`;

    return `${prefix}${safeName || 'arquivo'}-${randomUUID()}${extension}`;
  }

  private validateUpload(
    folder: SupabaseStorageFolder,
    buffer: Buffer,
    originalName: string,
    contentType?: string,
  ): void {
    if (!IMAGE_FOLDERS.includes(folder)) return;

    const normalizedContentType = contentType?.toLowerCase();
    const extension = extname(originalName).toLowerCase();

    if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Imagem excede o tamanho maximo de 5MB');
    }

    if (
      !normalizedContentType ||
      !ALLOWED_IMAGE_TYPES.includes(normalizedContentType) ||
      !ALLOWED_IMAGE_EXTENSIONS.includes(extension)
    ) {
      throw new BadRequestException(
        `Formato de imagem invalido. Use: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      );
    }
  }

  private extensionFromContentType(contentType: string): string {
    const extensionsByType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };

    return extensionsByType[contentType.toLowerCase()] ?? '';
  }

  private getPublicUrl(objectPath: string): string {
    const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');

    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl}/${encodedPath}`;
    }

    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${encodedPath}`;
  }

  private extractObjectPathFromPublicUrl(fileUrl?: string | null): string | null {
    if (!fileUrl) return null;

    const marker = `/storage/v1/object/public/${this.bucket}/`;
    const markerIndex = fileUrl.indexOf(marker);

    if (markerIndex >= 0) {
      return decodeURIComponent(fileUrl.slice(markerIndex + marker.length));
    }

    if (this.publicBaseUrl && fileUrl.startsWith(`${this.publicBaseUrl}/`)) {
      return decodeURIComponent(fileUrl.slice(this.publicBaseUrl.length + 1));
    }

    return null;
  }
}
