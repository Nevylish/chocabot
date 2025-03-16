import ChocaBotClient from "../core/base/ChocaBotClient";
import {CommandInteraction, Interaction} from "discord.js";
import {Handlers} from "../core/base/Handlers";

export = async (client: ChocaBotClient, interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) await Handlers.interactionCommandHandler(interaction as CommandInteraction);
};