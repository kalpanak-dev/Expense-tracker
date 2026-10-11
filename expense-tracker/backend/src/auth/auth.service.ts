import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    if (await this.users.findOne({ where: { email: dto.email } })) throw new ConflictException('Email already registered');
    const user = await this.users.save(this.users.create({
      email: dto.email, name: dto.name, password: await bcrypt.hash(dto.password, 10),
    }));
    return this.response(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Invalid credentials');
    return this.response(user);
  }

  private async response(user: User) {
    return { token: await this.jwt.signAsync({ sub: user.id, email: user.email }), email: user.email, name: user.name };
  }
}
