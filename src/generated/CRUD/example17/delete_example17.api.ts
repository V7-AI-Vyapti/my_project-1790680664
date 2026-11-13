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
} from '@vyapti/access-policy';

export const Example17IdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class Example17IdParamsDto extends createZodDto(
    Example17IdParamsSchema,
) {}

@Injectable()
export class DeleteExample17Service {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async remove(
        id: number,
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
        await Example17.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteExample17Controller {
    constructor(private readonly service: DeleteExample17Service) {}

    @RequirePermission('example17', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/example17/:id',
        tags: ['example17'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example17 deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example17 not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteExample17(
        @Param() params: Example17IdParamsDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.remove(params.id, access);
        return apiSuccess(data, {
            message: 'example17 deleted',
        });
    }
}
