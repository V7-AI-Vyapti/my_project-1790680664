import { Module } from '@nestjs/common';
import { EntityIngestToolsModule } from '@available-tools/entity-ingest-tools/entity-ingest-tools.module';
import { WorkerQueueInfrastructureModule } from '../../workers/worker-queue-infrastructure.module';

/**
 * Entity-ingest BullMQ processors (codegen):
 * - MyToolWorker → available-tools/entity-ingest-tools/entity-ingest-worker/my-tool--2.worker.ts
 */

@Module({
    imports: [WorkerQueueInfrastructureModule, EntityIngestToolsModule],
    providers: [],
    exports: [EntityIngestToolsModule],
})
export class GeneratedEntityIngestBackgroundWorkersModule {}
