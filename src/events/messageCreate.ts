import ChocaBotClient from "../core/base/ChocaBotClient";
import {Message} from "discord.js";
import {Handlers} from "../core/base/Handlers";

export = async (client: ChocaBotClient, message: Message) => {
    if (!message.author.bot) return await Handlers.messageCommandHandler(message);
};
