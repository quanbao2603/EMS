import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Cho phép Frontend Next.js (port 3000) gọi API
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
