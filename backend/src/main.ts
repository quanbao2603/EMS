import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { OracleExceptionFilter } from './common/filters/oracle-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalFilters(new OracleExceptionFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
