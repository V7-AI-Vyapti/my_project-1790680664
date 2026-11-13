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
import { Example17 } from '@entities/example17.entity';
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

export const UpdateExample17RequestSchema = z
    .object({
        name_1: z.string(),
        title_2: z.string(),
        age_1: z.number().int(),
        user_id_1: z.number().int().positive(),
    })
    .partial();

export class UpdateExample17RequestDto extends createZodDto(
    UpdateExample17RequestSchema,
) {}

export const Example17IdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class Example17IdParamsDto extends createZodDto(
    Example17IdParamsSchema,
) {}

@Injectable()
export class UpdateExample17Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async update(
        id: number,
        body: UpdateExample17RequestDto,
        access: { userId: string; isSystemAdmin: boolean },
    ) {
        const record = await Example17.getByPk(id);
        if (!record || record['deleted_at'] != null) {
            throw new NotFoundException('example17 not found');
        }
        await this.accessPolicy.assertRow({
            userId: access.userId,
            entityName: 'example17',
            isSystemAdmin: access.isSystemAdmin,
            row: record,
        });
        const accessFilter = await this.accessPolicy.resolveFilter({
            userId: access.userId,
            entityName: 'example17',
            isSystemAdmin: access.isSystemAdmin,
        });
        const parsed = UpdateExample17RequestSchema.parse(body);
        assertUpdateScope({
            filter: accessFilter,
            body: parsed,
        });
        await Example17.updateByPk(id, parsed);
        return await Example17.getByPk(id);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class UpdateExample17Controller {
    constructor(private readonly service: UpdateExample17Service) {}

    @RequirePermission('example17', 'update')
    @buildEndpoint({
        method: API_METHOD_TYPES.PATCH,
        path: '/example17/:id',
        tags: ['example17'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example17 updated',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example17 not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async updateExample17(
        @Param() params: Example17IdParamsDto,
        @Body() body: UpdateExample17RequestDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.update(params.id, body, access);
        return apiSuccess(data, {
            message: 'example17 updated',
        });
    }
}
