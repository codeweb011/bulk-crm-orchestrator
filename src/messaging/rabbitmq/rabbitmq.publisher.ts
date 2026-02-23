import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EventPublisher } from '../messaging.interface';

@Injectable()
export class RabbitMqPublisher implements EventPublisher {
    constructor(private readonly amqpConnection: AmqpConnection) { }

    async publish<T>(routingKey: string, message: T): Promise<void> {
        await this.amqpConnection.publish(
            'bulk.exchange',
            routingKey,
            message,
            { persistent: true },
        );
    }
}