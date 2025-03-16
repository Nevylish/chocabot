import {Collection} from "discord.js";
import {Guild, IGuildDBSchema} from "./Guild";
import {Logger} from "../../../utils/logger";

export module GuildManager {
    import log = Logger.log;
    import success = Logger.success;
    import error = Logger.error;
    export const collection: Collection<string, IGuildDBSchema> = new Collection();

    export const load = async () => {
        collection.clear();
        try {
            log("GuildManager", "(load) Loading guilds...")
            const data = await Guild.find({});
            data.map(guild => {
                collection.set(guild.id, guild);
            });
            success("GuildManager", "(load) Loaded " + collection.size + " guilds.");
        } catch (e) {
            error("GuildManager", "(load)", e);
        }
    };

    export const findOrCreateGuild = async (id: string) => {
        if (collection.has(id)) {
            return collection.get(id);
        } else {
            const guild = await Guild.create({id: id});
            collection.set(id, guild);
            return guild;
        }
    }

    export const updateGuild = async (id: string, key: string, value: any) => {
        const guild = await Guild.findOne({id: id});
        guild[key] = value;
        await guild.save();
        collection.set(id, guild);
    }
}