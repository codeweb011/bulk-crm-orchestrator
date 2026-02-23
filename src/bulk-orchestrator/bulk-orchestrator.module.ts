import { Module } from '@nestjs/common';
import { MessagingModule } from '../messaging/messaging.module';
import { BulkActionCreatedListener } from './listeners/bulk-action-created.listener';
import { BulkOrchestratorService } from './bulk-orchestrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import { BulkBatch } from './entities/bulk-action-batch.entity';
import { Contact } from './entities/contact.entity';
import { EntityStrategyModule } from './entity-strategy/entity-strategy.module';

@Module({
    imports: [TypeOrmModule.forFeature([BulkAction, BulkBatch, Contact]), MessagingModule, EntityStrategyModule],
    providers: [
        BulkActionCreatedListener,
        BulkOrchestratorService,
    ],
})
export class BulkOrchestratorModule { }