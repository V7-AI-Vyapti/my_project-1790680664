import { Module } from '@nestjs/common';
import { GeneratedAccessPolicyModule } from '../../access-policy/access-policy.module';
import {
    CreateExample17Controller,
    CreateExample17Service,
} from '@generated-crud/example17/create_example17.api';
import {
    CreateExample1Controller,
    CreateExample1Service,
} from '@generated-crud/example1/create_example1.api';
import {
    CreateExample2Controller,
    CreateExample2Service,
} from '@generated-crud/example2/create_example2.api';
import {
    CreateExampleController,
    CreateExampleService,
} from '@generated-crud/example/create_example.api';
import {
    DeleteExample17Controller,
    DeleteExample17Service,
} from '@generated-crud/example17/delete_example17.api';
import {
    DeleteExample1Controller,
    DeleteExample1Service,
} from '@generated-crud/example1/delete_example1.api';
import {
    DeleteExample2Controller,
    DeleteExample2Service,
} from '@generated-crud/example2/delete_example2.api';
import {
    DeleteExampleController,
    DeleteExampleService,
} from '@generated-crud/example/delete_example.api';
import {
    ListExample17Controller,
    ListExample17Service,
} from '@generated-crud/example17/list_example17.api';
import {
    ListExample1Controller,
    ListExample1Service,
} from '@generated-crud/example1/list_example1.api';
import {
    ListExample2Controller,
    ListExample2Service,
} from '@generated-crud/example2/list_example2.api';
import {
    ListExampleController,
    ListExampleService,
} from '@generated-crud/example/list_example.api';
import {
    UpdateExample17Controller,
    UpdateExample17Service,
} from '@generated-crud/example17/update_example17.api';
import {
    UpdateExample1Controller,
    UpdateExample1Service,
} from '@generated-crud/example1/update_example1.api';
import {
    UpdateExample2Controller,
    UpdateExample2Service,
} from '@generated-crud/example2/update_example2.api';
import {
    UpdateExampleController,
    UpdateExampleService,
} from '@generated-crud/example/update_example.api';
import {
    ViewExample17Controller,
    ViewExample17Service,
} from '@generated-crud/example17/view_example17.api';
import {
    ViewExample1Controller,
    ViewExample1Service,
} from '@generated-crud/example1/view_example1.api';
import {
    ViewExample2Controller,
    ViewExample2Service,
} from '@generated-crud/example2/view_example2.api';
import {
    ViewExampleController,
    ViewExampleService,
} from '@generated-crud/example/view_example.api';

@Module({
    imports: [GeneratedAccessPolicyModule],
    controllers: [
        CreateExample17Controller,
        CreateExample1Controller,
        CreateExample2Controller,
        CreateExampleController,
        DeleteExample17Controller,
        DeleteExample1Controller,
        DeleteExample2Controller,
        DeleteExampleController,
        ListExample17Controller,
        ListExample1Controller,
        ListExample2Controller,
        ListExampleController,
        UpdateExample17Controller,
        UpdateExample1Controller,
        UpdateExample2Controller,
        UpdateExampleController,
        ViewExample17Controller,
        ViewExample1Controller,
        ViewExample2Controller,
        ViewExampleController,
    ],
    providers: [
        CreateExample17Service,
        CreateExample1Service,
        CreateExample2Service,
        CreateExampleService,
        DeleteExample17Service,
        DeleteExample1Service,
        DeleteExample2Service,
        DeleteExampleService,
        ListExample17Service,
        ListExample1Service,
        ListExample2Service,
        ListExampleService,
        UpdateExample17Service,
        UpdateExample1Service,
        UpdateExample2Service,
        UpdateExampleService,
        ViewExample17Service,
        ViewExample1Service,
        ViewExample2Service,
        ViewExampleService,
    ],
})
export class GeneratedCrudApiModule {}
