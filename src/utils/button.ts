import {ColorResolvable, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, User} from "discord.js";
import {MessageButtonStyles, MessageComponentTypes} from "discord.js/typings/enums";
import {TextUtils} from "./text";
import {Functions} from "./functions";
import {TimeUtils} from "./time";

export module ButtonManager {
    import escapeMarkdown = TextUtils.escapeMarkdown;
    import disableButtons = Functions.disableButtons;
    import msToFormattedString = TimeUtils.msToFormattedString;

    interface IaskToConfirmOptions {
        interaction: CommandInteraction,
        user: User,
        embed_title: string,
        embed_color: ColorResolvable,
        ask_message: string,
        deny_message: string,
        button_emoji?: string,
        button_label: string,
        button_style: MessageButtonStyles
        button_customId: string,
        timer: number,
        ephemeral: boolean
    }

    export const askToConfirm = async (options: IaskToConfirmOptions) => {
        return new Promise(async (res) => {
            let accepted = false;

            await options.interaction.deferReply({ephemeral: options.ephemeral});

            const embed = new MessageEmbed()
                .setTitle(options.embed_title)
                .setColor(options.embed_color)
                .setDescription(options.ask_message.replace("{user}", escapeMarkdown(options.user.username)))

            const button = new MessageButton().setLabel(options.button_label.replace("{timer}", msToFormattedString(options.timer))).setStyle(options.button_style).setCustomId(options.button_customId);

            if (options.button_emoji) button.setEmoji(options.button_emoji);

            const msg = await options.interaction.editReply({
                embeds: [embed],
                components: [new MessageActionRow().addComponents(button)]
            });

            const startedCollectorTimestamp = Date.now() + 1000;

            const refreshInterval = setInterval(() => {
                if (msg.components.length === 0) return clearInterval(refreshInterval);
                button.setLabel(options.button_label.replace("{timer}", msToFormattedString(startedCollectorTimestamp + options.timer - Date.now())));
                options.interaction.editReply({components: [new MessageActionRow().addComponents(button)]});
            }, 1000);

            // @ts-ignore
            const collector = msg.createMessageComponentCollector({
                componentType: MessageComponentTypes.BUTTON,
                filter: i => [options.user.id].includes(i.user.id),
                time: options.timer
            });

            collector.on("collect", async (i) => {
                i.deferUpdate();

                if (i.customId !== options.button_customId) return;
                if (i.user.id !== options.user.id) return;

                await options.interaction.editReply({
                    components: disableButtons(msg.components)
                });

                accepted = true;
                collector.stop();
            });

            collector.on("end", async () => {
                if (accepted === false) {
                    clearInterval(refreshInterval);

                    const embed = new MessageEmbed()
                        .setTitle(options.embed_title)
                        .setColor(options.embed_color)
                        .setDescription(options.deny_message.replace("{user}", escapeMarkdown(options.user.username)))

                    await options.interaction.editReply({
                        embeds: [embed],
                        components: disableButtons(msg.components)
                    });
                    return res(false);
                } else {
                    clearInterval(refreshInterval);
                    return res(true);
                }
            });
        });
    }
}
