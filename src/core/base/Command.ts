import {ApplicationCommandData, Collection, CommandInteraction, GuildMember} from "discord.js";
import ChocaBotClient from "./ChocaBotClient";
import {ChocaBot} from "../../index";
import {IGuildDBSchema} from "../database/schemas/Guild";
import {IMemberDBSchema} from "../database/schemas/Member";

export type CommandInfo = ApplicationCommandData & {
    help?: {
        description?: string;
        usage?: string;
        examples?: string[];
    };
    cooldown?: number;
    slashCommand?: boolean;
    messageCommand?: boolean;
    memberPermissions?: Array<bigint>;
    clientPermissions?: Array<bigint>;
};

export default abstract class Command {

    readonly client: ChocaBotClient;
    readonly info: CommandInfo;

    cooldowns: Collection<string, number> = new Collection();

    protected constructor(client: ChocaBotClient, info: CommandInfo) {
        this.client = client;
        this.info = info;

        client.commands.set(this.info.name, this);
    }

    hasCooldown = (member: GuildMember): boolean => {
        if (ChocaBot.developers.includes(member.id)) return false;
        if (!this.cooldowns.has(member.id)) return false;

        return Date.now() <= this.cooldowns.get(member.id);
    }

    abstract onExecute(interaction: CommandInteraction, db: { guild: IGuildDBSchema, member: IMemberDBSchema }, args?: Array<string>);
}
