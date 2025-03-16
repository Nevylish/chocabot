import {MessageActionRow, MessageButton, MessageEmbed, TextChannel, User} from "discord.js";
import {Constants} from "../../utils/constants";
import {ChocaBot} from "../../index";
import * as moment from "moment/moment";
import {TextUtils} from "../../utils/text";
import {MemberManager} from "../../core/database/schemas/MemberManager";
import {IMemberDBSchema} from "../../core/database/schemas/Member";

export module MemberLogManager {
    import escapeMarkdown = TextUtils.escapeMarkdown;

    export const avatarUpdate = async (_old: User, _new: User) => {
        if (!ChocaBot._channels.logs.avatar_update) return;

        if (_old.avatarURL() !== _new.avatarURL()) {
            const member: IMemberDBSchema = await MemberManager.findOrCreateMember(_new.id);
            const image = require('image-to-base64');

            image(_new.avatarURL() + "?size=4096").then((response) => {
                const base64 = "data:image/png;base64," + response;

                member.logs.profilepics.push({
                    base64: base64
                });

                // @ts-ignore
                member.save();
            });

            const embed = new MessageEmbed()
                .setAuthor({name: `Photo de profil modifiée - ${escapeMarkdown(_new.tag)}`, iconURL: _new.avatarURL()})
                .setImage(`${_new.avatarURL()}?size=4096`)
                .setDescription(`<@${_new.id}> a changé sa photo de profil ${moment().format("[le**] LL [**à**] LTS")}**\n\n`)
                .setFooter({text: `Identifiant de l'utilisateur: ${_new.id}\n(Bientôt: possibilité de voir pendant 24 heures l'ancienne photo de profil)\n`})
                .setColor('WHITE')
                .setTimestamp()

            const old_button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setURL(_old.avatarURL({size: 4096}))
                        .setLabel("Voir l'ancienne photo de profil")
                        .setStyle("LINK"),
                );


            const new_button = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setURL(_new.avatarURL({size: 4096}))
                        .setLabel("Voir la nouvelle photo de profil")
                        .setStyle("LINK"),
                );

            return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.avatar_update) as TextChannel).send({
                embeds: [embed],
                components: [old_button, new_button]
            });
        }
    }

    export const usernameUpdate = async (_old: User, _new: User) => {
        if (!ChocaBot._channels.logs.username_update) return;

        if (_old.tag === _new.tag) return;

        const member: IMemberDBSchema = await MemberManager.findOrCreateMember(_new.id);

        member.logs.usernames.push({
            username: _new.tag
        });

        // @ts-ignore
        member.save();

        let usernames = [];

        for (let i in member.logs.usernames) {
            if (["0", "1"].includes(i)) continue;
            if (i === "5") break;
            usernames.push(`• ${member.logs.usernames[i].username}`);
        }

        usernames.reverse();

        if (_old.tag !== _new.tag) {
            const embed = new MessageEmbed()
                .setAuthor({name: `Nom d'utilisateur modifié - ${escapeMarkdown(_old.tag)}`, iconURL: _new.avatarURL()})
                .setThumbnail(`${_old.avatarURL()}?size=4096`)
                .setDescription(`<@${_old.id}> a changé son nom d'utilisateur ${moment().format("[le**] LL [**à**] LTS")}**` +
                    `\n\n\`\`\`diff\n- ${escapeMarkdown(_old.tag)}\`\`\`\`\`\`diff\n+ ${escapeMarkdown(_new.tag)}\`\`\`` +
                    `\n${usernames.length > 1 ? `${usernames.length} derniers pseudos:\n` : "Dernier pseudo: "} ${usernames.join("\n")}`)
                .setFooter({text: `Identifiant de l'utilisateur: ${_new.id}`})
                .setColor(Constants.Colors.WHITE)
                .setTimestamp()

            return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.username_update) as TextChannel).send({embeds: [embed]});
        }
    }
}
