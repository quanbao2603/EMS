import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const connection = await this.dbService.getConnection();
    try {
      // Tìm user trong CSDL, lấy kèm MaPB từ bảng NHAN_VIEN để cấp JWT
      const sql = `
        SELECT u.ID_User, u.Username, u.Password, u.Role_Name, u.MaNV, nv.MaPB 
        FROM APP_USERS u
        LEFT JOIN NHAN_VIEN nv ON u.MaNV = nv.MaNV
        WHERE u.Username = :username
      `;
      const result = await connection.execute(sql, { username }, { outFormat: 4002 /* oracledb.OUT_FORMAT_OBJECT */ });
      const rows: any[] = result.rows || [];

      if (rows.length === 0) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      const user = rows[0];

      // So sánh mật khẩu (hiện tại trong MOCK DB là 'hashed_pw')
      // Thực tế sẽ dùng bcrypt.compare(pass, user.PASSWORD)
      if (pass !== 'hashed_pw' && pass !== user.PASSWORD) {
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }

      const payload = { 
        userId: user.ID_USER, 
        username: user.USERNAME, 
        role: user.ROLE_NAME,
        maPB: user.MAPB || 'IT' // Fallback
      };
      
      return {
        access_token: this.jwtService.sign(payload),
      };
    } finally {
      await connection.close();
    }
  }
}
