import { ICommand } from "wokcommands";
import { active_games } from '../state';

const mastermind : ICommand = {
    category: 'joining',
    description: '배후 확장을 추가합니다. 한 번 더 실행하면 설정을 취소합니다.',
    slash: true,
    callback: ({ interaction }) => {
        const currentGame = active_games.get(interaction.channelId);
        if (!currentGame)
            return `시작한 게임이 존재하지 않습니다.`;
        currentGame.mastermind = !(currentGame.mastermind)
        return `배후 직업이 ${currentGame.mastermind ? '추가' : '삭제'}되었습니다.`;
    }
}

export default mastermind;