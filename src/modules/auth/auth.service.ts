import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateAnonToken(): string {
    const payload = { type: 'anon', sub: randomUUID() };
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
  }
}
