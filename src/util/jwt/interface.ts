'use strict';

export interface JwtOptions {
    algorithm: string;
    expiresIn: number | string;
    jwtid: string;
}

export interface JWTClaims {
    userId: number,
    companies?: number[],
    userFirstName: string,
    userLastName: string,
    userAgent: string,
    appUuid: string,
    nonce: string,
    remoteAddress: string,
    userEmail: string,
}