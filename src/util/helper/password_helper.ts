import { Config } from "../config"
export class PasswordHelper {

    static validatePassword(password): boolean {
        if (!password) return false;
        let passRegex;
        try {
            passRegex = new RegExp(Config.string("PASSWORD_REGEX", "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$"));
        } catch (e) {
            passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
        }

        return password.match(passRegex)
    }
}