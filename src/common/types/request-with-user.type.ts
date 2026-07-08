import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    sub: number;
    name: string;
    email: string;
  };
}
