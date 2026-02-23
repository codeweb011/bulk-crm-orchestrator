import { EntityManager } from "typeorm";
import { SelectQueryBuilder } from "typeorm/browser";

export interface BulkEntityStrategy {
    entityName: string;

    count(filter: any, manager): Promise<number>;

    fetchBatch(
        filter: any,
        offset: number,
        limit: number,
        manager,
    ): Promise<any[]>;

    streamIds(filters: any, manager: EntityManager): SelectQueryBuilder<any>;
}