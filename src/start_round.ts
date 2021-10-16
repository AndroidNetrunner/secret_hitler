import { Message, MessageEmbed, User } from "discord.js";
import { emojis } from "./Game_room";
import { active_games } from "./state"

export const startRound = async (channelId : string) => {
    const president = active_games.get(channelId)?.president as User;
    const description = getDescription(channelId);
    const value = getFieldValue(channelId);
    const embed = new MessageEmbed()
    .setTitle('대통령 후보님, 이제 수상 후보를 결정하실 차례입니다.')
    .setDescription(description)
    .setFields({
        name: '수상 후보로 지정하고 싶은 플레이어의 이모티콘을 눌러주세요.',
        value, 
    })
    const message = await president.send({
        embeds: [embed] 
    })
    addReactions(message, channelId);
}

const getDescription = (channelId : string) => {
    const ineligibleNominees = getIneligibleNominees(channelId);
    if (!ineligibleNominees)
        return "";
    return `현재 수상 후보로 지목할 수 없는 플레이어: ${ineligibleNominees}`;
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

const getFieldValue = (channelId: string) => {
    const emojis = active_games.get(channelId)?.emojis as emojis;
    let fieldValue = "";
    for (let [key, value] of emojis) {
        if (!value)
            break;
        fieldValue += `${key}: ${value.username}\n`;
    }
    return fieldValue;
}

const addReactions = (message: Message, channelId : string) => {
    const emojis = active_games.get(channelId)?.emojis as emojis;
    const ineligibleNominees = getIneligibleNominees(channelId);
    const president = active_games.get(channelId)?.president as User;
    for (let [emoji, player] of emojis) {
        if (!player)
            break;
        if (!(ineligibleNominees?.includes(player) || player === president))
            message.react(emoji);
    }
}