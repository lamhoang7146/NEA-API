import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { verify, hash } from 'argon2';

import { PostgreSQLService } from '@/databases';
import {
  CreateUserDto,
  ForgotPasswordDto,
  NewPasswordDto,
  SignInDto,
} from './dto/requests';
import { JwtSubType } from './types';
import { User } from '@/databases/postgresql/generated/prisma';
import { EmailProducer } from './producers';

@Injectable()
export class AuthService {
  constructor(
    private readonly postgresqlService: PostgreSQLService,
    private readonly jwtService: JwtService,
    private readonly emailProducer: EmailProducer,
    private readonly configService: ConfigService,
  ) {}

  async createUser(input: CreateUserDto): Promise<User> {
    const { password, ...user } = input;

    const isUserExist = await this.postgresqlService.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (isUserExist) {
      throw new BadRequestException('Email already exists!');
    }

    const newUser = await this.postgresqlService.user.create({
      data: {
        ...user,
        password: await hash(password),
      },
    });

    await this.emailProducer.sendAccountVerificationEmail(
      'account-verification',
      {
        email: newUser.email,
        accessToken: (await this.generateToken(newUser.id, '5m')).accessToken,
      },
    );

    return newUser;
  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.postgresqlService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException('User not found!');

    if (!user.isVerified)
      throw new UnauthorizedException('User is not verified!');

    const passwordMatch = await verify(user.password, password);

    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials!');

    return user;
  }

  async generateToken(userId: string, expiresIn?: string | number) {
    const expireTime =
      expiresIn || this.configService.get<string>('JWT_EXPIRES_IN', '24h');

    const accessToken = await this.jwtService.signAsync({ sub: userId }, {
      expiresIn: expireTime,
    } as unknown as JwtSignOptions);

    return {
      accessToken,
    };
  }

  async signIn(user: User) {
    const { accessToken } = await this.generateToken(user.id);

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      accessToken,
    };
  }

  async validateJwtUser(userId: string) {
    const user = await this.postgresqlService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new UnauthorizedException('User not found!');

    return {
      id: user.id,
      role: user.role,
    };
  }

  async getUserById(userId: string) {
    const user = await this.postgresqlService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return user;
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.postgresqlService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const { accessToken } = await this.generateToken(user.id, '5m');

    await this.emailProducer.sendForgotPasswordEmail('forgot-password', {
      email,
      accessToken,
    });

    return 'Check your email for reset password link';
  }

  async resetPassword({ password, confirmPassword, token }: NewPasswordDto) {
    if (password !== confirmPassword)
      throw new UnauthorizedException('Password does not match');

    const payload: JwtSubType = await this.jwtService.verifyAsync(token, {
      ignoreExpiration: false,
    });

    if (!payload) throw new UnauthorizedException('Invalid token');

    const user = await this.postgresqlService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    await this.postgresqlService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await hash(password),
      },
    });

    return 'Reset password successfully';
  }
}
