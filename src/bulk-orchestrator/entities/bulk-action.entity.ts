import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { BulkBatch } from './bulk-action-batch.entity';
import { ActionStatus } from '../enums/action-status.enum';
import { ActionType } from '../enums/action-type.enum';

@Entity('bulk_actions')
@Index(['status'])
export class BulkAction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    entity: string;

    @Column({
        type: 'enum',
        enum: ActionType,
    })
    actionType: ActionType;

    @Column({ type: 'jsonb' })
    filters: Record<string, any>;

    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    @Column({
        type: 'enum',
        enum: ActionStatus,
        default: ActionStatus.QUEUED,
    })
    status: ActionStatus;

    @Column({ type: 'int', default: 0 })
    totalRecords: number;

    @Column({ type: 'int', default: 0 })
    totalBatches: number;

    @Column({ type: 'int', default: 0 })
    processedRecords: number;

    @Column({ type: 'int', default: 0 })
    failedRecords: number;

    /**
     * Relation
     */
    @OneToMany(() => BulkBatch, (batch) => batch.bulkAction)
    batches: BulkBatch[];

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ name: 'total_duration_ms', type: 'bigint', nullable: true })
    totalDurationMs: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}