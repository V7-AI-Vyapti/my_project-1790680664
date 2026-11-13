import { Body, Controller, Injectable, Req } from '@nestjs/common';
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
    prepareCreateBody,
} from '@vyapti/access-policy';

export const CreateExample2RequestSchema = z.object({
    name: z.string(),
    title: z.string(),
    user_id: z.number().int(),
    age: z.number().int(),
});

export class CreateExample2RequestDto extends createZodDto(
    CreateExample2RequestSchema,
) {}

@Injectable()
export class CreateExample2Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async create(
        body: CreateExample2RequestDto,
        access: { userId: string; isSystemAdmin: boolean },
    ) {
        const accessFilter = await this.accessPolicy.resolveFilter({
            userId: access.userId,
            entityName: 'example2',
            isSystemAdmin: access.isSystemAdmin,
        });
        const parsed = CreateExample2RequestSchema.parse(body);
        const scoped = prepareCreateBody({
            filter: accessFilter,
            body: parsed,
        });
        return await Example2.createOne(scoped);
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class CreateExample2Controller {
    constructor(private readonly service: CreateExample2Service) {}

    @RequirePermission('example2', 'create')
    @buildEndpoint({
        method: API_METHOD_TYPES.POST,
        path: '/example2',
        tags: ['example2'],
        responses: {
            [HTTP_STATUS_CODES.CREATED]: 'example2 created',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async createExample2(
        @Body() body: CreateExample2RequestDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.create(body, access);
        return apiSuccess(data, {
            message: 'example2 created',
        });
    }
}
