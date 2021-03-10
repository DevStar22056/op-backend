'use strict';

require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { DispatchError } from './filters/DispatchError';
import { ApplicationModule } from './modules/app.module';
import { Config } from './util/config';
import * as cors from 'cors';
import * as  swaggerUI  from 'swagger-ui-express';
import "reflect-metadata";

const instance = express();
/* Express middleware. */
instance.use(bodyParser.json());
instance.use(bodyParser.urlencoded({ extended: false }));
instance.use(cors());
/* End of express middleware. */

async function bootstrap() {
  try {
    const app = await NestFactory.create(ApplicationModule, instance);
    app.useGlobalFilters(new DispatchError());
    await app.listen(Config.number("HTTP_PORT", 9090), Config.string("LISTEN_INTERFACE", "0.0.0.0"), () => console.log('Application is listening on port ' + Config.number("HTTP_PORT", 9090)));
    instance.disable('x-powered-by');
    const document = SwaggerModule.createDocument(app,
      {
        info: {
          title: "Arquitectura Backend Api", description: "Arqui Backend api",
          contact: { email: "jorg.villada@gmail.com" }
        },
        securityDefinitions: { bearer: { type: "apiKey", name: "Authorization", in: "header" } }
      });
    instance.use('/api-docs.json', (req, res, next) => res.send(document));
    instance.use('/swagger', swaggerUI.serve, swaggerUI.setup(document));
  } catch (e) { }
}
bootstrap();

process.on('unhandledRejection', (reason) => {
  console.log(reason);
});