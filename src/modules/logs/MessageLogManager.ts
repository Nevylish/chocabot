import {Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel} from "discord.js";
import {ChocaBot} from "../../index";
import {Constants} from "../../utils/constants";
import {TextUtils} from "../../utils/text";
import * as moment from "moment";

export module MessageLogManager {
    import escapeMarkdown = TextUtils.escapeMarkdown;
    export const deleted = async (message: Message) => {
        if (!ChocaBot._channels.logs.message_deleted) return;

        if (message.partial) return;
        /*if (message.partial) {
            message.fetch()
                .then(fetchedMessage => {
                    message = fetchedMessage;
                })
                .catch(() => {
                    message.content = "Impossible de récuperer le contenu du message *(trop ancien)*";
                });
        }*/

        if (message.author.bot) return;
        if (!message.guild && message.guild.id === ChocaBot._channels.guild) return;
        if (message.embeds[0]) return;

        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            type: "MESSAGE_DELETE"
        }), logs = fetchedLogs.entries.first();

        const embed = new MessageEmbed()
            .setAuthor({
                name: `Message supprimé - ${escapeMarkdown(message.author.tag)}`,
                iconURL: message.author.avatarURL()
            })
            .setColor(Constants.Colors.RED)
            .setDescription(`${logs.executor.id === message.author.id ? `<@${message.author.id}> a supprimé un message` : `<@${logs.executor.id}> a supprimé un message de <@${message.author.id}>`}  dans le salon <#${message.channel.id}>.\n\n` +
                `➜ Envoyé ${moment(message.createdAt).format("[le**] LL [**à**] LTS")}**\n➜ Supprimé ${moment().format("[le**] LL [**à**] LTS")}** soit ${moment(message.createdAt).toNow(true)} après\n‎ `)
            .addFields({
                name: "\nContenu du message supprimé:",
                value: `||${message.content.length > 0 && message.content.length <= 2044 ?
                    message.content :
                    `Message trop long (${message.content.length} caractères)`}||`
            })
            .setTimestamp()
            .setFooter({text: `Identifiant de l'utilisateur: ${message.author.id}`})

        if (message.attachments.size > 0) {
            embed.addFields({
                name: `**Fichiers joints** (**${message.attachments.size}**): :warning: Soit prudent.e`,
                value: `${message.attachments.map(a => `${a.proxyURL}`).join('\n')}`
            });
        }
        return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.message_deleted) as TextChannel).send({embeds: [embed]})
    }

    export const edited = async (_old: Message, _new: Message) => {
        if (!ChocaBot._channels.logs.message_edited) return;

        if (_old.partial) {
            _old.fetch()
                .then(message => {
                    _old.content = message.content;
                })
                .catch(() => {
                    _old.content = "Impossible de récuperer le contenu du message *(trop ancien)*";
                });
        }

        if (_old.author.bot) return;
        if (_old.content.includes("://")) return;

        const embed = new MessageEmbed()
            .setAuthor({
                name: `Message modifié - ${escapeMarkdown(_new.author.tag)}`,
                iconURL: _new.author.avatarURL()
            })
            .setDescription(`<@${_new.author.id}> a modifié un message dans le salon <#${_new.channel.id}>.\n\n` +
                `➜ Envoyé ${moment(_old.createdAt).format("[le**] LL [**à**] LTS")}**\n➜ Modifié ${moment().format("[le**] LL [**à**] LTS")}** soit ${moment().to(_new.createdAt, true)} après\n‎`)

            .addFields(
                {
                    name: "Ancien message:",
                    value: `${_old.content.length <= 2048 ? _old.content : `Message trop long. (${_old.content.length} caractères)`}`
                },
                {
                    name: "Nouveau message:",
                    value: `${_new.content.length <= 2048 ? _new.content : `Message trop long. (${_new.content.length} caractères)`}`
                }
            )
            .setColor(Constants.Colors.YELLOW)
            .setTimestamp()
            .setFooter({text: `Identifiant de l'utilisateur: ${_new.author.id}`})

        const goto_button = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setURL(`https://discord.com/channels/${_new.guild.id}/${_new.channel.id}/${_new.id}`)
                    .setLabel('Aller au message')
                    .setStyle('LINK'),
            );
        return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.message_edited) as TextChannel).send({
            embeds: [embed],
            components: [goto_button]
        });
    }
}
