import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
  console.log('📝 Service - Données reçues:', registerDto);
  
  const { username, password, email } = registerDto;

  // Validation manuelle
  if (!username || username.length < 3) {
    throw new BadRequestException('Username must be at least 3 characters long');
  }

  if (!password || password.length < 6) {
    throw new BadRequestException('Password must be at least 6 characters long');
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await this.userRepository.findOne({ 
    where: { username } 
  });
  
  if (existingUser) {
    console.log('❌ Utilisateur déjà existant:', username);
    throw new ConflictException('Username already exists');
  }

  // Hachage du mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('🔑 Mot de passe hashé avec succès');

  // ✅ CORRECTION: Utiliser null pour email si non fourni
  const user = new User();
  user.username = username;
  user.password_hash = hashedPassword;
  user.email = email || null;  // Maintenant accepté car l'entité accepte string | null
  user.role = 'user';
  user.created_at = new Date();

  await this.userRepository.save(user);
  console.log('✅ Utilisateur créé avec ID:', user.id);

  const { password_hash, ...result } = user;
  return result;
}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    console.log('=================================');
    console.log('🔐 BACKEND - TENTATIVE DE CONNEXION');
    console.log('📧 Username reçu:', username);
    console.log('=================================');

    // Chercher l'utilisateur
    const user = await this.userRepository.findOne({ 
      where: { username } 
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé dans la base');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('✅ Utilisateur trouvé:', user.username);
    console.log('👤 Rôle:', user.role);

    // ✅ COMPARAISON AUTOMATIQUE du mot de passe fourni avec le hash stocké
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Mot de passe valide?', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Mot de passe invalide');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('✅ Mot de passe valide');

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role 
    };

    const token = this.jwtService.sign(payload);
    console.log('✅ Token généré');

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}