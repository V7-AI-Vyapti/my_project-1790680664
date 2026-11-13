import { Body, Controller, Inject } from '@nestjs/common';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import {
    createProcessEntity,
    generateEntityIngestProcessName,
    PROCESS_STATUS,
} from '@vyapti/core/entity-ingest-tool-utils';
import {
    MY_TOOL__QUEUE,
    MY_TOOL__JOB,
} from '@available-tools/entity-ingest-tools/entity-ingest-worker/my-tool--2.worker';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TriggerMyToolRequestSchema = z.object({
    limit: z.coerce.number().int().min(1).optional(),
});

export class TriggerMyToolRequestDto extends createZodDto(
    TriggerMyToolRequestSchema,
) {}

type TriggerMyToolResponseDto = {
    source_entity_name: 'example';
    process_id: number;
    job_id: string;
    status: 'INITIATED';
};

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class TriggerMyToolController {
    constructor(
        @InjectQueue(MY_TOOL__QUEUE)
        private readonly dataIngestionQueue: Queue,
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {}

    @RequirePermission('my_tool_', 'run')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/entities/transform/my-tool',
        tags: ['Entity Ingest'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'optional description__ initiated',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async triggerMyTool(
        @Body() body: TriggerMyToolRequestDto,
    ): Promise<ApiSuccessResponse<TriggerMyToolResponseDto>> {
        const limit = body.limit;
        const processName = generateEntityIngestProcessName({
            processNamePrefix: 'my_tool_',
            sourceEntityName: 'example',
        });
        const currentTimestamp = new Date().toISOString();
        const processMetadata = {
            source_entity_name: 'example',
            target_entity_name: 'example1',
            triggered_at: currentTimestamp,
            limit: limit ?? null,
        };
        const processId = await createProcessEntity({
            dataSource: this.dataSource,
            process_name: processName,
            process_status_name: PROCESS_STATUS.QUEUED,
            tool_type_name: 'entity_ingest_protocol',
            tool_name: 'my_tool_',
            process_metadata: processMetadata,
            description: 'optional description__',
        });
        const job = await this.dataIngestionQueue.add(MY_TOOL__JOB, {
            process_id: processId,
            source_entity_name: 'example',
            limit: limit,
        });
        return apiSuccess({
            source_entity_name: 'example',
            process_id: processId,
            job_id: String(job.id),
            status: 'INITIATED',
        });
    }
}
