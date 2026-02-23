import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BulkAction } from './bulk-action.entity';

export enum BulkBatchStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity({ name: 'bulk_batches' })
@Index(['bulkActionId'])
@Index(['status'])
@Index(['bulkActionId', 'status'])
@Index(['bulkActionId', 'batchNumber'], { unique: true })
@Index(['status', 'createdAt'])
export class BulkBatch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Relation to BulkAction
     */
    @Column({ name: 'bulk_action_id' })
    bulkActionId: string;

    @ManyToOne(() => BulkAction, (bulkAction) => bulkAction.batches, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'bulk_action_id' })
    bulkAction: BulkAction;

    /**
     * Batch sequencing
     */
    @Column({ name: 'batch_number', type: 'int' })
    batchNumber: number;

    /**
     * Pagination control
     */
    // @Column({ type: 'int' })
    // offset: number;

    // @Column({ type: 'int' })
    // limit: number;

    /**
     * Execution state
     */
    @Column({
        type: 'enum',
        enum: BulkBatchStatus,
        default: BulkBatchStatus.PENDING,
    })
    status: BulkBatchStatus;

    /**
     * Retry handling
     */
    @Column({ name: 'retry_count', type: 'int', default: 0 })
    retryCount: number;

    @Column({ name: 'max_retries', type: 'int', default: 3 })
    maxRetries: number;

    /**
     * Execution metrics
     */
    @Column({ name: 'total_records', type: 'int', nullable: true })
    totalRecords: number;

    @Column({ name: 'processed_records', type: 'int', default: 0 })
    processedRecords: number;

    @Column({ name: 'failed_records', type: 'int', default: 0 })
    failedRecords: number;

    /**
     * Error logging
     */
    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    /**
     * Worker tracking (optional but useful)
     */
    @Column({ name: 'locked_by', nullable: true })
    lockedBy: string;

    @Column({ name: 'locked_at', type: 'timestamp', nullable: true })
    lockedAt: Date;

    /**
     * Audit timestamps
     */
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column('uuid', { array: true })
    ids: string[];
}