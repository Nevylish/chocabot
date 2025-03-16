import {Model, model, Schema} from "mongoose";

export interface IGuildDBSchema {
    id: string;
    prefix: string;
    createdAt: Date;
}

const guildSchema = new Schema({
    id: String,
    prefix: {
        type: String,
        default: "!"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// @ts-ignore
export const Guild: Model<IGuildDBSchema> = model('Guild', guildSchema);
