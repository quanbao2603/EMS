import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as oracledb from 'oracledb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      await oracledb.createPool({
        user: this.configService.get<string>('DB_USER'),
        password: this.configService.get<string>('DB_PASSWORD'),
        connectString: this.configService.get<string>('DB_CONNECTION_STRING'),
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2,
      });
      this.logger.log('Oracle Database Connection Pool initialized.');
    } catch (err) {
      this.logger.error('Failed to initialize Oracle Database Connection Pool', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    try {
      await oracledb.getPool().close(10);
      this.logger.log('Oracle Database Connection Pool closed.');
    } catch (err) {
      this.logger.error('Error closing Oracle Database Connection Pool', err);
    }
  }

  /**
   * Retrieves a connection from the pool.
   * REMEMBER to close it with connection.close() when done!
   */
  async getConnection(): Promise<oracledb.Connection> {
    return await oracledb.getConnection();
  }
}
