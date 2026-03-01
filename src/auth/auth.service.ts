import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
    const { username, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ 
      where: { username } 
    });
    
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      password_hash: hashedPassword,
      role: 'user',
    });

    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    console.log('=================================');
    console.log('🔐 BACKEND: TENTATIVE DE CONNEXION');
    console.log('=================================');
    console.log('📧 Username reçu:', username);
    console.log('🔑 Password reçu:', password);
    console.log('---------------------------------');

    try {
      // Chercher l'utilisateur
      const user = await this.userRepository.findOne({ 
        where: { username } 
      });

      if (!user) {
        console.log('❌ Utilisateur non trouvé dans la base de données');
        console.log('---------------------------------');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ Utilisateur trouvé:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Hash stocké: ${user.password_hash}`);
      console.log(`   Longueur du hash: ${user.password_hash.length}`);
      console.log('---------------------------------');

      // Vérifier le mot de passe
      console.log('🔍 Comparaison du mot de passe...');
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('❌ MOT DE PASSE INVALIDE');
        
        // Test avec différentes variations pour debug
        console.log('Tests supplémentaires:');
        
        // Test avec trim()
        const trimmedPassword = password.trim();
        const testTrim = await bcrypt.compare(trimmedPassword, user.password_hash);
        console.log(`   Avec trim(): ${testTrim ? 'OK' : 'NON'}`);
        
        // Test avec un hash fraîchement généré du même mot de passe
        const testHash = await bcrypt.hash(password, 10);
        const testCompare = await bcrypt.compare(password, testHash);
        console.log(`   Avec nouveau hash: ${testCompare ? 'OK' : 'NON'}`);
        
        console.log('---------------------------------');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ MOT DE PASSE VALIDE');
      console.log('---------------------------------');

      // Générer le JWT
      const payload = { 
        sub: user.id, 
        username: user.username, 
        role: user.role 
      };

      const token = this.jwtService.sign(payload);
      console.log('✅ Token JWT généré avec succès');
      console.log('=================================');

      return {
        access_token: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };

    } catch (error) {
      console.log('❌ ERREUR DANS LE SERVICE:', error.message);
      console.log('=================================');
      throw error;
    }
  }
}