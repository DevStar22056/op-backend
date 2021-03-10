import { Form } from 'multiparty';
import { Config } from '../config'
export class Upload {
    static async parseRequestAvatar(req: any, callback: (err, fields, files) => Promise<any>) {
        var form = new Form({ maxFilesSize: Config.number("UPLOAD_MAXAVATAR_SIZE", 2048) * 1024 });
        form.parse(req, callback);
    }
    static async parseRequestRecording(req: any, callback: (err, fields, files) => Promise<any>) {
        var form = new Form({ maxFilesSize: Config.number("UPLOAD_MAXARECORDING_SIZE", 2048) * 1024 });
        form.parse(req, callback);
    }
}