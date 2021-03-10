import { User, Contact } from "../../models";
import { Component } from '@nestjs/common';
import { MessageCodeError } from '../../util/error';
import { Constants } from '../../util/constants';
import { Config } from '../../util/config';
import { PasswordHelper, StringHelper } from '../../util/helper';
import { genSaltSync, hashSync } from 'bcrypt';
import { UserFacade } from './user.facade';
import { v4 } from 'uuid';


import { EntityRepository, EntityManager, AbstractRepository, Connection, Repository } from "typeorm";

@EntityRepository()
@Component()
export class ContactFacade {

    constructor(private entityManager: EntityManager,
        private userFacade: UserFacade
    ) { }


    async followContact(currentUser, uuid: string) {
        const foundContact = await this.userFacade.findByUuid(uuid);
        if (!foundContact) throw new MessageCodeError('contact:notExists');
        let manager = await this.entityManager;
        let contact = new Contact();
        contact.contact = foundContact;
        contact.user = User.withId(currentUser.userId);
        contact.creation = new Date()
        return await manager.save(contact);
    }

    async findByFilters(userId: number, appUuid: string, offset: number, limit: number, filter: string, orderBy: string, orderType: string, followed: boolean) {
        let manager = await this.entityManager;
        let query = manager.createQueryBuilder("user", "usr")
            .select("usr.user_id", "id")
            .addSelect("usr.user_create_time", "creation")
            .addSelect("case when cont.contact_id is not null then true else false end as followed")
            .addSelect("usr.user_first_name", "firstName")
            .addSelect("usr.user_last_Name", "lastName")
            .addSelect("usr.user_email", "email")
            .addSelect("usr.user_uuid", "uuid")
            .leftJoin("contacts", "cont", " cont.contact_id = usr.user_id and cont.user_id = :userId")
            .where("usr.user_id <> :userId ");
        if (followed) {
            query.andWhere(" cont.contact_id is not null ");
        }
        if (filter && filter.trim()) {
            query.andWhere(" ( lower(usr.user_first_name) like lower(:filter) OR lower(usr.user_last_Name) like lower(:filter) OR lower(usr.user_email) like lower(:filter) )  ");
            query.setParameter("filter", "%" + filter + "%");
        }
        if (!orderBy) {
            orderBy = "first_name";
        }
        if (!orderType || "ascending" === orderType) {
            query.orderBy("usr." + orderBy, "ASC");
        } else if (!orderType || "descending" === orderType) {
            query.orderBy("usr." + orderBy, "DESC");
        }
        query.setParameter("userId", userId);
        query.offset(offset);
        query.limit(limit);

        let res: any = [];
        let data = await query.getRawMany();
        res.push(data);
        let count = await query.getCount();
        res.push(count);
        return res;
    }
}
