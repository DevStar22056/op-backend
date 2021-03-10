import { ApiModelProperty } from '@nestjs/swagger';

import { ValidateNested, validate, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max, IsNotEmpty } from "class-validator";

export class Dev {
    id: number;

    @IsNotEmpty({ message: "Required" })
    @ApiModelProperty()
    firstName: string;

    @IsNotEmpty({ message: "Required" })
    @ApiModelProperty()
    lastName: string;

    @ApiModelProperty()
    country?: string;

    @ApiModelProperty()
    mobileNumber?: string;

    @IsEmail()
    @ApiModelProperty()
    email: string;

}

