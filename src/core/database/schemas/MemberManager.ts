import {Collection} from "discord.js";
import {IMemberDBSchema, Member} from "./Member";
import {Logger} from "../../../utils/logger";

export module MemberManager {
    import error = Logger.error;
    import log = Logger.log;
    import success = Logger.success;
    export const collection: Collection<string, IMemberDBSchema> = new Collection();

    export const load = async () => {
        collection.clear();
        try {
            log("MemberManager", "(load) Loading members...");
            const data = await Member.find({});
            data.map(member => {
                collection.set(member.id, member)
            });
            success("MemberManager", "(load) Loaded " + collection.size + " members.");
        } catch (e) {
            error("MemberManager", "(load)", e);
        }
    }

    export const findOrCreateMember = async (id: string) => {
        if (collection.has(id)) {
            return collection.get(id);
        } else {
            const member = await Member.create({id: id});
            collection.set(id, member);
            return member;
        }
    }

    export const updateMember = async (id: string, key: string, value: any) => {
        const member = await Member.findOne({id: id});
        member[key] = value;
        await member.save();
        collection.set(id, member);
    }
}