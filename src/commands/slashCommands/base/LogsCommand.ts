import Command from "../../../core/base/Command";
import ChocaBotClient from "../../../core/base/ChocaBotClient";
import {CommandInteraction, MessageEmbed, Permissions, User} from "discord.js";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {IGuildDBSchema} from "../../../core/database/schemas/Guild";
import {IMemberDBSchema} from "../../../core/database/schemas/Member";
import * as _ from "lodash";
import {pagination} from "../../../utils/pagination";
import BadCommandUsage from "../../../exception/BadCommandUsage";
import {Constants} from "../../../utils/constants";
import {MemberManager} from "../../../core/database/schemas/MemberManager";
import Colors = Constants.Colors;
import findOrCreateMember = MemberManager.findOrCreateMember;

export default class LogsCommand extends Command {
    constructor(client: ChocaBotClient) {
        super(client, {
            name: "logs",
            description: "logs",
            slashCommand: true,
            memberPermissions: [Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.MANAGE_GUILD, Permissions.FLAGS.BAN_MEMBERS],
            options: [
                {
                    name: 'username',
                    description: 'Récuperer les pseudos utilisés d\'un membre',
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: 'user',
                            description: 'Utilisateur',
                            type: ApplicationCommandOptionTypes.USER,
                            required: true,
                        },
                        /*{
                            name: 'croissant',
                            description: 'Ordre d\'affichage',
                            type: ApplicationCommandOptionTypes.BOOLEAN,
                            required: true,
                        },*/
                    ],
                },
            ]
        });

    }

    async onExecute(interaction: CommandInteraction, db: { guild: IGuildDBSchema, member: IMemberDBSchema }) {
        const command = interaction.options.getSubcommand();

        const user = interaction.options.getUser("user")/*,
            descending = !interaction.options.getBoolean("croissant");*/

        switch (command) {
            case "username": {
                await this.usernameCommand(interaction, user);
                break;
            }
            default:
                break;
        }
    }

    usernameCommand = async (interaction: CommandInteraction, user: User) => {
        let userdata = await findOrCreateMember(user.id);
        if (userdata.logs.usernames.length < 1) throw new BadCommandUsage(`${user.tag} n'a pas changé de pseudo depuis qu'il est sur ce serveur.`)

        let usernames = [];

        for (let {username} of userdata.logs.usernames) {
            usernames.push(`• ${username}`);
        }

        console.log(userdata.logs.usernames.length)

        usernames = _.chunk(usernames, 10);

        const pages = usernames.map(usernames => new MessageEmbed()
            .setAuthor({name: `Liste des pseudos utilisés - ${user.tag}`, iconURL: user.displayAvatarURL({size: 64})})
            .setDescription(`${usernames.join("\n")}`)
            .setColor(Colors.DEFAULT)
        );

        await pagination(interaction, pages);
    }
}
