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
import { Example1 } from '@entities/example1.entity';
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

export const UpdateExample1RequestSchema = z
    .object({
        name: z.string(),
        title: z.string(),
        age: z.number().int(),
    })
    .partial();

export class UpdateExample1RequestDto extends createZodDto(
    UpdateExample1RequestSchema,
) {}

export const Example1IdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class Example1IdParamsDto extends createZodDto(Example1IdParamsSchema) {}

@Injectable()
export class UpdateExample1Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async update(
        id: number,
        body: UpdateExample1RequestDto,
        access: { userId: string; isSystemAdmin: boolean },
    ) {
        const record = await Example1.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('example1 not found');
        }
        await this.accessPolicy.assertRow({
            userId: access.userId,
            entityName: 'example1',
            isSystemAdmin: access.isSystemAdmin,
            row: record,
        });
        const accessFilter = await this.accessPolicy.resolveFilter({
            userId: access.userId,
            entityName: 'example1',
            isSystemAdmin: access.isSystemAdmin,
        });
        const parsed = UpdateExample1RequestSchema.parse(body);
        assertUpdateScope({
            filter: accessFilter,
            body: parsed,
        });
        await Example1.updateByPk(id, parsed);
        return await Example1.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateExample1Controller {
    constructor(private readonly service: UpdateExample1Service) {}

    @RequirePermission('example1', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/example1/:id',
        tags: ['example1'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example1 updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example1 not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateExample1(
        @Param() params: Example1IdParamsDto,
        @Body() body: UpdateExample1RequestDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.update(params.id, body, access);
        return apiSuccess(data, {
            message: 'example1 updated',
        });
    }
}
