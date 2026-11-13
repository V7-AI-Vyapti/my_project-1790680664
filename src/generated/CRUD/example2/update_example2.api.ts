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
import { Example2 } from '@entities/example2.entity';
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

export const UpdateExample2RequestSchema = z
    .object({
        name: z.string(),
        title: z.string(),
        user_id: z.number().int(),
        age: z.number().int(),
    })
    .partial();

export class UpdateExample2RequestDto extends createZodDto(
    UpdateExample2RequestSchema,
) {}

export const Example2IdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class Example2IdParamsDto extends createZodDto(Example2IdParamsSchema) {}

@Injectable()
export class UpdateExample2Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async update(
        id: number,
        body: UpdateExample2RequestDto,
        access: { userId: string; isSystemAdmin: boolean },
    ) {
        const record = await Example2.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('example2 not found');
        }
        await this.accessPolicy.assertRow({
            userId: access.userId,
            entityName: 'example2',
            isSystemAdmin: access.isSystemAdmin,
            row: record,
        });
        const accessFilter = await this.accessPolicy.resolveFilter({
            userId: access.userId,
            entityName: 'example2',
            isSystemAdmin: access.isSystemAdmin,
        });
        const parsed = UpdateExample2RequestSchema.parse(body);
        assertUpdateScope({
            filter: accessFilter,
            body: parsed,
        });
        await Example2.updateByPk(id, parsed);
        return await Example2.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateExample2Controller {
    constructor(private readonly service: UpdateExample2Service) {}

    @RequirePermission('example2', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/example2/:id',
        tags: ['example2'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example2 updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example2 not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateExample2(
        @Param() params: Example2IdParamsDto,
        @Body() body: UpdateExample2RequestDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.update(params.id, body, access);
        return apiSuccess(data, {
            message: 'example2 updated',
        });
    }
}
