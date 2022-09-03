import { ICommand } from "wokcommands";
import { active_games } from "../state";

const order: ICommand = {
    category: 'playing',
    description: '대통령 후보가 이동하는 순서를 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.',
    slash: true,
    callback: ({ interaction }) => {
        const currentGame = active_games.get(interaction.channelId);
        if (!currentGame || !currentGame.fascistBoard)
            return `현재 시작한 게임이 존재하지 않습니다.`;
        let playerOrder = "";
        currentGame.gameStatus.players.forEach(player => playerOrder += `${player.username} ->`)
        playerOrder += currentGame.gameStatus.players[0].username;
            return playerOrder;
    }
}

export default order;