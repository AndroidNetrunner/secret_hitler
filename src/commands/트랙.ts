import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { fascistBoard } from "../board";
import { Game_status } from "../Game_status";
import { active_games } from "../state";

const track: ICommand = {
  category: "playing",
  description: "showing current track",
  callback: ({ message }) => {
    const currentGame = active_games.get(message.channelId);
    if (!currentGame || !currentGame.fascistBoard || !currentGame.gameStatus)
      return `현재 시작한 게임이 존재하지 않습니다.`;
    return new MessageEmbed()
      .setTitle("현재 각 트랙의 현황은 다음과 같습니다.")
      .setFields([
        {
          name: "파시스트 트랙",
          value:
            getFascistTrack(currentGame.gameStatus) ||
            "출력 오류. 명령을 다시 시도해주세요.",
        },
        {
          name: "자유당 트랙",
          value:
            currentGame.gameStatus.enactedLiberalPolicy.toString() ||
            "출력 오류. 명령을 다시 시도해주세요.",
        },
      ]);
  },
};

const getFascistTrack = (gameStatus: Game_status): string => {
  let value = "";
  const { enactedFascistPolicy } = gameStatus;
  const board =
    fascistBoard[gameStatus.players.length as 3 | 5 | 6 | 7 | 8 | 9 | 10];
  for (let index in board) {
    if (parseInt(index) < enactedFascistPolicy)
      value += `~~${board[index]}~~\n`;
    else value += `${board[index]}\n`;
  }
  return value;
};

export default track;
