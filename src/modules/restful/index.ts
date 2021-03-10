'use strict';

import { Module, RequestMethod } from '@nestjs/common';
import { MiddlewaresConsumer } from '@nestjs/common/interfaces/middlewares';
import { AuthMiddleware } from '../../filters/auth.middleware';
import { AuthController } from './auth.controller';
import { ContactController } from './contact.controller';
import { AuthModule } from '../auth';
import { FacadeModule } from '../facade';

@Module({
    controllers: [AuthController, ContactController],
    components: [],
    modules: [AuthModule, FacadeModule],
    exports: []
})
export class RestModule {
    configure(consumer: MiddlewaresConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(
            { path: '/**', method: RequestMethod.ALL },
        );
    }
}
