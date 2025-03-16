import {Collection} from "discord.js";
import {CustomCommand, ICustomCommandDBSchema} from "./schema";
import {Logger} from "../../../utils/logger";

export module CustomCommandManager {
    import log = Logger.log;
    import error = Logger.error;
    import success = Logger.success;
    export const collection: Collection<string, ICustomCommandDBSchema> = new Collection();

    export const load = async () => {
        collection.clear();
        try {
            log("CustomCommandManager", "(load) Loading custom commands...");
            const data = await CustomCommand.find({}).lean();
            data.map(cmd => {
                collection.set(cmd.name, cmd);
            });
            success("CustomCommandManager", "(load)", `Loaded ${collection.size} custom commands.`);
        } catch (e) {
            error("CustomCommandManager", "(load)", e);
        }
    };

    export const createCommand = async (guildId: string, name: string, content: string) => {
        const data = await CustomCommand.create({
            name: name,
            content: content
        });

        collection.set(name, data);
        return data;
    }

    export const deleteCommand = async (guildId: string, name: string) => {
        const data = await CustomCommand.findOneAndDelete({
            name: name
        });

        if (!data) throw new Error(`La commande ${name} n'existe pas`);

        collection.delete(guildId);
        return data;
    }

    export const updateCommand = async (guildId: string, name: string, content: string) => {
        const data = await CustomCommand.findOneAndUpdate({
            name: name
        }, {$set: {content: content}});

        collection.set(name, data);
        return data;
    }
}
