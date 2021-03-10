import { ApiModelProperty } from '@nestjs/swagger';

export class SignupReq {
    @ApiModelProperty()
    email: string;
    @ApiModelProperty()
    password: string;
    @ApiModelProperty()
    rePassword: string;
    @ApiModelProperty()
    firstName: string;
    @ApiModelProperty()
    lastName: string;

}