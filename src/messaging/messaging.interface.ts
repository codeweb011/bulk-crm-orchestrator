export interface EventConsumer {
    subscribe(
        topic: string,
        handler: (message: any) => Promise<void>,
    ): Promise<void>;
}

export interface EventPublisher {
    publish(topic: string, message: any): Promise<void>;
}