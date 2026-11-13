import { buildEntitySchema } from '@vyapti/core';
import { Example } from './example.entity';
import { Example1 } from './example1.entity';
import { Example17 } from './example17.entity';
import { Example2 } from './example2.entity';

export const entitySchemas = [
    buildEntitySchema(Example),
    buildEntitySchema(Example1),
    buildEntitySchema(Example17),
    buildEntitySchema(Example2),
];
