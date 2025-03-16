import * as fs from "fs";
import {glob} from "glob";
import {promisify} from "util";
import Command from "./Command";
import {CommandInteraction, GuildMember, MessageEmbed} from "discord.js";
import {TimeUtils} from "../../utils/time";
import {ChocaBot} from "../../index";
import {Constants} from "../../utils/constants";
import {Logger} from "../../utils/logger";
import {GuildManager} from "../database/schemas/GuildManager";
import {MemberManager} from "../database/schemas/MemberManager";
import {CustomCommandManager} from "../../modules/base/CustomCommand/manager";
import {TextUtils} from "../../utils/text";

export module Handlers {

    import msToFormattedString = TimeUtils.msToFormattedString;
    import success = Logger.success;
    import error = Logger.error;
    import findOrCreateGuild = GuildManager.findOrCreateGuild;
    import findOrCreateMember = MemberManager.findOrCreateMember;
    import replaceAll = TextUtils.replaceAll;

    export const loadEventsListeners = () => {

        const files = fs.readdirSync(`${process.cwd()}/events`),
            eventsFiles = files.filter(f => f.split(".").pop() === "js");

        for (const file of eventsFiles) {
            const event = require(`${process.cwd()}/events/${file}`),
                eventName = file.split(".")[0];
            success("Handlers", "(loadEventsListeners)", `\x1b[32m${eventName}\x1b[0m event created`);
            ChocaBot.on(eventName, event.bind(null, ChocaBot));
            delete require.cache[require.resolve(`${process.cwd()}/events/${file}`)];
        }
    }

    export const loadCommands = async () => {
        const globAsync = promisify(glob),
            files = await globAsync(`${process.cwd()}/commands/**/*.js`);

        files.map(value => {
            const command: Command = new (require(value).default)(ChocaBot),
                spitted = value.split("/"),
                dir = spitted[spitted.length - 2];

            if (command.info.name) {
                //if (ChocaBot.commands.has(command.info.name)) throw new Error(`Handlers (loadCommands) \x1b[31m${dir}/${command.info.name}\x1b[0m command name already exists`);
                ChocaBot.commands.set(command.info.name, command);
                success("Handlers", "(loadCommands)", `\x1b[32m${dir}/${command.info.name}\x1b[0m command loaded`);
            }
        })

        let commands = [];

        ChocaBot.commands.forEach(value => {
            if (value.info.slashCommand && value.info.slashCommand === true) return commands.push(value.info);
        })

        if (process.env.ENVIRONMENT === "production")
            ChocaBot.application.commands.set(commands).then(r => success("Handlers", "(loadCommands)", `Slash commands registered for all guilds. (${r.size} commands)`));
        else
            ChocaBot.guilds.cache.get("822720523234181150").commands.set(commands).then(r => success("Handlers", "(loadCommands)", `Slash commands registered for *dev* guild. (${r.size} commands)`));

        commands = null;
    }

    export const interactionCommandHandler = async (interaction: CommandInteraction) => {
        const {user, commandName} = interaction,
            member = interaction.member as GuildMember;

        const cmd = ChocaBot.commands.get(commandName);

        if (!cmd || cmd.info.slashCommand !== true) return interaction.reply({
            embeds: [new MessageEmbed()
                .setColor(Constants.Colors.ERROR)
                .setDescription(Constants.ErrorMessages.UNKNOWN_COMMAND)
            ], ephemeral: true
        });

        if (!interaction.guild) return interaction.reply({
            embeds: [new MessageEmbed()
                .setDescription("Désolé, il n'est pas possible d'utiliser les commandes slash en message privé pour le moment.")
                .setColor(Constants.Colors.ERROR)
            ], ephemeral: true
        });

        if (interaction.guild && !interaction.member)
            await interaction.guild.members.fetch(interaction.member.user.id);

        if (interaction.guild && cmd.info.memberPermissions && !member.permissions.has(cmd.info.memberPermissions)) return interaction.reply({
            embeds: [new MessageEmbed()
                .setColor(Constants.Colors.ERROR)
                .setDescription(Constants.ErrorMessages.PERMISSION_MISSING.replace("{permission}", cmd.info.memberPermissions.join(', ')))],
            ephemeral: true
        });

        if (interaction.guild && cmd.info.clientPermissions && !ChocaBot.guilds.cache.get(interaction.guild.id).me.permissions.has(cmd.info.clientPermissions)) return interaction.reply({
            embeds: [new MessageEmbed()
                .setColor(Constants.Colors.ERROR)
                .setDescription(Constants.ErrorMessages.PERMISSION_MISSING.replace("{permission}", cmd.info.clientPermissions.join(', ')))],
            ephemeral: true
        });

        if (!cmd.hasCooldown(member)) {
            if (cmd.info.cooldown) cmd.cooldowns.set(user.id, Date.now() + cmd.info.cooldown * 1000);

            const db = {
                member: await findOrCreateMember(interaction.member.user.id),
                guild: await findOrCreateGuild(interaction.guild.id)
            };

            await cmd.onExecute(interaction, db)?.catch(err => {
                    const embed = new MessageEmbed().setColor(Constants.Colors.ERROR).setDescription(`${err.message}`);
                    interaction.reply({embeds: [embed], ephemeral: true});
                    error("Handlers", "(onExecute (interaction))", err, {
                        userId: user.id,
                        userTag: user.tag,
                        command: commandName
                    });
                    if (cmd.info.cooldown) cmd.cooldowns.delete(interaction.member.user.id);
                }
            )
        } else {
            const remaining = cmd.cooldowns.get(user.id) - Date.now();
            const embed = new MessageEmbed()
                .setDescription(replaceAll(Constants.ErrorMessages.COOLDOWN, {
                    "{time_remaining}": msToFormattedString(remaining),
                    "{command_name}": cmd.info.name
                }))
                .setColor(Constants.Colors.ERROR)
            await interaction.reply({embeds: [embed], ephemeral: true});
        }
    }

    const customMessageCommandHandler = (interaction, name) => {
        if (!interaction.guild) return;
        const cmd = CustomCommandManager.collection.get(name);

        if (!cmd) return;

        interaction.reply({content: `${cmd.content}`});
    }

    export const messageCommandHandler = async (interaction: any) => {

        if (interaction.guild && !interaction.member)
            await interaction.guild.members.fetch(interaction.author.id);

        let db: any = {
            guild: interaction.guild ? await findOrCreateGuild(interaction.guild.id) : null,
        };

        const prefix = interaction.guild ? db.guild.prefix : "!";

        if (!interaction.content.startsWith(prefix)) return;

        const args = interaction.content.slice(prefix.length).split(/ +/),
            cmd = ChocaBot.commands.get(args.shift().toLowerCase());

        if (!cmd || cmd.info.messageCommand !== true)
            return customMessageCommandHandler(interaction, interaction.content.slice(prefix.length).split(/ +/).shift().toLowerCase());

        if (interaction.guild && cmd.info.memberPermissions && !interaction.author.permissions.has(cmd.info.memberPermissions)) return interaction.reply({
            embeds: [new MessageEmbed()
                .setColor(Constants.Colors.ERROR)
                .setDescription(Constants.ErrorMessages.PERMISSION_MISSING.replace("{permission}", cmd.info.memberPermissions.join(', ')))],
            ephemeral: true
        });

        if (interaction.guild && cmd.info.clientPermissions && ChocaBot.guilds.cache.get(interaction.guild.id).me.permissions.has(cmd.info.clientPermissions)) return interaction.reply({
            embeds: [new MessageEmbed()
                .setColor(Constants.Colors.ERROR)
                .setDescription(Constants.ErrorMessages.PERMISSION_MISSING.replace("{permission}", cmd.info.clientPermissions.join(', ')))],
            ephemeral: true
        });

        if (!cmd.hasCooldown(interaction.member as GuildMember)) {
            if (cmd.info.cooldown)
                cmd.cooldowns.set(interaction.author.id, Date.now() + cmd.info.cooldown * 1000);

            db = {
                ...db,
                member: interaction.guild ? await findOrCreateMember(interaction.author.id) : null
            };

            await cmd.onExecute(interaction, db, args)?.catch(e => {
                const embed = new MessageEmbed().setColor(Constants.Colors.ERROR).setDescription(`${e.message}`);
                interaction.reply({embeds: [embed]});
                error("Handlers", "(onExecute (message))", e.message, {
                    userId: interaction.author.id,
                    userTag: interaction.author.tag,
                    command: cmd.info.name
                });
                if (cmd.info.cooldown) cmd.cooldowns.delete(interaction.author.id);
            });
        } else {
            const remaining = cmd.cooldowns.get(interaction.author.id) - Date.now();
            const embed = new MessageEmbed()
                .setDescription(replaceAll(Constants.ErrorMessages.COOLDOWN, {
                    "{time_remaining}": msToFormattedString(remaining),
                    "{command_name}": cmd.info.name
                }))
                .setColor(Constants.Colors.ERROR)
            interaction.reply({embeds: [embed]});
        }
    }
}
