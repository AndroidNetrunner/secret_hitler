import { Message, MessageEmbed, TextBasedChannels, User } from "discord.js";
import { Emojis, Game_room } from "./Game_room";
import { startVote } from "./start_vote";
import { active_games } from "./state"

export const startRound = async (channelId: string) => {
    const currentGame = active_games.get(channelId) as Game_room;
    const president = currentGame.president as User;
    const mainChannel = currentGame.mainChannel;
    const electionTracker = currentGame.electionTracker;
    const description = getDescription(channelId, president);
    const value = getFieldValue(channelId);
    const embed = new MessageEmbed()
        .setTitle(`${electionTracker + 1}번째 대통령 후보가 수상 후보를 결정할 차례입니다.`)
        .setDescription(description)
        .setFields({
            name: `수상 후보로 지정하고 싶은 플레이어의 이모티콘을 눌러주세요.`,
            value,
        })
    const message = await mainChannel.send({
        embeds: [embed]
    })
    addReactions(message, channelId);
    const collector = message.createReactionCollector({
        filter: (reaction, user) => user.id === president.id, 
        max: 1,
    })

    collector.on('collect', (reaction, user) => {
        if (user.bot)
            return
        const currentGame = active_games.get(reaction.message.channelId);
        if (currentGame) {
            const chancellor = currentGame.emojis.get(reaction.emoji.toString());
            if (chancellor)
                currentGame.chancellor = chancellor;
            reaction.message.delete()
            startVote(reaction.message.channelId);
        }
    })
}

const getDescription = (channelId: string, president: User) => {
    const ineligibleNominees = getIneligibleNominees(channelId);
    const currentPresident = `현재 대통령: ${president}\n`;
    if (!ineligibleNominees)
        return currentPresident;
    return currentPresident + `수상 후보로 지목할 수 없는 플레이어: ${ineligibleNominees}`;
}

const getIneligibleNominees = (channelId: string) => {
    const termLimitedPresident = active_games.get(channelId)?.termLimitedPresident;
    const termLimitedChancellor = active_games.get(channelId)?.termLimitedChancellor;
    const numberOfPlayers = active_games.get(channelId)?.players.length as number;
    if (!(termLimitedPresident || termLimitedChancellor))
        return null;
    if (numberOfPlayers <= 5)
        return [termLimitedPresident];
    return [termLimitedPresident, termLimitedChancellor];
}

export const getFieldValue = (channelId: string) => {
    const emojis = active_games.get(channelId)?.emojis as Emojis;
    let fieldValue = "";
    for (let [key, value] of emojis) {
        if (!value)
            break;
        fieldValue += `${key}: ${value.username}\n`;
    }
    return fieldValue;
}

const addReactions = (message: Message, channelId: string) => {
    const emojis = active_games.get(channelId)?.emojis as Emojis;
    const ineligibleNominees = getIneligibleNominees(channelId);
    const president = active_games.get(channelId)?.president as User;
    for (let [emoji, player] of emojis) {
        if (!player)
            break;
        if (!(ineligibleNominees?.includes(player) || player === president))
            message.react(emoji);
    }
}