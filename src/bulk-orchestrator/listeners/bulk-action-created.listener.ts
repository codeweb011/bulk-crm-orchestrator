import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { BulkOrchestratorService } from '../bulk-orchestrator.service';

@Injectable()
export class BulkActionCreatedListener {
    constructor(
        private readonly orchestratorService: BulkOrchestratorService,
    ) { }

    @RabbitSubscribe({
        exchange: 'bulk.exchange',
        routingKey: 'bulk.action.created',
        queue: 'orchestrator.bulk.action.created',
    })
    async handleBulkActionCreated(payload: any) {
        console.log('Received bulk action created:', payload);

        await this.orchestratorService.planBatches(
            payload.bulkActionId,
        );
    }
}