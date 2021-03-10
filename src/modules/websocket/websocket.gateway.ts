import { User, Contact } from "../../models";
import { Component } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WsResponse, OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { MessageCodeError } from '../../util/error';
import { Constants } from '../../util/constants';
import { Config } from '../../util/config';
import { PasswordHelper, StringHelper } from '../../util/helper';
import { genSaltSync, hashSync } from 'bcrypt';
import { v4 } from 'uuid';


@WebSocketGateway()
export class WebsocketGW implements OnGatewayInit, OnGatewayConnection {
    handleConnection(client: any) {
        // console.log("handleConnection ", client);
    }
    afterInit(server: any) {
        // console.log("AFERT INIT ", server.path);
    }

    constructor() { }

    @SubscribeMessage('events')
    onEvent(client, data): WsResponse<any> {
        // console.log("data ", data);
        const event = 'events';
        return { event, data: { "enviado": data } };
    }

}
