'use strict';

import { HttpException } from '@nestjs/core';
import { Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MessageCodeError } from '../util/error';

@Catch(MessageCodeError,  HttpException, Error)
export class DispatchError implements ExceptionFilter {
    public catch(err, res) {
        console.log("ERRROR ",err);

        if (err instanceof MessageCodeError) {
            /* MessageCodeError, Set all header variable to have a context for the client in case of MessageCodeError. */
	    res.setHeader('Access-Control-Expose-Headers', 'x-message-code-error, x-message, x-httpStatus-error');
            res.setHeader('x-message-code-error', err.messageCode);
            res.setHeader('x-message', err.message);
            res.setHeader('x-httpStatus-error', err.httpStatus);

            return res.status(err.httpStatus).send();
        } else {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
}
