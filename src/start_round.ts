import {
  Message,
  MessageActionRow,
  MessageButton,
  User,
  MessageEmbed,
} from "discord.js";
import { Game_room } from "./Game_room";
import { Game_status } from "./Game_status";
import { startVote } from "./start_vote";

export const startRound = async (currentGame: Game_room): Promise<void> => {
  const { gameStatus, mainChannel } = currentGame;
  const president = gameStatus.president as User;
  const { electionTracker, eligibleNominees } = gameStatus;
  const description = getDescription(gameStatus);
  const embed = new MessageEmbed()
    .setTitle(
      `${electionTracker + 1}번째 대통령 후보가 수상 후보를 결정할 차례입니다.`
    )
    .setDescription(description)
    .setFields({
      name: `수상 후보로 지정하고 싶은 플레이어를 선택해주세요.`,
      value: "아래 버튼을 눌러 수상 후보를 지정할 수 있습니다.",
    });
  const message = await mainChannel.send({
    embeds: [embed],
    components: gameStatus.getPlayerButtons((player) =>
      gameStatus.eligibleNominees.some((nominee) => nominee.id === player.id)
    ),
  });
  const collector = message.createMessageComponentCollector({
    filter: (interaction) => interaction.user.id === president.id,
    max: 1,
  });

  collector.on("collect", (interaction) => {
    const { gameStatus } = currentGame;
    gameStatus.chancellor = gameStatus.players.find(
      (player) => player.id === interaction.customId
    );
    message.delete();
    startVote(currentGame);
  });
};

const getDescription = (gameStatus: Game_status): string => {
  const { ineligibleNominees } = gameStatus;
  const currentPresident = `현재 대통령: ${gameStatus.president}\n`;
  return ineligibleNominees.length
    ? currentPresident +
        `수상 후보로 지목할 수 없는 플레이어: ${ineligibleNominees}`
    : currentPresident;
};
