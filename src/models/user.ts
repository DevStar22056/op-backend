import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { ApiModelProperty } from '@nestjs/swagger';

import { ValidateNested, validate, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max, IsNotEmpty } from "class-validator";

@Entity()
export class User {
    @PrimaryGeneratedColumn({ name: "user_id" })
    id: number;

    @IsNotEmpty({ message: "Required" })
    @ApiModelProperty()
    @Column({ name: "user_first_name" })
    firstName: string;

    @IsNotEmpty({ message: "Required" })
    @Column({ name: "user_last_name" })
    @ApiModelProperty()
    lastName: string;

    @Column({ name: "user_uuid" })
    uuid: string;

    @Column({ name: "user_country" })
    @ApiModelProperty()
    country?: string;

    @Column({ name: "user_mobile_number" })
    @ApiModelProperty()
    mobileNumber?: string;

    @IsEmail()
    @Column({ name: "user_email" })
    @ApiModelProperty()
    email: string;

    @Column({ name: "user_app_uuid" })
    @ApiModelProperty()
    appUuid: string;

    @Column({ name: "user_password" })
    password?: string;

    @Column({ name: "user_salt" })
    salt?: string;

    @Column({ name: "user_create_time" })
    @ApiModelProperty()
    creation?: Date;

    @Column({ name: "user_activation_hash" })
    activationHash?: string;

    @Column({ name: "user_activation_expire" })
    @ApiModelProperty()
    activationExpire?: Date;

    @Column({ name: "user_modify_time" })
    @ApiModelProperty()
    updated?: Date;

    @Column({ name: "user_status" })
    @ApiModelProperty()
    status?: boolean;


    @ApiModelProperty({ description: "TOKEN JWT" })
    token?: string;
    rePassword?: string;

    refferingId?: string;
    numbers?: any;

    static withId(id: number): User {
        let us = new User();
        us.id = id;
        return us;
    }
}

