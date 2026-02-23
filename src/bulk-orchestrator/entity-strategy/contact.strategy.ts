import { Injectable } from '@nestjs/common';
import { BulkEntityStrategy } from './bulk-entity-strategy.interface';
import { Contact } from '../entities/contact.entity';
import { EntityManager } from 'typeorm';


@Injectable()
export class ContactBulkStrategy implements BulkEntityStrategy {
    entityName = 'CONTACTS';

    async count(filter: any, manager): Promise<number> {
        return manager.getRepository(Contact).count({
            where: filter,
        });
    }

    async fetchBatch(filter: any, offset: number, limit: number, manager) {
        return manager.getRepository(Contact).find({
            where: filter,
            skip: offset,
            take: limit,
            order: { id: 'ASC' },
        });
    }

    streamIds(filters: any, manager: EntityManager) {
        return manager
            .getRepository(Contact)
            .createQueryBuilder('contact')
            .select('contact.id', 'id')
            .where(filters)
            .orderBy('contact.id', 'ASC');
    }
}