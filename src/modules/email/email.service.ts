import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  send(to: string, subject: string, body: string) {
    return { success: true, to, subject };
  }
}
