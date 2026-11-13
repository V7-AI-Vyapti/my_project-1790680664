import {
    Body,
    Controller,
    Injectable,
    NotFoundException,
    Param,
    Req,
} from '@nestjs/common';
import { buildEndpoint } from '@vyapti/core/custom_api';
import {
    apiSuccess,
    type ApiSuccessResponse,
} from '@vyapti/core/custom_api_response';
import { Example } from '@entities/example.entity';
import { API_METHOD_TYPES, HTTP_STATUS_CODES } from '@vulcan/shared/constants';
import { VULCAN_API_CONFIG } from '@vulcan/vulcan.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AUTH_BEARER_DECORATORS, AUTH_MESSAGES } from '@vyapti/auth';
import { RequirePermission } from '@vyapti/rbac';
import {
    AccessPolicyFilterService,
    requireRequestUser,
    assertUpdateScope,
} from '@vyapti/access-policy';

export const UpdateExampleRequestSchema = z
    .object({
        title: z.string(),
        parent_id: z.number().int().positive(),
    })
    .partial();

export class UpdateExampleRequestDto extends createZodDto(
    UpdateExampleRequestSchema,
) {}

export const ExampleIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class ExampleIdParamsDto extends createZodDto(ExampleIdParamsSchema) {}

@Injectable()
export class UpdateExampleService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async update(
        id: number,
        body: UpdateExampleRequestDto,
        access: { userId: string; isSystemAdmin: boolean },
    ) {
        const record = await Example.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('example not found');
        }
        await this.accessPolicy.assertRow({
            userId: access.userId,
            entityName: 'example',
            isSystemAdmin: access.isSystemAdmin,
            row: record,
        });
        const accessFilter = await this.accessPolicy.resolveFilter({
            userId: access.userId,
            entityName: 'example',
            isSystemAdmin: access.isSystemAdmin,
        });
        const parsed = UpdateExampleRequestSchema.parse(body);
        assertUpdateScope({
            filter: accessFilter,
            body: parsed,
        });
        await Example.updateByPk(id, parsed);
        return await Example.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateExampleController {
    constructor(private readonly service: UpdateExampleService) {}

    @RequirePermission('example', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/example/:id',
        tags: ['example'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateExample(
        @Param() params: ExampleIdParamsDto,
        @Body() body: UpdateExampleRequestDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.update(params.id, body, access);
        return apiSuccess(data, {
            message: 'example updated',
        });
    }
}
