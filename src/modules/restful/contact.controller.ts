'use strict';

import { Controller, Post, HttpStatus, Req, Res, Put, Get, Param, Body, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageCodeError } from '../../util/error';
import { JWTHelper } from '../../util/jwt';
import { NonceRes, SignupReq, AuthReq, SessionToken } from '../../util/swagger';
import { Config } from '../../util/config';
import { ValidationPipe } from '../../util/validator';
import { User, Contact } from '../../models/';
import { AuthService } from '../auth/auth.service';
import { ContactFacade, UserFacade } from '../facade';
import { ApiImplicitBody, ApiResponse, ApiOperation, ApiUseTags, ApiImplicitParam } from '@nestjs/swagger';
import * as fs from 'fs';

@ApiUseTags("contacts")
@Controller("contacts")
export class ContactController {
    constructor(private authService: AuthService,
        private contactFacade: ContactFacade,
        private userFacade: UserFacade
    ) { }


    @ApiResponse({ status: 200, description: "saved!", type: User })
    @ApiOperation({ description: "follow user", operationId: "followContact", title: "Follow contact" })
    @Post('follow/:uuid')
    public async login( @Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
        const body = req.body;
        const user = await this.contactFacade.followContact(req.user, uuid);
        res.status(HttpStatus.ACCEPTED).json(user);
    }

    @Get()
    @ApiOperation({ description: "Get all apps from account", operationId: "allDevs", title: "All Devs Account" })
    @ApiResponse({ status: 200, description: "numbers OK", type: Contact, isArray: true })
    public async allContacts( @Req() req,
        @Res() res: Response,
        @Query("offset") offset: number,
        @Query("limit") limit: number,
        @Query("filter") filter: string,
        @Query("orderBy") orderBy: string,
        @Query("orderType") orderType: string
        ) {
        if (!limit || limit < 1) {
            limit = 10;
        }
        if (!offset || offset < 0) {
            offset = 0;
        }
        res.status(HttpStatus.ACCEPTED).json((await this.contactFacade.findByFilters(req.user.userId, req.user.appUuid, offset, limit, filter, orderBy, orderType, false)));
    }
    @Get("current")
    @ApiOperation({ description: "Get all apps from account", operationId: "allDevs", title: "All Devs Account" })
    @ApiResponse({ status: 200, description: "numbers OK", type: Contact, isArray: true })
    public async myContacts( @Req() req,
        @Res() res: Response,
        @Query("offset") offset: number,
        @Query("limit") limit: number,
        @Query("filter") filter: string,
        @Query("orderBy") orderBy: string,
        @Query("orderType") orderType: string
        ) {
        if (!limit || limit < 1) {
            limit = 10;
        }
        if (!offset || offset < 0) {
            offset = 0;
        }
        res.status(HttpStatus.ACCEPTED).json((await this.contactFacade.findByFilters(req.user.userId, req.user.appUuid, offset, limit, filter, orderBy, orderType, true)));
    }
    @Get(":uuid")
    @ApiOperation({ description: "Get contact by uuid", operationId: "contactByUuid", title: "Contact ByUUID" })
    @ApiResponse({ status: 200, description: "numbers OK", type: Contact, isArray: true })
    public async byUuid( @Req() req,
        @Res() res: Response,
        @Param("uuid") uuid: string
        ) {
        res.status(HttpStatus.ACCEPTED).json((await this.userFacade.findByUuid(uuid)));
    }


}   
