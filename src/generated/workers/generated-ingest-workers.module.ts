import { Module } from '@nestjs/common';
import { FileIngestToolsModule } from '@available-tools/file-ingest-tools/file-ingest-tools.module';
import { GeneratedFileIngestBackgroundWorkersModule } from './generated-file-ingest-background-workers.module';
import { EntityIngestToolsModule } from '@available-tools/entity-ingest-tools/entity-ingest-tools.module';
import { GeneratedEntityIngestBackgroundWorkersModule } from './generated-entity-ingest-background-workers.module';

@Module({
    imports: [
        FileIngestToolsModule,
        GeneratedFileIngestBackgroundWorkersModule,
        EntityIngestToolsModule,
        GeneratedEntityIngestBackgroundWorkersModule,
    ],
})
export class GeneratedIngestWorkersModule {}
