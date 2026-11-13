import { Body, Controller, Injectable, Req } from '@nestjs/common';
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
    prepareCreateBody,
} from '@vyapti/access-policy';

export const CreateExample17RequestSchema = z.object({
    name_1: z.string(),
    title_2: z.string(),
    age_1: z.number().int(),
    user_id_1: z.number().int().positive(),
});

export class CreateExample17RequestDto extends createZodDto(
    CreateExample17RequestSchema,
) {}

@Injectable()
export class CreateExample17Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async create(
        body: CreateExample17RequestDto,
        access: { userId: string; isSystemAdmin: boolean },
    ) {
        const accessFilter = await this.accessPolicy.resolveFilter({
            userId: access.userId,
            entityName: 'example17',
            isSystemAdmin: access.isSystemAdmin,
        });
        const parsed = CreateExample17RequestSchema.parse(body);
        const scoped = prepareCreateBody({
            filter: accessFilter,
            body: parsed,
        });
        return await Example17.createOne(scoped);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateExample17Controller {
    constructor(private readonly service: CreateExample17Service) {}

    @RequirePermission('example17', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/example17',
        tags: ['example17'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'example17 created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createExample17(
        @Body() body: CreateExample17RequestDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.create(body, access);
        return apiSuccess(data, {
            message: 'example17 created',
        });
    }
}
