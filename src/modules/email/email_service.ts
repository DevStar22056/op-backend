import { Component } from '@nestjs/common';
import * as nodemailer from 'nodemailer'
import { Config } from '../../util/config';
import { StringHelper } from '../../util/helper';
import { EmailOptions } from './email_options';
import { EmailTemplate } from './email_template';

@Component()
export class EmailService {

    constructor() { }

    async sendMail(templateName: string, to: string, options: any) {

        let transporter = nodemailer.createTransport({
            host: Config.string("MAIL_HOST", ""),
            port: Config.number("MAIL_PORT", 587),
            secure: true, // true for 465, false for other ports
            auth: {
                user: Config.string("MAIL_USER", ""), // generated ethereal user
                pass: Config.string("MAIL_PASSWORD", "") // generated ethereal password
            },
            tls: { rejectUnauthorized: false },
            debug: true
        });
        let template = this.getTemplate(templateName, options);
        await transporter.sendMail({
            subject: StringHelper.format(template.subject, options),
            html: StringHelper.format(template.template, options),
            to: to,
            from: Config.string("MAIL_USER", "")
        });
    }
    //TODO from database (whitelabel)
    getTemplate(name, params) {
        let template: EmailOptions | undefined;
        Object.keys(EmailTemplate).some(key => {
            if (key === name) {
                template = EmailTemplate[key];
                return true;
            }
            return false;
        });
        if (!template) throw new Error("template not found")
        return template
    }

}