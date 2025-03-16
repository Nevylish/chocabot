import Command from "../../../core/base/Command";
import ChocaBotClient from "../../../core/base/ChocaBotClient";
import {IGuildDBSchema} from "../../../core/database/schemas/Guild";
import {MessageEmbed, Permissions, TextChannel} from "discord.js";
import {IMemberDBSchema} from "../../../core/database/schemas/Member";
import {ApplicationCommandOptionTypes, MessageButtonStyles} from "discord.js/typings/enums";
import {IEmbedBuilderJson} from "./BroadcastCommand";
import {TextUtils} from "../../../utils/text";
import {ChocaBot} from "../../../index";
import BadCommandUsage from "../../../exception/BadCommandUsage";
import {ButtonManager} from "../../../utils/button";
import {Constants} from "../../../utils/constants";
import escapeMarkdown = TextUtils.escapeMarkdown;
import replaceAll = TextUtils.replaceAll;

export default class EmbedCreatorCommand extends Command {
    constructor(client: ChocaBotClient) {
        super(client, {
            name: "embed",
            description: "Create an embed",
            options: [
                {
                    name: "channel",
                    description: "channel",
                    required: true,
                    type: ApplicationCommandOptionTypes.CHANNEL
                },
                {
                    name: "json",
                    description: "json",
                    required: true,
                    type: ApplicationCommandOptionTypes.STRING
                },
            ],
            slashCommand: true,
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR],
            clientPermissions: [Permissions.FLAGS.ADMINISTRATOR],
        });
    }

    async onExecute(interaction, db: { guild: IGuildDBSchema; member: IMemberDBSchema }) {
        const json = interaction.options.getString("json"),
            channel = interaction.options.getChannel("channel") as TextChannel;

        let obj: IEmbedBuilderJson;

        const builderurl = `https://nevylish.fr/tools/discord/embedbuilder?username=${escapeMarkdown(replaceAll(ChocaBot.user.username, {
            " ": "+"
        }))}&avatar=${ChocaBot.user.displayAvatarURL({size: 64})}`;

        try {
            obj = JSON.parse(json);
        } catch {
            throw new BadCommandUsage(`Tu dois utiliser le site [https://s.nevylish.fr/embedbuilder](${builderurl}) pour construire ton message.`)
        }

        ButtonManager.askToConfirm({
            interaction: interaction,
            ask_message: "",
            button_customId: "embedcreator_confirm",
            button_emoji: "✅",
            button_label: "Envoyer ({timer})",
            button_style: MessageButtonStyles.SUCCESS,
            deny_message: "Le message n'a pas été envoyé",
            embed_color: Constants.Colors.WARNING,
            embed_title: "Envoyer un embed dans un salon",
            ephemeral: true,
            timer: 300000,
            user: interaction.member.user
        }).then(result => {
            if (result) {
                ChocaBot.chocaland.channels.fetch().then(channels => {
                    (channels.get(channel.id) as TextChannel).send({
                        embeds: embeds /* TODO: Add obj content */
                    }).then(() => {
                        interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Envoyer un embed dans un salon")
                                    .setDescription(":white_check_mark: Le message a bien été envoyé !")
                                    .setColor(Constants.Colors.GREEN)
                            ]
                        });
                    });
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
