import 'fastify';
import type { JwtPayload } from '@nestjs/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}
