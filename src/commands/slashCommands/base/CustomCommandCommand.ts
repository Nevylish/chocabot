import Command from "../../../core/base/Command";
import ChocaBotClient from "../../../core/base/ChocaBotClient";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {MessageEmbed, Permissions} from "discord.js";
import {CustomCommand} from "../../../modules/base/CustomCommand/schema";
import {CustomCommandManager} from "../../../modules/base/CustomCommand/manager";
import {Constants} from "../../../utils/constants";
import {Functions} from "../../../utils/functions";
import BadCommandUsage from "../../../exception/BadCommandUsage";
import isAlphanumeric = Functions.isAlphanumeric;

export default class CustomCommandCommand extends Command {
    constructor(client: ChocaBotClient) {
        super(client, {
            name: "commandes",
            description: "Groupe de commandes Custom Commands",
            help: {
                description: "Groupe de commandes Custom Commands"
            },
            slashCommand: true,
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MANAGE_GUILD],
            clientPermissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MANAGE_GUILD],
            options: [
                {
                    name: 'ajouter',
                    description: '🖊️ • Ajouter ou modifier une commande personnalisée',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: 'nom',
                            description: 'Nom de la commande',
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                        },
                        {
                            name: 'contenu',
                            description: 'Contenu de la commande',
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'retirer',
                    description: '🖊️ • Retirer une commande personnalisée',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "nom",
                            description: "Nom de la commande",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ]
                },
                {
                    name: 'liste',
                    description: '🖊️ • Afficher la liste des commandes personnalisées',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND
                }
            ]
        });
    }

    async onExecute(interaction, db) {
        const command = interaction.options.getSubcommand();

        const name = interaction.options.getString("nom"),
            content = interaction.options.getString("contenu");

        if (!isAlphanumeric(name)) throw new BadCommandUsage("Le nom de la commande ne doit pas contenir de caractères spéciaux ou d'espaces");

        if (content?.length < 1) throw new BadCommandUsage("Le contenu de la commande ne peut pas être vide");
        if (content?.length > 2000) throw new BadCommandUsage("Le contenu de la commande ne peut pas dépasser 2000 caractères");

        if (command === "ajouter") {
            if (CustomCommandManager.collection.has(`${interaction.guild.id}_${name}`)) {
                await CustomCommandManager.updateCommand(interaction.guild.id, name, content).then(command => {
                    interaction.reply({
                        embeds: [new MessageEmbed()
                            .setColor(Constants.Colors.GREEN)
                            .setDescription(`La commande ${command.name} a été mise à jour\n\n${command.content}`)
                        ]
                    })
                });
            } else {
                await CustomCommandManager.createCommand(interaction.guild.id, name, content).then(command => {
                    interaction.reply({
                        embeds: [new MessageEmbed()
                            .setColor(Constants.Colors.GREEN)
                            .setDescription(`La commande ${command.name} a été créée\n\n${command.content}`)
                        ]
                    })
                });
            }
        } else if (command === "retirer") {
            await CustomCommandManager.deleteCommand(interaction.guild.id, name).then(command => {
                interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(Constants.Colors.GREEN)
                        .setDescription(`La commande ${command.name} a été supprimée`)
                    ]
                })
            })
        } else {
            const data = await CustomCommand.find({guildId: interaction.guild.id}).lean(),
                commands = data.map((cmd, i) => `${i + 1}: ${cmd.name}`).join("\n");

            if (!commands) throw new Error("Il n'y a pas de commandes sur le serveur");

            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setColor(Constants.Colors.YELLOW)
                    .setDescription(`${commands}`)
                ]
            });
        }
    }
}
