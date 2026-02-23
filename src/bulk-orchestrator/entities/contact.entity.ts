import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum ContactStatus {
    NEW = 'NEW',
    ACTIVE = 'ACTIVE',
    PROMOTED = 'PROMOTED',
    INACTIVE = 'INACTIVE',
}

@Entity({ name: 'contacts' })
@Index(['email'], { unique: true })
@Index(['status'])
@Index(['country'])
@Index(['createdAt'])
export class Contact {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name', nullable: true })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    country: string;

    @Column({
        type: 'enum',
        enum: ContactStatus,
        default: ContactStatus.NEW,
    })
    status: ContactStatus;

    @Column({ name: 'owner_id', nullable: true })
    ownerId: string;

    @Column({ name: 'is_deleted', default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}