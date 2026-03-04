import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class JwtSecretGeneratedService {
  generateJwtSecret() {
    return randomBytes(32).toString('hex');
  }
}
