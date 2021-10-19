import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { fascistBoard } from "../board";
import { Game_room } from "../Game_room";
import { active_games } from "../state";

const track : ICommand = {
    category: 'playing',
    description: 'showing current track',
    callback: ({ message }) => {
        const currentGame = active_games.get(message.channelId);
        if (!currentGame || !currentGame.fascistBoard)
            return `현재 시작한 게임이 존재하지 않습니다.`;
        const embed = new MessageEmbed()
        .setTitle('현재 각 트랙의 현황은 다음과 같습니다.')
        .setFields([{
            name: '파시스트 트랙',
            value: getFascistTrack(currentGame)
        }, {
            name: '자유당 트랙',
            value: currentGame.enactedLiberalPolicy.toString()
        }])
        message.channel.send({
            embeds: [embed]
        })
    }
}

const getFascistTrack = (currentGame : Game_room) => {
    let value = "";
    const { enactedFascistPolicy } = currentGame;
    const board = fascistBoard[currentGame.players.length as 3 | 5 | 6 | 7 | 8 | 9 | 10];
    for (let index in board) {
        if (parseInt(index) < enactedFascistPolicy)
            value += `~~${board[index]}~~\n`;
        else
            value += `${board[index]}\n`;
    }
    return value;
}

export default track;