import { Message, MessageEmbed, User } from "discord.js";
import { Emojis, Game_room } from "./Game_room";
import { Game_status } from "./Game_status";
import { startVote } from "./start_vote";

export const startRound = async (currentGame: Game_room) : Promise<void> => {
    const { gameStatus } = currentGame;
    const president = gameStatus.president as User;
    const mainChannel = currentGame.mainChannel;
    const electionTracker = gameStatus.electionTracker;
    const description = getDescription(gameStatus);
    const value = getFieldValue(currentGame);
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
    addReactions(message, currentGame);
    const collector = message.createReactionCollector({
        filter: (reaction, user) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president.id), 
        max: 1,
    })

    collector.on('collect', (reaction, user) => {
        if (user.bot)
            return
        const { gameStatus } = currentGame;
        gameStatus.chancellor = currentGame.emojis.get(reaction.emoji.toString()) as User;
        reaction.message.delete()
        startVote(currentGame);
    })
}

const getDescription = (gameStatus: Game_status) : string => {
    const ineligibleNominees = getIneligibleNominees(gameStatus);
    const currentPresident = `현재 대통령: ${gameStatus.president}\n`;
    return ineligibleNominees.length ? currentPresident + `수상 후보로 지목할 수 없는 플레이어: ${ineligibleNominees}` : currentPresident;
}

const getIneligibleNominees = (gameStatus: Game_status) : User[] => {
    const { termLimitedPresident, termLimitedChancellor } = gameStatus;
    const numberOfPlayers = gameStatus.players.length;
    if (!(termLimitedPresident || termLimitedChancellor))
        return [];
    if (numberOfPlayers <= 5)
        return [termLimitedPresident] as User[];
    return [termLimitedPresident, termLimitedChancellor] as User[];
}

export const getFieldValue = (currentGame: Game_room) : string => {
    const { emojis } = currentGame;
    let fieldValue = "";
    for (let [key, value] of emojis) {
        if (!value)
            break;
        fieldValue += `${key}: ${value}\n`;
    }
    return fieldValue;
}

const addReactions = (message: Message, currentGame: Game_room) : void => {
    const { gameStatus } = currentGame;
    const emojis = currentGame.emojis as Emojis;
    const ineligibleNominees = getIneligibleNominees(gameStatus);
    const president = gameStatus.president as User;
    for (let [emoji, player] of emojis) {
        if (!player)
            break;
        if (!(ineligibleNominees?.includes(player) || player === president))
            message.react(emoji);
    }
}