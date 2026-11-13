import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { Job } from 'bullmq';
import { bulk_insert_entity_records } from '@vyapti/core';
import { multiply } from '@vyapti/function-registry';
import {
    bindUpdateProcessStatus,
    entityRecordsToDictList,
    getAllEntityRecords,
    PROCESS_STATUS,
    runWithEntityIngestProcessStatus,
} from '@vyapti/core/entity-ingest-tool-utils';

type MyToolJobData = {
    process_id: number;
    source_entity_name: string;
    limit: number | undefined;
};

const MY_TOOL__QUEUE = 'data_ingestion_my_tool_';
const MY_TOOL__JOB = 'entity_ingest_protocol_my_tool__data';

@Processor(MY_TOOL__QUEUE)
export class MyToolWorker extends WorkerHost {
    constructor(
        @Inject(DataSource)
        private readonly dataSource: DataSource,
    ) {
        super();
    }

    async process(job: Job<MyToolJobData>): Promise<void> {
        if (job.name !== MY_TOOL__JOB) {
            return;
        }

        const updateProcessStatusForJob = bindUpdateProcessStatus({
            dataSource: this.dataSource,
        });

        await runWithEntityIngestProcessStatus({
            job: job,
            task: this.runMyTool.bind(this),
            updateProcessStatus: updateProcessStatusForJob,
            runningStatus: PROCESS_STATUS.RUNNING,
            successStatus: PROCESS_STATUS.SUCCESS,
            failedStatus: PROCESS_STATUS.FAILED,
        });
    }

    private async runMyTool(
        job: Job<MyToolJobData>,
    ): Promise<Record<string, unknown>> {
        const { source_entity_name: sourceEntityName, limit } = job.data;

        const sourceEntityRecords = await getAllEntityRecords({
            entityName: 'example',
            dataSource: this.dataSource,
            limit: limit,
        });
        let records = entityRecordsToDictList({ records: sourceEntityRecords });

        // generated tool_details chain
        let step1_result = multiply({ a: 2, b: 3 });

        await bulk_insert_entity_records({
            dataSource: this.dataSource,
            entityName: 'example1',
            data: step1_result,
        });

        return {
            source_entity_name: sourceEntityName,
            source_record_count: sourceEntityRecords.length,
            ingested_record_count: Array.isArray(step1_result)
                ? step1_result.length
                : 1,
        };
    }
}

export { MY_TOOL__QUEUE, MY_TOOL__JOB };
