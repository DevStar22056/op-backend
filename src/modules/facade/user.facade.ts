import { User } from "../../models";
import { Component } from '@nestjs/common';
import { MessageCodeError } from '../../util/error';
import { Constants } from '../../util/constants';
import { Config } from '../../util/config';
import { PasswordHelper, StringHelper } from '../../util/helper';
import { genSaltSync, hashSync } from 'bcrypt';
import { v4 } from 'uuid';
import { EmailService } from '../email';



import { EntityRepository, EntityManager, AbstractRepository, Connection, Repository } from "typeorm";

@EntityRepository()
@Component()
export class UserFacade {

    constructor(private entityManager: EntityManager,
        private emailService: EmailService,
    ) { }

    async findByEmail(email: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user").select("user.id")
            .addSelect("user.email")
            .addSelect("user.creation")
            .addSelect("user.updated")
            .addSelect("user.uuid")
            .addSelect("user.appUuid")
            .addSelect("user.firstName")
            .addSelect("user.lastName")
            .addSelect("user.password")
            .where("user.email = :email ")
            .setParameters({ email })
            .getOne();
    }

    async findUserByHash(hash: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user").select("user.id")
            .addSelect("user.email")
            .addSelect("user.creation")
            .addSelect("user.updated")
            .addSelect("user.firstName")
            .addSelect("user.lastName")
            .addSelect("user.activationHash")
            .addSelect("user.activationExpire")
            .addSelect("user.password")
            .where("user.activationHash = :hash ")
            .setParameters({ hash })
            .getOne();
    }
    async findByUuid(uuid: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user").select("user.id")
            .addSelect("user.email")
            .addSelect("user.creation")
            .addSelect("user.uuid")
            .addSelect("user.updated")
            .addSelect("user.firstName")
            .addSelect("user.lastName")
            .andWhere("user.uuid = :uuid ")
            .setParameters({ uuid })
            .getOne();
    }
    async findById(userId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user").select("user.id")
            .addSelect("user.email")
            .addSelect("user.creation")
            .addSelect("user.uuid")
            .addSelect("user.appUuid")
            .addSelect("user.updated")
            .addSelect("user.firstName")
            .addSelect("user.lastName")
            .andWhere("user.id = :userId ")
            .setParameters({ userId })
            .getOne();
    }


    async signupUser(user: User) {
        if (!user) throw new MessageCodeError('auth:signup:missingInformation');
        if (!user.firstName) throw new MessageCodeError('auth:signup:missingFirstName');
        if (!user.lastName) throw new MessageCodeError('auth:signup:missingLastName');
        if (!user.email) throw new MessageCodeError('auth:signup:missingEmail');
        if (!user.password) throw new MessageCodeError('auth:signup:missingPassword');
        if (!user.appUuid) throw new MessageCodeError('auth:signup:missingApp');
        if (!user.rePassword) throw new MessageCodeError('auth:signup:missinRePassword');
        if (user.password !== user.rePassword) throw new MessageCodeError('auth:signup:passwordMatch');

        if (!PasswordHelper.validatePassword(user.password)) throw new MessageCodeError('user:passwordStrength');

        const found = await this.findByEmail(user.email);
        if (found) throw new MessageCodeError('user:alreadyExists');

        let manager = await this.entityManager;
        return await manager.transaction(async  tEM => {

            //USER
            user.uuid = v4();
            user.creation = new Date()
            user.updated = new Date()
            const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
            let hash = hashSync(user.password, salt);
            user.password = hash;
            user.status = true;
            user.salt = salt;

            return await tEM.save(user);

        })
    }
    async create(currentUser, user: User) {
        if (user.password !== user.rePassword) throw new MessageCodeError('auth:signup:passwordMatch');
        if (!PasswordHelper.validatePassword(user.password)) throw new MessageCodeError('user:passwordStrength');

        const found = await this.findByEmail(user.email);
        if (found) throw new MessageCodeError('dev:alreadyExists');

        let manager = await this.entityManager;
        return await manager.transaction(async  tEM => {
            //Account
            user.uuid = v4();
            user.creation = new Date()
            user.updated = new Date()
            const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
            let hash = hashSync(user.password, salt);
            user.password = hash;
            user.status = true;
            user.salt = salt;

            return await tEM.save(user);

        })
    }

    async updatePasswordUser(reqbody: any) {
        if (!reqbody.password || !reqbody.rePassword) {
            throw new MessageCodeError('password:invalid');
        }
        if (reqbody.password !== reqbody.rePassword) {
            throw new MessageCodeError('password:match');
        }
        if (!reqbody.hash) {
            throw new MessageCodeError('hash:invalid');
        }
        if (!PasswordHelper.validatePassword(reqbody.password)) throw new MessageCodeError('user:passwordStrength');
        let manager = await this.entityManager;
        let user = await manager.createQueryBuilder(User, "user")
            .where("user.activationHash = :hash ")
            .setParameters({ hash: reqbody.hash })
            .getOne();
        if (!user || !user.activationExpire) throw new MessageCodeError('hash:notFound');
        if (new Date() > user.activationExpire) throw new MessageCodeError('hash:expired');
        const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
        let hash = hashSync(reqbody.password, salt);
        manager.query("update \"user\" set user_password = $1, user_activation_expire = null, user_activation_hash = null, user_status=true, user_salt = $2 where user_id = $3", [hash, salt, user.id])
        return user;
    }

    async resetPassword(email: string) {
        if (!email) {
            return;
        }
        let user = await this.findByEmail(email);
        if (!user) {
            return;
        }

        let expire = new Date();
        expire.setHours(expire.getHours() + Config.number("USER_HASH_EXPIRATION", 24));
        user.activationExpire = expire;
        user.activationHash = v4();
        let manager = await this.entityManager;

        await manager.save(user);

        let link = Config.string("OPENTACT_URL", "https://demo.opentact.org/") + StringHelper.format(Config.string("RESET_PASSWORD_URL", "{HASH}"), { HASH: user.activationHash });
        this.emailService.sendMail("auth:resetPassword", user.email, {
            FIRST_NAME: user.firstName, LAST_NAME: user.lastName, LINK: link
        });


    }
}
