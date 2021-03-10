import { ApiModelProperty } from '@nestjs/swagger';

export class HashReq {
    @ApiModelProperty()
    hash: string;
}