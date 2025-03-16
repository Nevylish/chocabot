import {Model, model, Schema} from "mongoose";

export interface IMemberDBSchema {
    id: string;
    logs: {
        profilepics: [{
            base64: string;
            createdAt?: Date;
        }];
        usernames: [{
            username: string;
            createdAt?: Date;
        }]
    }
    createdAt: Date;
}

const memberSchema = new Schema({
    id: String,
    logs: {
        profilepics: [{
            base64: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        usernames: [{
            username: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// @ts-ignore
export const Member: Model<IMemberDBSchema> = model('Member', memberSchema);
