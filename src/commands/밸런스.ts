import { ICommand } from "wokcommands";
import { active_games } from '../state';

const balance : ICommand = {
    category: 'joining',
    description: '인원 수에 따른 밸런스 패치 사항을 적용합니다. 한 번 더 실행하면 설정을 취소합니다.',
    slash: true,
    callback: ({ interaction }) => {
        const currentGame = active_games.get(interaction.channelId);
        if (!currentGame)
            return `시작한 게임이 존재하지 않습니다.`;
        currentGame.balance = !(currentGame.balance)
        return `밸런스 모드가 ${currentGame.balance ? '켜짐' : '꺼짐'}으로 설정되었습니다.`;
    }
}

export default balance;