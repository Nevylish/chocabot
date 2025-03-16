import * as mongoose from "mongoose";
import {Logger} from "../../utils/logger";
import error = Logger.error;
import log = Logger.log;
import success = Logger.success;
import debug = Logger.debug;

export default class Database {
    connect = async () => {
        mongoose.set("debug", (collectionName, method, query, doc) => {
            debug("Database", "(debug)", `${collectionName}.${method}`, query, doc);
        });

        log("Database", "Connecting to MongoDB Server...");
        await mongoose.connect(process.env.MONGODB_URI).then(() => {
            success("Database", "Successfully connected to database !");
        }).catch(err => {
            error("Database", "Oops, connection to database failed.\n", err);
            process.exit(0);
        });
    }
}
