import { Module } from '@nestjs/common';
import { RabbitMqConfigModule } from './rabbitmq/rabbitmq.module';
import { RabbitMqPublisher } from './rabbitmq/rabbitmq.publisher';
import { EVENT_PUBLISHER } from './messaging.constants';

@Module({
    imports: [RabbitMqConfigModule],
    providers: [
        {
            provide: EVENT_PUBLISHER,
            useClass: RabbitMqPublisher,
        },
    ],
    exports: [EVENT_PUBLISHER],
})
export class MessagingModule { }