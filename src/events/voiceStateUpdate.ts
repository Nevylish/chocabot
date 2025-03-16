import ChocaBotClient from "../core/base/ChocaBotClient";
import {User} from "discord.js";
import {VoiceLogManager} from "../modules/logs/VoiceLogManager";

export = async (client: ChocaBotClient, _old: User, _new: User) => {
    await VoiceLogManager.onVoiceStateUpdate(_old, _new);
};
