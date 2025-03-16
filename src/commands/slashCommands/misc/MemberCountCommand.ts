import {MessageEmbed} from "discord.js";
import Command from "../../../core/base/Command";
import ChocaBotClient from "../../../core/base/ChocaBotClient";
import {Constants} from "../../../utils/constants";

export default class MemberCountCommand extends Command {
    constructor(client: ChocaBotClient) {
        super(client, {
            name: "membres",
            description: "Affiche le nombre de membres sur le serveur",
            help: {
                description: "Affiche le nombre de membres sur le serveur",
            },
            slashCommand: true,
            messageCommand: true,
        });
    }

    async onExecute(interaction, db, args) {
        let banner = interaction.guild.bannerURL({format: "png", dynamic: true})
            ? interaction.guild.bannerURL({format: "png", dynamic: true})
            : interaction.guild.splashURL({format: "png", dynamic: true});

        const embed = new MessageEmbed()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({format: "png", dynamic: true})
            })
            .setDescription(`Il y a **${(await interaction.guild.members.fetch()).filter(m => !m.user.bot).size} membres (humains)** sur le serveur et **${(await interaction.guild.members.fetch()).filter(m => m.user.bot).size} bots**`)
            .setColor(Constants.Colors.DEFAULT)

        if (banner) embed.setThumbnail(banner);

        return interaction.reply({
            embeds: [embed], ephemeral: true
        });
    }
}
