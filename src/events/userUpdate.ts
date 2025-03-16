import ChocaBotClient from "../core/base/ChocaBotClient";
import {User} from "discord.js";
import {MemberLogManager} from "../modules/logs/MemberLogManager";

export = async (client: ChocaBotClient, _old: User, _new: User) => {
    await MemberLogManager.avatarUpdate(_old, _new);
    await MemberLogManager.usernameUpdate(_old, _new);
};
