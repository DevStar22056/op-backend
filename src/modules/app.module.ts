'use strict';

import { Module } from '@nestjs/common';
import { RestModule } from './restful';
import { AuthModule } from './auth';
import { DBFactoryModule } from './db';
import { FacadeModule } from './facade';
import { EmailModule } from './email';
import { WebsocketModule } from './websocket';

@Module({
    controllers: [],
    components: [],
    modules: [
        RestModule,
        AuthModule,
        DBFactoryModule,
        FacadeModule,
        EmailModule,
        WebsocketModule
    ],
    exports: []
})
export class ApplicationModule { }

