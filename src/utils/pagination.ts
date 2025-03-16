import {Logger} from "./logger";
import error = Logger.error;

export const pagination = async (interaction: any, pages: any, timeout: number = 15 * 60000, emojiList: string[] = ['⬅', '➡'], onlyAuthorCanReact: boolean = true, endPage: any = undefined) => {
    if (!interaction && !interaction.channel) {
        return error("Pagination", "Interaction required");
    } else if (!pages) {
        return error("Pagination", "Need more pages");
    } else if (emojiList.length !== 2) {
        emojiList = ['⬅', '➡'];
    }

    let page = 0;
    const currentPage = await interaction.reply({
        embeds: [pages[page].setFooter({text: `Page ${page + 1} / ${pages.length}`})],
        fetchReply: true
    });

    if (pages.length > 1) {
        await currentPage.react(emojiList[0])
        await currentPage.react(emojiList[1])

        const reactionCollector = currentPage.createReactionCollector({time: timeout});

        reactionCollector.on('collect', (reaction, user) => {
            if (user.id !== interaction.client.user.id)
                reaction.users.remove(user);

            if (user.bot || onlyAuthorCanReact && user.id !== interaction.user.id) return;

            switch (reaction.emoji.name) {
                case emojiList[0]: {
                    page = page > 0 ? --page : pages.length - 1;
                    currentPage.edit({embeds: [pages[page].setFooter({text: `Page ${page + 1} / ${pages.length}`})]});
                    break;
                }
                case emojiList[1]: {
                    page = page + 1 < pages.length ? ++page : 0;
                    currentPage.edit({embeds: [pages[page].setFooter({text: `Page ${page + 1} / ${pages.length}`})]});
                    break;
                }
                default:
                    break;
            }
        });

        reactionCollector.on('end', () => {
            if (currentPage.reactions.message.deleted) return;

            if (endPage) {
                currentPage.edit({embeds: [endPage]});
            } else {
                currentPage.edit({embeds: [pages[page].setFooter(``)]});
            }
            currentPage.reactions.removeAll();

        });
    }
    return currentPage;
};