import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";

import { User } from './user'
import { ApiModelProperty } from '@nestjs/swagger';

@Entity("contacts")
export class Contact {
    @PrimaryGeneratedColumn({ name: "cont_id" })
    @ApiModelProperty()
    id: number;

    @Column({ name: "cont_create_time" })
    @ApiModelProperty()
    creation?: Date;

    @OneToOne(type => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToOne(type => User)
    @JoinColumn({ name: "contact_id" })
    contact: User;

}