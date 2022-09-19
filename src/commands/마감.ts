import { ICommand } from "WOKCommands";
import { readyGame } from "../ready_game";
import { active_games } from "../state";

const close: ICommand = {
  category: "joining",
  description:
    "참가를 마감하고 게임을 시작합니다. 마감되지 않은 게임이 없다면 사용할 수 없습니다.",
  slash: true,
  callback: ({ interaction }) => {
    const currentGamePlayers = active_games.get(interaction.channelId)
      ?.gameStatus.players;
    if (!currentGamePlayers) return `시작한 게임이 존재하지 않습니다.`;
    const lengthOfCurrentGamePlayers = currentGamePlayers?.length;
    if (lengthOfCurrentGamePlayers < 5)
      return `최소 5명의 플레이어가 있어야 게임을 진행할 수 있습니다. 현재 플레이어는 ${lengthOfCurrentGamePlayers}명입니다.`;
    readyGame(interaction.channelId);
  },
};

export default close;
