import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../types/jwt-payload.type";

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
    // request.user é populado pelo JwtStrategy após validar o token
  },
);