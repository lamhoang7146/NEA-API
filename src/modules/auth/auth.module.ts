import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ConfigCustomModule } from '@/configs/config.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '@/modules/user/user.module';
import { EmailProducer } from './producers';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigCustomModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
    }),
    UserModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, EmailProducer],
})
export class AuthModule {}
