import { MessageEmbed } from 'discord.js';
import {ICommand} from 'WOKCommands';
import { active_games } from '../state';

const join : ICommand = {
    category: 'joining',
    description: '시작된 게임에 참가합니다. 시작된 게임이 존재하지 않거나 게임이 마감된 상태라면 사용할 수 없습니다.',
    slash: true,
    callback: ({interaction}) => {
        const currentGamePlayers = active_games.get(interaction.channelId)?.gameStatus.players;
        if (!currentGamePlayers)
            return `시작한 게임이 존재하지 않습니다.`;
        if (currentGamePlayers?.includes(interaction.user))
            return `${interaction.user.username}님은 이미 참가하셨습니다.` 
        const lengthOfCurrentGamePlayers = currentGamePlayers?.length;
        if (lengthOfCurrentGamePlayers >= 10)
            return `플레이어 수가 10명입니다. 더 이상 참여하실 수 없습니다.`;
        currentGamePlayers.push(interaction.user); 
        return `${interaction.user.username}님이 참가하셨습니다. 현재 플레이어 ${currentGamePlayers.length}명`;
    }
}

export default join;