import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    console.log('📝 BACKEND - Tentative d\'inscription:', registerDto.username);
    try {
      const result = await this.authService.register(registerDto);
      console.log('✅ Inscription réussie pour:', registerDto.username);
      return result;
    } catch (error) {
      console.error('❌ Erreur inscription:', error.message);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 BACKEND - Tentative de connexion:', loginDto.username);
    try {
      const result = await this.authService.login(loginDto);
      console.log('✅ Connexion réussie pour:', loginDto.username);
      return result;
    } catch (error) {
      console.error('❌ Erreur connexion:', error.message);
      throw error;
    }
  }
}