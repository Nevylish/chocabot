import ChocaBotClient from "../core/base/ChocaBotClient";
import {Message} from "discord.js";
import {MessageLogManager} from "../modules/logs/MessageLogManager";
import {AntiCheatManager} from "../modules/logs/AntiCheatManager";

export = async (client: ChocaBotClient, message: Message) => {
    await AntiCheatManager.logMessageEditedOrDeleted(message);
    await MessageLogManager.deleted(message);
};
