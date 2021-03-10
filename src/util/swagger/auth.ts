import { ApiModelProperty } from '@nestjs/swagger';

export class AuthReq {
    @ApiModelProperty()
    email: string;
    @ApiModelProperty()
    password: string;
}