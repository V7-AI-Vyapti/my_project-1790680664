import {
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
} from '@vyapti/access-policy';

export const Example2IdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class Example2IdParamsDto extends createZodDto(Example2IdParamsSchema) {}

@Injectable()
export class ViewExample2Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async getById(
        id: number,
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
        return record;
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class ViewExample2Controller {
    constructor(private readonly service: ViewExample2Service) {}

    @RequirePermission('example2', 'view')
    @buildEndpoint({
        method: API_METHOD_TYPES.GET,
        path: '/example2/:id',
        tags: ['example2'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example2 fetched',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example2 not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async getExample2(
        @Param() params: Example2IdParamsDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<unknown>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.getById(params.id, access);
        return apiSuccess(data, {
            message: 'example2 fetched',
        });
    }
}
