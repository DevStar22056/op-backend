
import { Config } from '../config';
import { JwtOptions, JWTClaims } from './interface';
import * as jwt from 'jsonwebtoken';

export class JWTHelper {

    private static _options: JwtOptions = {
        algorithm: 'HS256',
        expiresIn: Config.param("JWT_EXPIRES", '2 days'),
        jwtid: Config.param("JWT_ID", "jsonwebtoken")
    };

    static async sign(claims: JWTClaims) {
        return await jwt.sign(claims, Config.param("JWT_KEY", "CHANGEIT!!"), this._options);
    }
    static async nonce(uuid, ip, userAgent) {
        let opts = {
            algorithm: 'HS256',
            expiresIn: Config.param("NONCE_EXPIRES", '10m'),
            jwtid: Config.param("JWT_ID", "jsonwebtoken")
        };
        return await jwt.sign({ uuid, ip, userAgent }, Config.param("JWT_KEY", "CHANGEIT!!"), opts);
    }
    static async sessionToken(remoteAddress, userAgent, identityUserId, userId, userUuid, accountId, appUuid, appId) {

        return await jwt.sign({ remoteAddress, userAgent, identityUserId, userId, userUuid, accountId, appUuid, appId }, Config.param("JWT_KEY", "CHANGEIT!!"), this._options);
    }

    static async verify(token: string) {
        return await jwt.verify(token, Config.param("JWT_KEY", "CHANGEIT!!"));
    }


}