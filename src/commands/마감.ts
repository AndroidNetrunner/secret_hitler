
import { ICommand } from 'WOKCommands';
import { readyGame } from '../ready_game';
import { active_games } from '../state';

const close: ICommand = {
    category: 'joining',
    description: 'close joining',
    callback: ({ message }) => {
        const currentGamePlayers = active_games.get(message.channelId)?.players;
        if (!currentGamePlayers)
            return `시작한 게임이 존재하지 않습니다.`;
        const lengthOfCurrentGamePlayers = currentGamePlayers?.length;
        // if (lengthOfCurrentGamePlayers < 5)
        //     return `최소 5명의 플레이어가 있어야 게임을 진행할 수 있습니다. 현재 플레이어는 ${lengthOfCurrentGamePlayers}명입니다.`
        readyGame(message.channelId);
    }
}

export default close;