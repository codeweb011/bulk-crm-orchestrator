import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
    imports: [
        RabbitMQModule.forRoot({
            uri: 'amqp://admin:admin123@localhost:5672',
            exchanges: [
                {
                    name: 'bulk.exchange',
                    type: 'topic',
                },
            ],
            connectionInitOptions: { wait: false },
        }),
    ],
    exports: [RabbitMQModule],
})
export class RabbitMqConfigModule { }