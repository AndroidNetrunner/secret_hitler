import { ICommand } from "wokcommands";
import { active_games } from "../state";

const order: ICommand = {
    category: 'playing',
    description: 'showing player order',
    callback: ({ message }) => {
        const currentGame = active_games.get(message.channelId);
        if (!currentGame || !currentGame.fascistBoard)
            return `현재 시작한 게임이 존재하지 않습니다.`;
        let playerOrder = "";
        currentGame.gameStatus.players.forEach(player => playerOrder += `${player.username} ->`)
        playerOrder += currentGame.gameStatus.players[0].username;
            return playerOrder;
    }
}

export default order;