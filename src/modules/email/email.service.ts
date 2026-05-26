import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  send(to: string, subject: string, _body: string) {
    return { success: true, to, subject };
  }
}
