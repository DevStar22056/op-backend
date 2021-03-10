import { ApiModelProperty } from '@nestjs/swagger';

export class NonceRes {
    @ApiModelProperty()
    nonce: string;
}