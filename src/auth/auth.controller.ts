import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('📨 BACKEND: REQUÊTE REÇUE SUR /auth/login');
    console.log('Body reçu:', loginDto);
    
    try {
      const result = await this.authService.login(loginDto);
      console.log('✅ Réponse envoyée');
      return result;
    } catch (error) {
      console.log('❌ Erreur capturée dans le controller:', error.message);
      throw error;
    }
  }
}