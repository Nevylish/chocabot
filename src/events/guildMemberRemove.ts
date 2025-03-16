import ChocaBotClient from "../core/base/ChocaBotClient";
import {GuildMember} from "discord.js";
import {WelcomeLogManager} from "../modules/logs/WelcomeLogManager";

export = async (client: ChocaBotClient, member: GuildMember) => {
    await WelcomeLogManager.bye(member);
};