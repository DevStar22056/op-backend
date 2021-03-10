'use strict';

import { Controller, Post, HttpStatus, Req, Res, Put, Get, Param, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageCodeError } from '../../util/error';
import { JWTHelper } from '../../util/jwt';
import { NonceRes, SignupReq, AuthReq, SessionToken, ResetPasswordReq, HashReq } from '../../util/swagger';
import { Config } from '../../util/config';
import { ValidationPipe } from '../../util/validator';
import { User } from '../../models/';
import { AuthService } from '../auth/auth.service';
import { UserFacade } from '../facade';
import { ApiImplicitBody, ApiResponse, ApiOperation, ApiUseTags, ApiImplicitParam } from '@nestjs/swagger';
import * as rp from 'request-promise';
import { config } from 'aws-sdk';

@ApiUseTags("auth")
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService,
        private userFacade: UserFacade) { }


    async sessionToken(appuuid: string, userId, identityToken) {

        let nonceR = await rp({
            method: 'GET',
            strictSSL: false,
            uri: Config.string("API_OPENTACT", "https://demo-dev.opentact.org/v2") + "/auth/nonce/" + appuuid,
            json: true
        });

        let sessionToken = await rp({
            method: 'POST',
            strictSSL: false,
            uri: Config.string("API_OPENTACT", "https://demo-dev.opentact.org/v2") + "/auth/sessionToken/" + nonceR.nonce,
            body: {
                userId: userId,
                identityToken: identityToken
            },
            json: true
        });
        return sessionToken;
    }


    @Post("signup")
    @ApiOperation({ description: "Allows to register a user", operationId: "signup", title: "Singup User" })
    @ApiImplicitBody({ required: true, type: SignupReq, name: "signup" })
    @ApiResponse({ status: 200, description: "Singup OK", type: User })
    @ApiResponse({ status: 400, description: "Returns error in header x-message-code-error " })
    public async signup( @Req() req, @Res() res: Response) {
        const body = req.body;
        const user = new User();
        user.email = body.email;
        user.firstName = body.firstName;
        user.lastName = body.lastName;
        user.password = body.password;
        user.appUuid = body.appUuid;
        user.rePassword = body.rePassword;
        user.refferingId = body.refferingId;

        let userAgent = req.headers['user-agent'];

        let remoteAddress = req.headers["X-Forwarded-For"]
            || req.headers["x-forwarded-for"]
            || req.client.remoteAddress;


        const userSign = await this.authService.signUp(
            user, remoteAddress, userAgent
        );
        if (!userSign) throw new MessageCodeError('BadRequest');
        userSign.password = undefined;
        userSign.salt = undefined;
        user.password = undefined;
        user.rePassword = undefined;

        try {
            let sessionToken = await this.sessionToken(user.appUuid, user.uuid, user.token);

            let identity = await rp({
                method: 'POST',
                strictSSL: false,
                uri: Config.string("API_OPENTACT", "https://demo-dev.opentact.org/v2") + "/identities/app/" + user.appUuid,
                body: {
                    name: user.firstName + " " + user.lastName,
                    userName: user.email,
                    userId: user.uuid,
                },
                headers: {
                    'Authorization': 'Bearer ' + sessionToken.sessionToken
                },
                json: true
            });



        } catch (error) {
            console.error("ERRORR ", error);
        }

        res.status(HttpStatus.ACCEPTED).json(userSign);
    }

    @ApiImplicitBody({ required: true, type: ResetPasswordReq, name: "validateHash" })
    @ApiResponse({ status: 200, description: "Email Send" })
    @ApiResponse({ status: 400, description: "Missing Email" })
    @ApiResponse({ status: 500, description: "Email Error" })
    @ApiOperation({ description: "Reset Password.", operationId: "resetPassword", title: "Reset Password" })
    @Post('resetPassword')
    public async resetPassword( @Req() req, @Res() res: Response) {
        const body = req.body;
        if (!body || !body.email) throw new MessageCodeError('email:invalid');
        try {
            this.userFacade.resetPassword(req.body.email);
        } catch (error) {
        }
        res.status(HttpStatus.ACCEPTED).send();
    }

    @ApiImplicitBody({ required: true, type: AuthReq, name: "login" })
    @ApiResponse({ status: 400, description: "Returns in header x-message-code-error these values:  BadRequest, auth:login:missingInformation, auth:login:missingEmail, auth:login:missingPassword " })
    @ApiResponse({ status: 200, description: "Login OK", type: User })
    @ApiOperation({ description: "Login user", operationId: "login", title: "Login user" })
    @Post('login')
    public async login( @Req() req, @Res() res: Response) {

        const body = req.body;
        if (!body) throw new MessageCodeError('auth:login:missingInformation');
        if (!body.email) throw new MessageCodeError('auth:login:missingEmail');
        if (!body.password) throw new MessageCodeError('auth:login:missingPassword');
        let userAgent = req.headers['user-agent'];

        let remoteAddress = req.headers["X-Forwarded-For"]
            || req.headers["x-forwarded-for"]
            || req.client.remoteAddress;
        const user = await this.authService.signIn(body, remoteAddress, userAgent);
        res.status(HttpStatus.ACCEPTED).json(user);
    }

    @ApiImplicitBody({ required: true, type: HashReq, name: "validateHash" })
    @ApiResponse({ status: 400, description: "Missing info: hash. hash:invalid,hash:notFound,hash:expired " })
    @ApiResponse({ status: 200, description: "Hash OK" })
    @ApiOperation({ description: "Validates that the sent hash is correct and has not expired", operationId: "validateHash", title: "Validate Hash" })
    @Post('validateHash')
    public async validateHash( @Req() req: Request, @Res() res: Response) {
        const body = req.body;
        if (!body) throw new MessageCodeError('hash:invalid');
        if (!body.hash) throw new MessageCodeError('hash:invalid');
        const user = await this.userFacade.findUserByHash(body.hash);
        if (!user || !user.activationExpire) throw new MessageCodeError('hash:notFound');
        if (new Date() > user.activationExpire) throw new MessageCodeError('hash:expired');
        res.status(HttpStatus.ACCEPTED).send();
    }

    @ApiImplicitBody({ required: true, type: HashReq, name: "setPassword" })
    @ApiResponse({ status: 400, description: "Missing info: hash. hash:invalid,hash:notFound,hash:expired " })
    @ApiResponse({ status: 200, description: "set Password OK" })
    @ApiOperation({ description: "Set the password to a user from a hash.", operationId: "setPassword", title: "Set Password" })
    @Put('setPassword')
    public async setPassword( @Req() req, @Res() res: Response) {
        const body = req.body;
        if (!body) throw new MessageCodeError('hash:invalid');
        if (!body.hash) throw new MessageCodeError('hash:invalid');

        let userAgent = req.headers['user-agent'];

        let remoteAddress = req.headers["X-Forwarded-For"]
            || req.headers["x-forwarded-for"]
            || req.client.remoteAddress;

        const user = await this.userFacade.updatePasswordUser(body);
        user.token = await this.authService.generateToken(user, remoteAddress, userAgent, user.salt || '');
        user.activationExpire = undefined;
        user.activationHash = undefined;
        user.password = undefined;
        user.salt = undefined;
        res.status(HttpStatus.ACCEPTED).json(user);
    }


    @Get("current")
    @ApiOperation({ description: "Return current Dev token", operationId: "currentDev", title: "Current Dev" })
    @ApiResponse({ status: 200, description: "numbers OK", type: User, isArray: true })
    public async current( @Req() req, @Res() res: Response) {

        let us = await this.userFacade.findById(req.user.userId);
        if (!us) throw new MessageCodeError('request:unauthorized');
        us.token = req.user.token;
        res.status(HttpStatus.ACCEPTED).json(us);
    }


}   
