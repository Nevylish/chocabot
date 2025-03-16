import {Client, Collection, Guild, Intents} from "discord.js";
import {Handlers} from "./Handlers";
import Command from "./Command";
import Database from "../database/Database";
import {Logger} from "../../utils/logger";
import {MemberManager} from "../database/schemas/MemberManager";
import {GuildManager} from "../database/schemas/GuildManager";
import {CustomCommandManager} from "../../modules/base/CustomCommand/manager";
import {Constants} from "../../utils/constants";
import success = Logger.success;
import error = Logger.error;
import log = Logger.log;
import getChannels = Constants.getChannels;
import IChannels = Constants.IChannels;

export default class ChocaBotClient extends Client {
    readonly commands: Collection<string, Command> = new Collection();

    readonly database: Database;

    readonly developers: Array<string> = process.env.DEVELOPERS_ID.split(",");

    cache: Array<any> = [];

    _channels: IChannels = getChannels();

    chocaland: Guild;

    constructor(token: string) {
        super({
                intents: [
                    Intents.FLAGS.DIRECT_MESSAGES,
                    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
                    Intents.FLAGS.GUILDS,
                    Intents.FLAGS.GUILD_BANS,
                    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                    Intents.FLAGS.GUILD_INTEGRATIONS,
                    Intents.FLAGS.GUILD_INVITES,
                    Intents.FLAGS.GUILD_MEMBERS,
                    Intents.FLAGS.GUILD_MESSAGES,
                    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                    Intents.FLAGS.GUILD_MESSAGE_TYPING,
                    Intents.FLAGS.GUILD_PRESENCES,
                    Intents.FLAGS.GUILD_VOICE_STATES,
                    Intents.FLAGS.GUILD_WEBHOOKS,
                ],
                allowedMentions: {
                    parse: ["roles", "users"],
                    repliedUser: false
                },
                partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
            }
        );

        this.database = new Database();
        this.database.connect().then(() => {
            log("Client", "Connecting to Discord...");
            super.login(token).then(async () => {
                this.chocaland = this.guilds.cache.get(this._channels.guild);
                this.chocaland.members.fetch().then(async () => {
                    await GuildManager.load();
                    await MemberManager.load();

                    Handlers.loadEventsListeners();
                    await Handlers.loadCommands();
                    await CustomCommandManager.load();
                    success("Client", "Successfully logged in to Discord !");
                })
            }).catch(err => {
                error("Client", "Oops, connection to Discord failed.\n", err);
                process.emit("SIGINT");
            });
        });
    };
};
