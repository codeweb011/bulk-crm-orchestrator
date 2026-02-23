import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BulkAction } from './entities/bulk-action.entity';
import { BulkBatch, BulkBatchStatus } from './entities/bulk-action-batch.entity';
import { EVENT_PUBLISHER } from 'src/messaging/messaging.constants';
import * as messagingInterface from 'src/messaging/messaging.interface';
import { ActionStatus } from './enums/action-status.enum';
import { EntityStrategyResolver } from './entity-strategy/entity-strategy.resolver';


const BATCH_SIZE = 10000;

@Injectable()
export class BulkOrchestratorService {
    constructor(
        private readonly dataSource: DataSource,

        private readonly strategyResolver: EntityStrategyResolver,

        @InjectRepository(BulkAction)
        private readonly bulkActionRepo: Repository<BulkAction>,

        @InjectRepository(BulkBatch)
        private readonly bulkBatchRepo: Repository<BulkBatch>,

        @Inject(EVENT_PUBLISHER)
        private readonly publisher: messagingInterface.EventPublisher,
    ) { }

    async planBatches(bulkActionId: string) {
        console.log('Planning batches for:', bulkActionId);

        await this.dataSource.transaction(async (manager) => {

            const updateResult = await manager.update(
                BulkAction,
                { id: bulkActionId, status: ActionStatus.QUEUED },
                { status: ActionStatus.BATCHING },
            );

            if (updateResult.affected === 0) {
                return;
            }

            const bulkAction = await manager.findOne(BulkAction, {
                where: { id: bulkActionId },
            });

            if (!bulkAction) throw new Error('Bulk action not found');

            const strategy = this.strategyResolver.resolve(bulkAction.entity);

            const totalRecords = await strategy.count(
                bulkAction.filters,
                manager,
            );

            if (totalRecords === 0) {
                bulkAction.status = ActionStatus.COMPLETED;
                await manager.save(bulkAction);
                return;
            }

            bulkAction.totalRecords = totalRecords;
            await manager.save(bulkAction);

            /**
             * 🚀 STREAM IDS
             */
            const queryBuilder = strategy.streamIds(
                bulkAction.filters,
                manager,
            );

            const stream = await queryBuilder.stream();

            let batchNumber = 1;
            let chunk: string[] = [];
            const batches: BulkBatch[] = [];

            for await (const row of stream) {
                chunk.push(row.id);

                if (chunk.length === BATCH_SIZE) {
                    batches.push(manager.create(BulkBatch, {
                        bulkActionId,
                        batchNumber: batchNumber++,
                        ids: chunk,
                        status: BulkBatchStatus.PENDING,
                    }));
                    chunk = [];
                }
            }

            if (chunk.length) {
                batches.push(manager.create(BulkBatch, {
                    bulkActionId,
                    batchNumber: batchNumber++,
                    ids: chunk,
                    status: BulkBatchStatus.PENDING,
                }));
            }

            await manager.insert(BulkBatch, batches);

            bulkAction.totalBatches = batches.length;
            bulkAction.status = ActionStatus.QUEUED;
            await manager.save(bulkAction);

            console.log(`Created ${batches.length} batches`);
        });
    }

    // async planBatches(bulkActionId: string) {
    //     console.log('Planning batches for:', bulkActionId);

    //     let batches: BulkBatch[] = [];

    //     await this.dataSource.transaction(async (manager) => {
    //         /**
    //          * 1️⃣ Lock job (idempotent)
    //          */
    //         const updateResult = await manager.update(
    //             BulkAction,
    //             { id: bulkActionId, status: ActionStatus.QUEUED },
    //             { status: ActionStatus.BATCHING },
    //         );

    //         if (updateResult.affected === 0) {
    //             console.log('Bulk action already processed or invalid state');
    //             return;
    //         }

    //         /**
    //          * 2️⃣ Fetch bulk action
    //          */
    //         const bulkAction = await manager.findOne(BulkAction, {
    //             where: { id: bulkActionId },
    //         });

    //         if (!bulkAction) {
    //             throw new Error('Bulk action not found');
    //         }

    //         /**
    //          * 3️⃣ Count total records
    //          * Replace with dynamic entity resolution if needed
    //          */
    //         // const totalRecords = await this.countTargetRecords(
    //         //     bulkAction.entity,
    //         //     bulkAction.filters,
    //         //     manager,
    //         // );

    //         const strategy = this.strategyResolver.resolve(bulkAction.entity);

    //         const totalRecords = await strategy.count(
    //             bulkAction.filters,
    //             manager,
    //         );

    //         console.log('Total records:', totalRecords);

    //         if (totalRecords === 0) {
    //             bulkAction.status = ActionStatus.COMPLETED;
    //             await manager.save(bulkAction);
    //             return;
    //         }

    //         /**
    //          * 4️⃣ Create batch rows
    //          */
    //         const totalBatches = Math.ceil(totalRecords / BATCH_SIZE);

    //         bulkAction.totalRecords = totalRecords;
    //         bulkAction.totalBatches = totalBatches;
    //         await manager.save(bulkAction);

    //         for (let i = 0; i < totalBatches; i++) {
    //             const batch = manager.create(BulkBatch, {
    //                 bulkActionId,
    //                 batchNumber: i + 1,
    //                 offset: i * BATCH_SIZE,
    //                 limit: BATCH_SIZE,
    //                 status: BulkBatchStatus.PENDING,
    //             });

    //             batches.push(batch);
    //         }

    //         await manager.insert(BulkBatch, batches);

    //         /**
    //          * 5️⃣ Mark action IN_PROGRESS
    //          */
    //         bulkAction.status = ActionStatus.QUEUED;
    //         await manager.save(bulkAction);

    //         console.log(
    //             `Created ${totalBatches} batches for bulk action ${bulkActionId}`,
    //         );
    //     });

    //     // /**
    //     //  * 6️⃣ Publish batch events
    //     //  */
    //     // for (const batch of batches) {
    //     //     await this.publisher.publish('bulk.batch.created', {
    //     //         batchId: batch.id,
    //     //         bulkActionId: bulkActionId,
    //     //     });
    //     // }
    // }

    /**
     * Entity-agnostic counting
     * You can improve this using a strategy pattern later
     */
    private async countTargetRecords(
        entityType: string,
        filterQuery: any,
        manager,
    ): Promise<number> {
        if (entityType === 'CONTACTS') {
            return manager
                .getRepository('contacts')
                .count({ where: filterQuery });
        }

        throw new Error(`Unsupported entity type: ${entityType}`);
    }
}