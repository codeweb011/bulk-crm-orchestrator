import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagingModule } from './messaging/messaging.module';
import { BulkOrchestratorModule } from './bulk-orchestrator/bulk-orchestrator.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin123',
      database: 'bulk-action-db',
      autoLoadEntities: true,
      synchronize: true, // dev only
    }),
    MessagingModule,
    BulkOrchestratorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
