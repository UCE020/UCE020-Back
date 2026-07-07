import { funcaoConvidadoEnum } from 'src/db/schema';

export type GuestResult = {
  id: number;
  name: string;
  email: string;
  role: typeof funcaoConvidadoEnum.enumValues[number];
};