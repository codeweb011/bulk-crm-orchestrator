import { Module } from "@nestjs/common";
import { ContactBulkStrategy } from "./contact.strategy";
import { EntityStrategyResolver } from "./entity-strategy.resolver";

@Module({
    providers: [
        ContactBulkStrategy,
        {
            provide: 'ENTITY_STRATEGIES',
            useFactory: (contactStrategy: ContactBulkStrategy) => [
                contactStrategy,
            ],
            inject: [ContactBulkStrategy],
        },
        {
            provide: EntityStrategyResolver,
            useFactory: (strategies) =>
                new EntityStrategyResolver(strategies),
            inject: ['ENTITY_STRATEGIES'],
        },
    ],
    exports: [EntityStrategyResolver],
})
export class EntityStrategyModule { }