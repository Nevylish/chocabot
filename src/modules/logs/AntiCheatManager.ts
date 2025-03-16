import {Message, MessageEmbed, TextChannel} from "discord.js";
import {ChocaBot} from "../../index";
import {Constants} from "../../utils/constants";
import * as moment from "moment/moment";

export module AntiCheatManager {
    export const logMessageEditedOrDeleted = async (message: Message) => {
        if ([ChocaBot._channels.logs.message_deleted, ChocaBot._channels.logs.message_edited].includes(message.channel.id)) {
            if (message.partial) return;

            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: "MESSAGE_DELETE",
            }), logs = fetchedLogs.entries.first();

            const deleted = message.embeds[0];
            if (!deleted) return;
            if (!["Message modifié -", "Message supprimé -"].includes(deleted.author?.name)) return;
            const embed = new MessageEmbed()
                .setAuthor({
                    name: deleted.author?.name || "Message modifié/supprimé - Wampus#0000",
                    iconURL: deleted.author?.iconURL || "https://i.nevylish.fr/9BqgM2YDMhD9.png"
                })
                .setDescription(deleted.description || "**Impossible de récuperer la date d'envoi et de suppression du message**")
                .setFooter({
                    text:
                        (!deleted.footer?.text.startsWith(`Tentative de suppression par ${logs.executor.tag}/${logs.executor.id}`) && deleted.footer?.text.length < 1720 ?
                            `Tentative de suppression par ${logs.executor.tag}/${logs.executor.id} ${moment(Date.now()).format("[le] LL [à] LTS")}\n` :
                            "") +
                        deleted.footer?.text || "Identifiant utilisateur: 000000000000000000"
                })
                .setColor(deleted.color || Constants.Colors.RED)
                .setTimestamp(deleted.timestamp || 0)

            if (deleted.fields[0]) {
                for (const field of deleted.fields) {
                    embed.addField(field.name || "Contenu du message modifié/supprimé & Fichers joints",
                        field.value || "Impossible de récuperer le contenu du message et/ou fichiers joints",
                        field.inline || false);
                }
            } else {
                embed.addField("Contenu du message modifié/supprimé & Fichers joints",
                    "Impossible de récuperer le contenu du message et/ou des fichiers joints");
            }


            return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.message_deleted) as TextChannel).send({embeds: [embed]});
        }
    }
}
