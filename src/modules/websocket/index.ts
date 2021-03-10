import { Module } from '@nestjs/common';
import { WebsocketGW } from './websocket.gateway';
import { DBFactoryModule } from '../db';

@Module({
    components: [WebsocketGW],
    modules: [DBFactoryModule]
})
export class WebsocketModule { }

export { WebsocketGW } from './websocket.gateway';
