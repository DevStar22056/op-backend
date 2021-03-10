'use strict';

import { Middleware, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { MessageCodeError } from '../util/error';
import { Config } from '../util/config';
import { JWTHelper } from '../util/jwt';

@Middleware()
export class AuthMiddleware implements NestMiddleware {
    resolve() {
        return async function (req, res: Response, next: NextFunction) {
            //ignore login auth/validateHash
            if (req.url.includes("auth/nonce")
                || req.url.includes("auth/sessionToken")
                || req.url.includes("auth/signup")
                || req.url.includes("auth/resetPassword")
                || req.url.includes("auth/validateHash")
                || req.url.includes("auth/setPassword")
                || req.url.includes("auth/login")
                || req.url.includes("events")
                || req.url.includes("intruder/register")
                || req.url.includes("intruder/image")
                || req.url.includes("api-docs.json")
                || req.url.includes("swagger")
                || req.url.includes("favicon.ico")
            ) {
                next();
                return
            }
            if (req.headers.authorization && (req.headers.authorization as string).split(' ')[0] === 'Bearer') {
                try {
                    let userAgent = req.headers['user-agent'];

                    let remoteAddress = req.headers["X-Forwarded-For"]
                        || req.headers["x-forwarded-for"]
                        || req.client.remoteAddress;

                    let token = (req.headers.authorization as string).split(' ')[1];
                    const user: any = await JWTHelper.verify(token);
                    if (!user || !user.userId) throw new MessageCodeError('request:unauthorized');
                    if (user.remoteAddress !== remoteAddress) {
                        throw new MessageCodeError('request:unauthorized');
                    }
                    if (user.userAgent !== userAgent) {
                        throw new MessageCodeError('request:unauthorized');
                    }
                    req.user = user;
                    req.user.token = token;
                    next();
                } catch (e) {
                    console.log("ERROR URL ", req.url, e);
                    throw new MessageCodeError('request:unauthorized');
                }

            } else {
                console.log("ERROR URL ", req.url);
                throw new MessageCodeError('request:unauthorized');
            }
        };
    }
}
