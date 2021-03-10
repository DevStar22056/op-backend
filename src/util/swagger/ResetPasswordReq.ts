import { ApiModelProperty } from '@nestjs/swagger';

export class ResetPasswordReq {
    @ApiModelProperty()
    email: string;
}