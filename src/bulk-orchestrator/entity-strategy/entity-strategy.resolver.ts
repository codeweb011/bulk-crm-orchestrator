import { Injectable } from '@nestjs/common';
import { BulkEntityStrategy } from './bulk-entity-strategy.interface';

@Injectable()
export class EntityStrategyResolver {
    constructor(
        private readonly strategies: BulkEntityStrategy[],
    ) { }

    resolve(entity: string): BulkEntityStrategy {
        const strategy = this.strategies.find(
            (s) => s.entityName === entity,
        );

        if (!strategy) {
            throw new Error(`Unsupported entity type: ${entity}`);
        }

        return strategy;
    }
}