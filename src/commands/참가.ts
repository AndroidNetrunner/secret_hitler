import { MessageEmbed } from 'discord.js';
import {ICommand} from 'WOKCommands';
import { active_games } from '../state';

const join : ICommand = {
    category: 'joining',
    description: 'new player tries to join',
    callback: ({message}) => {
        const channelOfMessage = message.channel;
        const currentGamePlayers = active_games.get(message.channelId)?.players;
        if (!currentGamePlayers)
            return `시작한 게임이 존재하지 않습니다.`;
        if (currentGamePlayers?.includes(message.author))
            return `${message.author.username}님은 이미 참가하셨습니다.` 
        const lengthOfCurrentGamePlayers = currentGamePlayers?.length;
        if (lengthOfCurrentGamePlayers >= 10)
            return `플레이어 수가 10명입니다. 더 이상 참여하실 수 없습니다.`;
        currentGamePlayers.push(message.author); 
        return `${message.author.username}님이 참가하셨습니다. 현재 플레이어 ${currentGamePlayers.length}명`;
    }
}

export default join;