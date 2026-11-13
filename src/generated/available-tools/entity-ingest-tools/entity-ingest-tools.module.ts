import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { entityIngestApiControllers } from '@available-tools/entity-ingest-tools/entity-ingest-api';
import {
    MyToolWorker,
    MY_TOOL__QUEUE,
} from '@available-tools/entity-ingest-tools/entity-ingest-worker/my-tool--2.worker';

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.QUEUE_REDIS_HOST ?? '127.0.0.1',
                port: Number.parseInt(
                    process.env.QUEUE_REDIS_PORT ?? '6379',
                    10,
                ),
                username: process.env.QUEUE_REDIS_USERNAME || undefined,
                password: process.env.QUEUE_REDIS_PASSWORD || undefined,
                db: Number.parseInt(process.env.QUEUE_REDIS_DB ?? '0', 10),
                maxRetriesPerRequest: null,
            },
        }),
        BullModule.registerQueue({ name: MY_TOOL__QUEUE }),
    ],
    controllers: [...entityIngestApiControllers],
    providers: [MyToolWorker],
    exports: [],
})
export class EntityIngestToolsModule {}
