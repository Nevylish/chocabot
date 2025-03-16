import {MessageEmbed, TextChannel} from "discord.js";
import {ChocaBot} from "../../index";
import * as moment from "moment";
import {Constants} from "../../utils/constants";

export module VoiceLogManager {

    let cache: Array<IVoiceLogCache> = ChocaBot.cache;

    interface IVoiceLogCache {
        voiceLog: {
            userId: string,
            userName: string,
            channelName: string,
            messageId: string,
            timestamp: Date,
            channelsList: [{
                channelName: string,
                timestamp: Date
            }],
        }
    }

    export const onVoiceStateUpdate = async (_old, _new) => {
        if (!ChocaBot._channels.logs.voice) return;
        let channel = (ChocaBot.chocaland.channels.cache.get(ChocaBot._channels.logs.voice) as TextChannel);

        // USER JOIN CHANNEL
        if (!_old.channel && _new.channel) {
            const voiceJoinEmbed = new MessageEmbed()
                .setAuthor({
                    name: `Connexion dans un salon vocal - ${_new.member.user.tag}`,
                    iconURL: _new.member.user.avatarURL()
                })
                .setDescription(`<@${_new.member.user.id}> s'est connecté(e) dans un salon vocal\n\n` +
                    `\`\`\`diff\n+ #${_new.channel.name}\`\`\``)
                .setColor(Constants.Colors.GREEN)
                .setTimestamp()
                .setFooter({text: `Identifiant de l'utilisateur: ${_new.id}`})

            let message = await channel.send({embeds: [voiceJoinEmbed]});

            cache.push({
                voiceLog: {
                    userId: _new.member.user.id,
                    userName: _new.member.user.username,
                    channelName: _new.channel.name,
                    messageId: message.id,
                    timestamp: new Date(),
                    channelsList: [{
                        channelName: _new.channel.name,
                        timestamp: new Date()
                    }],
                }
            });
        }

        // USER LEAVE CHANNEL
        if (_old.channel && !_new.channel) {
            cache.forEach((item, index, object) => {
                let data = item.voiceLog;
                if (data.userId === _new.member.user.id) {
                    const voiceLeftEmbed = new MessageEmbed()
                        .setAuthor({
                            name: `Déconnexion d'un salon vocal - ${_old.member.user.tag}`,
                            iconURL: _old.member.user.avatarURL()
                        })
                        .setDescription(`<@${data.userId}> s'est déconnecté(e) d'un salon vocal\n\n` +
                            `Avait rejoint le ${data.channelsList.length > 1 ? `premier` : ''} salon ${moment(data.timestamp).format("[le**] LL [**à**] LTS")}** et a quitté le ${data.channelsList.length > 1 ? `dernier` : ''} salon ${moment(new Date()).format("[le**] LL [**à**] LTS")}**\n\n` +
                            `Temps total en vocal: ${moment(data.timestamp).toNow(true)}` +
                            `\`\`\`diff\n- #${_old.channel.name}\`\`\`\n` +
                            `${data.channelsList.length > 1 ? `Liste des salons rejoins (**${data.channelsList.length}**):` : ''}`)
                        .setColor(Constants.Colors.RED)
                        .setTimestamp()
                        .setFooter({text: `Identifiant de l'utilisateur: ${_old.id}`})
                    if (data.channelsList.length > 1) {
                        for (let channel of data.channelsList) {
                            voiceLeftEmbed.addFields({
                                name: `• ${channel.channelName}`,
                                value: `${moment(channel.timestamp).format("[le**] LL [**à**] LTS")}**`,
                            })
                        }
                    }

                    channel.messages.fetch({around: data.messageId, limit: 1})
                        .then(msg => {
                            const fetchedMsg = msg.first();
                            fetchedMsg.edit({embeds: [voiceLeftEmbed]});
                        });
                    object.splice(index, 1);
                }
            });
        }

        // USER CHANGE CHANNEL
        if (_old.channel && _new.channel && _old.channelId !== _new.channelId) {
            cache.forEach((item) => {
                let data = item.voiceLog;
                if (data.userId === _new.member.user.id) {

                    const voiceChangeEmbed = new MessageEmbed()
                        .setAuthor({
                            name: `Changement de salon vocal - ${_new.member.user.tag}`,
                            iconURL: _new.member.user.avatarURL()
                        })
                        .setDescription(`<@${_new.member.user.id}> a changé(e) de salon vocal\n\n` +
                            `\`\`\`diff\n- #${_old.channel.name}\`\`\`\`\`\`diff\n+ #${_new.channel.name}\`\`\`\n` +
                            `Liste des salons rejoins auparavant (**${data.channelsList.length}**): `)
                        .setColor(Constants.Colors.YELLOW)
                        .setTimestamp()
                        .setFooter({text: `Identifiant de l'utilisateur: ${_new.id}`})

                    for (let channel of data.channelsList) {
                        voiceChangeEmbed.addFields({
                            name: `• ${channel.channelName}`,
                            value: `${moment(channel.timestamp).format("[le**] LL [**à**] LTS")}**`
                        });
                    }

                    data.channelsList.push({
                        channelName: _new.channel.name,
                        timestamp: new Date()
                    });

                    channel.messages.fetch({around: data.messageId, limit: 1}).then(async msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit({embeds: [voiceChangeEmbed]});
                    });
                }
            })
        }
    }

}
