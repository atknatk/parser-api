import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: '10mb' });

    // Swagger yapılandırması
    const config = new DocumentBuilder()
    .setTitle('Extract HTML API')
    .setDescription('HTML içeriğini verilen seçiciye göre ayıran API')
    .setVersion('1.0')
  
    .addTag('HTML')
    .build();

    const document = SwaggerModule.createDocument(app, config,);
    SwaggerModule.setup('api', app, document, {
      jsonDocumentUrl: 'swagger/json',
      yamlDocumentUrl: 'swagger/yaml',
    });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
