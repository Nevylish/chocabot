import {GuildMember, MessageEmbed, TextChannel} from "discord.js";
import {ChocaBot} from "../../index";
import {Constants} from "../../utils/constants";

export module WelcomeLogManager {
    export const welcome = async (member: GuildMember) => {
        if (!ChocaBot._channels.logs.welcome) return;

        const embed = new MessageEmbed()
            .setAuthor({
                name: `Arrivée d'un membre - ${member.user.tag}`,
                iconURL: member.user.avatarURL({format: "png", dynamic: true})
            })
            .setThumbnail(member.user.avatarURL())
            .setColor(Constants.Colors.GREEN)
            .setTimestamp()
        if (!member.user.bot) {
            embed.setDescription(`:inbox_tray: <@${member.id}> viens de rejoindre le serveur.\nIl y a désormais **${(await member.guild.members.fetch()).filter(m => !m.user.bot)}** membres.`)
            embed.addFields(
                {name: "Arrivé(e) sur le serveur le ", value: `${new Date().toLocaleString("fr-FR")}`},
                {name: "Compte crée", value: `${new Date(member.user.createdTimestamp).toLocaleDateString("fr-FR")}`},
            )
            embed.setFooter({text: `Identifiant de l'utilisateur: ${member.id}`});
        } else {
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: "BOT_ADD"
            });

            const logs = fetchedLogs.entries.first(),
                userAddBot = logs.executor.tag,
                userIdAddBot = logs.executor.id;

            embed.setDescription(`:inbox_tray: Le bot <@${member.id}> a été ajouté sur le serveur par <@${userIdAddBot}> **(${userAddBot})**.\nIl y a désormais **${(await member.guild.members.fetch()).filter(m => m.user.bot)}** bots.`)
            embed.addFields(
                {name: "Arrivé(e) sur le serveur le ", value: `${new Date().toLocaleString("fr-FR")}`},
                {
                    name: "Date de création du bot:",
                    value: `${new Date(member.user.createdTimestamp).toLocaleDateString("fr-FR")}`
                }
            )
            embed.setFooter({text: `Identifiant utilisateur du bot: ${member.id}`});
        }

        return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.welcome) as TextChannel).send({embeds: [embed]});
    }

    export const bye = async (member: GuildMember) => {
        if (!ChocaBot._channels.logs.leave) return;

        const embed = new MessageEmbed()
            .setAuthor({
                name: `Départ d'un membre - ${member.user.tag}`,
                iconURL: member.user.avatarURL({format: "png", dynamic: true})
            })
            .setThumbnail(member.user.avatarURL())
            .setColor(Constants.Colors.RED)
            .setTimestamp()
        if (!member.user.bot) {

            embed.setDescription(`:outbox_tray: <@${member.id}> a quitté le serveur.\nIl y a désormais **${member.guild.memberCount}** membres.`)
            embed.addFields(
                {
                    name: "Compte crée le:",
                    value: `${new Date(member.user.createdTimestamp).toLocaleDateString("fr-FR")}`
                },
                {
                    name: "Avait rejoint le serveur le:",
                    value: `${new Date(member.joinedTimestamp).toLocaleDateString("fr-FR")}`
                },
                {name: "A quitté le serveur le", value: `${new Date().toLocaleDateString("fr-FR")}`},
                {name: "Rôle(s):", value: `${member.roles.cache.map(r => `<@&${r.id}>`).join(', ')}`}
            )
            embed.setFooter({text: `Identifiant de l'utilisateur: ${member.id}`});
        } else {
            embed.setDescription(`:inbox_tray: Le bot <@${member.id}> a été retiré du serveur.\nIl y a désormais **${member.guild.memberCount}** membres.`)
            embed.addFields(
                {
                    name: "Date de création du bot:",
                    value: `${new Date(member.user.createdTimestamp).toLocaleDateString("fr-FR")}`
                },
                {
                    name: "Avait été ajouté au serveur le:",
                    value: `${new Date(member.joinedTimestamp).toLocaleDateString("fr-FR")}`
                }
            )
            embed.setFooter({text: `Identifiant utilisateur du bot: ${member.id}`});
        }

        return (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.leave) as TextChannel).send({embeds: [embed]});
    }
}
