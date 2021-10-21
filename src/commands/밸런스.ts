import { ICommand } from "wokcommands";
import { Game_room } from "../Game_room";
import { active_games } from '../state';

const balance : ICommand = {
    category: 'joining',
    description: 'toggle balance mode',
    callback: ({ message }) => {
        const currentGame = active_games.get(message.channelId) as Game_room;
        currentGame.balance = !(currentGame.balance)
        message.reply(`밸런스 모드가 ${currentGame.balance ? '켜짐' : '꺼짐'}으로 설정되었습니다.`);
    }
}

export default balance;