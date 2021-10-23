import { ICommand } from "wokcommands";
import { Game_room } from "../Game_room";
import { active_games } from '../state';

const balance : ICommand = {
    category: 'joining',
    description: 'toggle balance mode',
    callback: ({ message }) => {
        const currentGame = active_games.get(message.channelId);
        if (!currentGame)
            return `시작한 게임이 존재하지 않습니다.`;
        currentGame.balance = !(currentGame.balance)
        return `밸런스 모드가 ${currentGame.balance ? '켜짐' : '꺼짐'}으로 설정되었습니다.`;
    }
}

export default balance;