'use strict';

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FacadeModule } from '../facade';

@Module({
    components: [AuthService],
    modules: [FacadeModule],
    exports: [AuthService]
})
export class AuthModule { }

export { AuthService } from './auth.service'