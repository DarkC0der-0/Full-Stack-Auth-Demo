import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto, SigninDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, name, password } = signupDto;

    const saltRoundsEnv = this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10');
    const saltRounds = Number(saltRoundsEnv);
    if (Number.isNaN(saltRounds) || saltRounds < 4) {
      this.logger.warn(
        `Invalid BCRYPT_SALT_ROUNDS value (${saltRoundsEnv}). Falling back to 10.`,
      );
      throw new Error('Invalid BCRYPT_SALT_ROUNDS configuration value');
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await this.usersService.create(email, name, passwordHash);

    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User signed up successfully: ${email}`);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }

  async signin(signinDto: SigninDto): Promise<AuthResponseDto> {
    const { email, password } = signinDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Sign in attempt with non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Sign in attempt with invalid password: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user._id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User signed in successfully: ${email}`);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }
}
