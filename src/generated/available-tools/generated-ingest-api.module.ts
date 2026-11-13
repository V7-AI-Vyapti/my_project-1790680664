import { Module } from '@nestjs/common';
import { FileIngestToolsModule } from '@available-tools/file-ingest-tools/file-ingest-tools.module';
import { EntityIngestToolsModule } from '@available-tools/entity-ingest-tools/entity-ingest-tools.module';

@Module({
    imports: [FileIngestToolsModule, EntityIngestToolsModule],
})
export class GeneratedIngestApiModule {}
