import ChocaBotClient from "../core/base/ChocaBotClient";
import {Message} from "discord.js";
import {ChocaBot} from "../index";
import {MessageLogManager} from "../modules/logs/MessageLogManager";

export = async (client: ChocaBotClient, _old: Message, _new: Message) => {
    await MessageLogManager.edited(_old, _new);
    if (!_new.editedAt) return ChocaBot.emit("messageCreate", _new);
};
