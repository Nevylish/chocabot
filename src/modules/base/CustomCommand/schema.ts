import {model, Model, Schema} from "mongoose";

export interface ICustomCommandDBSchema {
    name: string;
    content: string;
}

const customCommandSchema = new Schema({
    name: String,
    content: String
});

// @ts-ignore
export const CustomCommand: Model<ICustomCommandDBSchema> = model("custom_command", customCommandSchema);
