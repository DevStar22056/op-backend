import * as fs from 'fs';
import * as path from 'path';
import { Config } from "../config"

export class File {

    public static copyFile(source, subpath, fileName, cb) {
        var cbCalled = false;
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            done(err);
        });
        let targetDir = Config.string("UPLOAD_DIR", "/var/www/uploads/") + subpath;
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(parentDir, childDir);
            if (!fs.existsSync(curDir)) {
                fs.mkdirSync(curDir);
            }
            return curDir;
        }, initDir);

        var wr = fs.createWriteStream(Config.string("UPLOAD_DIR", "/var/www/uploads") + path.sep + subpath + fileName);
        wr.on("error", function (err) {
            done(err);
        });
        wr.on("close", function (ex) {
            done(undefined);
        });
        rd.pipe(wr);

        function done(err) {
            if (!cbCalled) {
                cb(err);
                cbCalled = true;
            }
        }
    }

}