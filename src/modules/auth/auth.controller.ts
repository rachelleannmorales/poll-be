import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('anon')
  getAnonToken() {
    return {
      accessToken: this.authService.generateAnonToken(),
    };
  }
}
