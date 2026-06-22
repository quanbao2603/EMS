import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtSecret } from './auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
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
