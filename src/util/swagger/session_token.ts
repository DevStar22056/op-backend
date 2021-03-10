import { ApiModelProperty } from '@nestjs/swagger';

import { ValidateNested, validate, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max, IsNotEmpty } from "class-validator";

export class SessionToken {

    @IsNotEmpty({ message: "Required" })
    @ApiModelProperty()
    userId: string;

    @IsNotEmpty({ message: "Required" })
    @ApiModelProperty()
    identityToken: string;

}

