'use strict';

import { Component } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { MessageCodeError } from '../../util/error';
import { Config } from '../../util/config';
import { JWTHelper } from '../../util/jwt';
import { UserFacade } from '../facade';
import { User } from '../../models';
import { compare as comparePassword } from 'bcrypt';


@Component()
export class AuthService {

    constructor(private userFacade: UserFacade) {

    }
    public async signIn(credentials: { email: string, password: string }, remoteAddress: string, userAgent): Promise<User> {
        const user = await this.userFacade.findByEmail(credentials.email)

        if (!user) throw new MessageCodeError('user:notFound');
        const equals = await comparePassword(credentials.password, user.password ? user.password : '');
        if (!equals) throw new MessageCodeError('user:notFound');

        user.token = await this.generateToken(user, remoteAddress, userAgent, user.salt || '');
        user.password = undefined;
        user.salt = undefined;
        return user

    }

    public async generateToken(user: User, remoteAddress: string, userAgent, nonce: string) {
        let token = await JWTHelper.sign({
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userEmail: user.email,
            appUuid: user.appUuid,
            remoteAddress: remoteAddress,
            userAgent: userAgent,
            nonce: nonce,
            userId: user.id
        })
        if (!token) throw new MessageCodeError('user:tokenError');
        return token
    }

    public async signUp(user: User, remoteAddress: string, userAgent): Promise<User> {
        let usr = await this.userFacade.signupUser(user);
        usr.token = await this.generateToken(user, remoteAddress, userAgent, usr.salt || '');
        return usr

    }


}
