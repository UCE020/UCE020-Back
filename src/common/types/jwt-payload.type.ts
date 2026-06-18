export interface JwtPayload {
  sub:   number; // id do usuário
  email: string;
  iat?:  number; // emitido em (gerado automaticamente pelo jwt)
  exp?:  number; // expira em (gerado automaticamente pelo jwt)
}