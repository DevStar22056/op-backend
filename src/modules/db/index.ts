import { Module } from '@nestjs/common';
import { Config } from '../../util/config';

import { EntityManager, createConnection, Connection } from "typeorm";

var connection: Connection

var connecting = false

let delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let managerFactory = async () => {
    while (connecting) {
        await delay(500)
    }
    if (!connecting && !connection) {
        connecting = true;
        connection = await createConnection({
            type: "postgres",
            host: Config.string("DB_HOST", "localhost"),
            logging: true,
            port: Config.number("DB_PORT", 5432),
            username: Config.string("DB_USER", "postgres"),
            password: Config.string("DB_PASSWORD", "changeit"),
            database: Config.string("DB_NAME", "postgres"),
            entities: [
                __dirname + "/../../models/*.ts"
            ]

        })
        connecting = false
    }
    return connection.manager
};


@Module({
    controllers: [],
    components: [
        { provide: EntityManager, useFactory: managerFactory }],
    modules: [],
    exports: [EntityManager]
})
export class DBFactoryModule { }
