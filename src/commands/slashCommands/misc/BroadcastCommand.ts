import Command from "../../../core/base/Command";
import ChocaBotClient from "../../../core/base/ChocaBotClient";
import {MessageEmbed, Permissions} from "discord.js";
import {ApplicationCommandOptionTypes, MessageButtonStyles} from "discord.js/typings/enums";
import BadCommandUsage from "../../../exception/BadCommandUsage";
import {Constants} from "../../../utils/constants";
import {ButtonManager} from "../../../utils/button";
import {ChocaBot} from "../../../index";
import {Functions} from "../../../utils/functions";
import {TextUtils} from "../../../utils/text";
import jsonToBase64 = Functions.jsonToBase64;
import escapeMarkdown = TextUtils.escapeMarkdown;
import replaceAll = TextUtils.replaceAll;

export interface IEmbedBuilderJson {
    content?: string,
    embeds: Array<MessageEmbed>
}

export default class BroadcastCommand extends Command {
    constructor(client: ChocaBotClient) {
        super(client, {
            name: "broadcast",
            description: "Envoie un message privé à tous les membres du serveur",
            options: [
                {
                    name: "json",
                    description: "Le message à envoyer",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING
                },
            ],
            help: {
                description: "Envoie un message privé à tous les membres du serveur",
                usage: "/broadcast <message> <embed_title> <embed_color> <embed_image?> <embed_thumbnail?> <embed_footer_text?> <embed_footer_image?>"
            },
            slashCommand: true,
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR],
            clientPermissions: [Permissions.FLAGS.ADMINISTRATOR]
        });
    }

    async onExecute(interaction, db, args) {
        let json = interaction.options.getString("json"),
            obj: IEmbedBuilderJson;

        const members = interaction.guild.members.fetch();

        const base64DefaultJson = jsonToBase64(
            {
                embeds: [
                    {
                        "author": {
                            "icon_url": `${interaction.member.user.displayAvatarURL({size: 64})}`,
                            "name": `Message de la part de ${escapeMarkdown(replaceAll(interaction.member.user.tag, {
                                " ": "+"
                            }))}`
                        },
                        "description": "Pour envoyer l'embed il te suffit de cliquer sur le button `copier` en haut de la page et d'utiliser la commande en collant le texte dans le paramètre `json`.",
                        "color": Constants.Colors.DEFAULT,
                        "image": {
                            "url": "https://i.nevylish.fr/McMyiMsYqQjd.png"
                        }
                    }
                ]
            }
        );

        const builderurl = `https://nevylish.fr/tools/discord/embedbuilder?username=${escapeMarkdown(replaceAll(ChocaBot.user.username, {
            " ": "+"
        }))}&avatar=${ChocaBot.user.displayAvatarURL({size: 64})}&data=${base64DefaultJson}`;

        try {
            obj = JSON.parse(json);
        } catch {
            throw new BadCommandUsage(`Tu dois utiliser le site [https://s.nevylish.fr/embedbuilder](${builderurl}) pour construire ton message.`);
        }

        ButtonManager.askToConfirm({
            interaction: interaction,
            user: interaction.member.user,
            embed_title: "Broadcast",
            embed_color: Constants.Colors.WARNING,
            ask_message: `:warning: **Attention**, tu es sur le point d'envoyer un **message privé** à **tous** les membres du serveur !\n\nEs-tu **sûr** de vouloir **envoyer un message privé à tous les membres du serveur** ? Si la réponse est **non**, attends la **fin du timer**.`,
            deny_message: "Le message n'a pas été envoyé",
            button_emoji: "✅",
            button_label: "Confirmer ({timer})",
            button_style: MessageButtonStyles.SUCCESS,
            button_customId: "broadcast_confirm",
            timer: 30000,
            ephemeral: true,
        }).then(async (result) => {
            if (result) {
                let count = 0;

                members.filter(m => !m.user.bot).forEach(member => {
                    member.send({embeds: embeds}).then(count++); /* TODO: Add obj content */
                });

                await interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Broadcast")
                            .setDescription(`:white_check_mark: **${count} messages privés ont été envoyés**`)
                            .setColor(Constants.Colors.GREEN)
                            .setFooter({text: "Les membres dont les messages privés sont bloqués n'ont pas reçu le message mais sont quand même comptés dans la liste."})
                    ]
                });
            }
            if (previewMessage.deletable) previewMessage.delete();
        });

        let embeds: Array<MessageEmbed> = [];
        for (let i = 0; embeds.length < obj.embeds.length; i++) {
            embeds.push(new MessageEmbed(obj.embeds[i]));
        }

        const previewMessage = await interaction.channel.send({
            content: `<@${interaction.member.user.id}>, aperçu du message:\n────────────────────────────────────────────${obj.content ? `\n${obj.content}` : ""}`,
            embeds: embeds
        });
    }
}
