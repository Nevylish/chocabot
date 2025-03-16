import {Permissions} from "discord.js";

export default class InsuffisantPermission extends Error {
    constructor(permissions: Permissions) {
        super(`Tu n'as pas les permissions suffisantes.${permissions ? `\nPermissions nécéssaires ${Permissions}` : ""}`);
    }
}
