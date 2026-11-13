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
} from '@vyapti/access-policy';

export const ExampleIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export class ExampleIdParamsDto extends createZodDto(ExampleIdParamsSchema) {}

@Injectable()
export class DeleteExampleService {
    constructor(private readonly accessPolicy: AccessPolicyFilterService) {}
    async remove(
        id: number,
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
        await Example.updateByPk(id, {
            deleted_at: Date.now(),
        });
        return { deleted: true };
    }
}

@Controller({
    path: VULCAN_API_CONFIG.path,
    version: VULCAN_API_CONFIG.version,
})
export class DeleteExampleController {
    constructor(private readonly service: DeleteExampleService) {}

    @RequirePermission('example', 'delete')
    @buildEndpoint({
        method: API_METHOD_TYPES.DELETE,
        path: '/example/:id',
        tags: ['example'],
        responses: {
            [HTTP_STATUS_CODES.OK]: 'example deleted',
            [HTTP_STATUS_CODES.NOT_FOUND]: 'example not found',
            [HTTP_STATUS_CODES.UNAUTHORIZED]: AUTH_MESSAGES.UNAUTHORIZED,
        },
        decorators: AUTH_BEARER_DECORATORS,
    })
    async deleteExample(
        @Param() params: ExampleIdParamsDto,
        @Req() request: { user?: { id: string; isSystemAdmin?: boolean } },
    ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
        const accessUser = requireRequestUser(request);
        const access = {
            userId: accessUser.id,
            isSystemAdmin: accessUser.isSystemAdmin === true,
        };
        const data = await this.service.remove(params.id, access);
        return apiSuccess(data, {
            message: 'example deleted',
        });
    }
}
