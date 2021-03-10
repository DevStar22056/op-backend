import { Module } from '@nestjs/common';
import { UserFacade } from './user.facade';
import { ContactFacade } from './contact.facade';
import { DBFactoryModule } from '../db';
import { EmailModule } from '../email';

@Module({
    components: [UserFacade, ContactFacade],
    exports: [UserFacade, ContactFacade],
    modules: [DBFactoryModule, EmailModule]
})
export class FacadeModule { }

export { UserFacade } from './user.facade';
export { ContactFacade } from './contact.facade';