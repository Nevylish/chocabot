export module Constants {

    export const enum Colors {
        DEFAULT = "#eec5b3",
        ERROR = "RED",
        RED = "RED",
        YELLOW = "YELLOW",
        ORANGE = "ORANGE",
        GREEN = "GREEN",
        WHITE = "WHITE",
        WARNING = "#ffcc4d",
        INVISIBLE = "#2f3136",
    }

    export const enum Cooldowns {
        DEFAULT = 5,
        SHORT = 30,
        LONG = 2 * 60
    }

    export const enum ErrorMessages {
        COOLDOWN = "Tu dois attendre {time_remaining} avant de pouvoir réutiliser la commande \`{command_name}\`.",
        PERMISSION_MISSING = "Tu n'as pas les permissions nécessaires pour exécuter cette commande.\n\nPermissions nécessaires: {permissions}",
        UNKNOWN = "Une erreur est survenue lors de l'exécution de la commande et un rapport a été envoyé au développeur.",
        UNKNOWN_COMMAND = "La commande que tu as demandé n'existe pas ou plus.",
    }

    export interface IChannels {
        guild: string;
        logs: {
            welcome: string;
            leave: string;
            voice: string;
            avatar_update: string;
            username_update: string;
            message_edited: string;
            message_deleted: string;
            bot_logs: string;
        }
    }

    export const getChannels = (): IChannels => {
        switch (process.env.ENVIRONMENT) {
            case "production": {
                return {
                    guild: "783685806945730571",
                    logs: {
                        welcome: "783717857817002035",
                        leave: "783717857817002035",
                        voice: "783717945490276353",
                        avatar_update: "877551032979296336",
                        username_update: "877551032979296336",
                        message_edited: "783766453798567946",
                        message_deleted: "783766453798567946",
                        bot_logs: "783921328985735169",
                    }
                }
            }
            case "development": {
                return {
                    guild: "822720523234181150",
                    logs: {
                        welcome: "993996524151382158",
                        leave: "993996524151382158",
                        voice: "993996524151382158",
                        avatar_update: "993996524151382158",
                        username_update: "993996524151382158",
                        message_edited: "993996524151382158",
                        message_deleted: "993996524151382158",
                        bot_logs: "993996524151382158",
                    }
                }
            }
        }
    }
}
