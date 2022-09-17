import { MessageEmbed, User } from 'discord.js';
import { Role } from './board';
import { Game_room } from './Game_room';
import { active_games } from './state';

const endGame = (currentGame: Game_room, description: string) : void => {
    const embed = new MessageEmbed()
    .setTitle('게임이 모두 종료되었습니다!')
    .setDescription(description)
    .setFields({
        name: '각 플레이어의 직업은 다음과 같습니다.',
        value: getRoles(currentGame.roles),
    });
    currentGame.mainChannel.send({
        embeds: [embed],
    })
    active_games.delete(currentGame.mainChannel.id);
}

export const getRoles = (roles: Map<User, Role>) : string => {
    let value: string = "";
    roles.forEach((role, user) => value += `${user}: ${role}\n`);
    return value;
}

export default endGame;