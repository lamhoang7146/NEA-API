import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtSubType } from '@/modules/auth/types';
import { AuthService } from '@/modules/auth/auth.service';
import { RequestWithCookies } from '@/common/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies): string | null => {
          if (!req || !req.cookies || !req.cookies.ACCESS_TOKEN) {
            return null;
          }
          return req.cookies.ACCESS_TOKEN;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET', 'fallback-secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtSubType) {
    const user = await this.authService.validateJwtUser(payload.sub);
    if (!user) throw new UnauthorizedException('Invalid token');
    return user;
  }
}
