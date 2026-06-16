import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    nome: string;
    email: string;
    isActive: boolean;
  };
}