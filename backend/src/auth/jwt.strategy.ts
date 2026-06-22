import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'EMS_SUPER_SECRET_KEY_2026',
    });
  }

  async validate(payload: any) {
    // Passport tự động gán object return dưới đây vào req.user
    return { 
      userId: payload.userId, 
      username: payload.username, 
      role: payload.role, 
      maPB: payload.maPB 
    };
  }
}
