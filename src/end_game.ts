import { MessageEmbed, User } from 'discord.js';
import { Role } from './board';
import { Game_room } from './Game_room';
import { active_games } from './state';

export const completeFascistTrack = (currentGame : Game_room) => {
    const description = "파시스트 법안 트랙 완성으로 인한 파시스트당 승리";
    endGame(currentGame, description);
}

export const completeLiberalTrack = (currentGame : Game_room) => {
    const description = `자유당 법안 트랙 완성으로 인한 자유당 승리`;
    endGame(currentGame, description);
}

export const executeHitler = (currentGame : Game_room) => {
    const description = `히틀러 처형으로 인한 자유당 승리`;
    endGame(currentGame, description);
}

export const electHitlerByChancellor = (currentGame : Game_room) => {
    const description = `히틀러의 수상 당선으로 인한 파시스트당 승리`;
    endGame(currentGame, description);
}

export const makeSuddenDeathByMastermind = (currentGame: Game_room) => {
    const description = `4번째 자유당 법안 제정 후 5번째 파시스트 법안 제정으로 인한 배후 승리`;
    endGame(currentGame, description);
}

export const enactFourthLiberalPolicyByMastermind = (currentGame: Game_room) => {
    const description = `5번째 파시스트 법안 제정 후 수상으로서 4번째 자유당 법안 제정으로 인한 배후 승리`;
    endGame(currentGame, description);
}

const endGame = (currentGame: Game_room, description: string) => {
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

export const getRoles = (roles: Map<User, Role>) => {
    let value: string = "";
    roles.forEach((role, user) => value += `${user}: ${role}\n`);
    return value;
}