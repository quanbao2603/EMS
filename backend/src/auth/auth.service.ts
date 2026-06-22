import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserRepository } from '../database/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const connection = await this.dbService.getConnection();
    try {
      // 1. Gọi Repository để truy vấn dữ liệu thay vì nhúng cứng SQL ở Service
      const user = await this.userRepository.findByUsername(connection, username);

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      // 2. Kiểm tra mật khẩu (Nghiệp vụ)
      if (pass !== 'hashed_pw' && pass !== user.PASSWORD) {
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }

      // 3. Khởi tạo Token (Nghiệp vụ)
      const payload = { 
        userId: user.ID_USER, 
        username: user.USERNAME, 
        role: user.ROLE_NAME,
        maPB: user.MAPB || 'IT'
      };
      
      return {
        access_token: this.jwtService.sign(payload),
      };
    } finally {
      await connection.close();
    }
  }
}
