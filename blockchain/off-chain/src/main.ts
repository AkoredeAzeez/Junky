import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { GlobalExceptionFilter } from './filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Apply global filters
  app.useGlobalFilters(new GlobalExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw error on unexpected properties
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap().catch((error) => {
  Logger.error('Error during bootstrap:', error)
  process.exit(1) // Exit the process with a failure code
})
