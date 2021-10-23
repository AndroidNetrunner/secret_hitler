import { ICommand } from "wokcommands";
import { active_games } from '../state';
import { Game_room } from '../Game_room';
const mastermind : ICommand = {
    category: 'joining',
    description: 'toggle mastermind mode',
    callback: ({ message }) => {
        const currentGame = active_games.get(message.channelId);
        if (!currentGame) {
            return `시작한 게임이 존재하지 않습니다.`;
            return;
        }
        currentGame.mastermind = !(currentGame.mastermind)
        message.reply(`배후 직업이 ${currentGame.mastermind ? '추가' : '삭제'}되었습니다.`);
    }
}

export default mastermind;