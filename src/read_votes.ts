import { Mutex } from "async-mutex";
import { MessageEmbed, User } from "discord.js";
import { Game_room } from "./Game_room";
import { startLegislativeSession } from "./legislativeSession";
import { prepareNextRound, shufflePolicyDeck } from './executiveAction';
import { FASCIST, HITLER, Policy } from "./board";
import endGame from './end_game';
import { revealsMastermind } from "./executiveAction";
import { Game_status } from "./Game_status";

export const readVotes = async (currentGame: Game_room): Promise<void> => {
    const { gameStatus } = currentGame;
    const voteLock = new Mutex();
    const release = await voteLock.acquire();
    const agree = gameStatus.agree;
    const disagree = gameStatus.disagree;
    if (agree.length + disagree.length < gameStatus.players.length)
        return;
    const isElected = revealVotes(currentGame);
    gameStatus.agree = [];
    gameStatus.disagree = [];
    if (isElected)
        return electHitlerAfterThreeFacistPolicies(currentGame) ? endGame(currentGame, '히틀러의 수상 당선으로 인한 파시스트당 승리') : startLegislativeSession(currentGame);
    gameStatus.electionTracker += 1;
    if (gameStatus.electionTracker === 3)
        enactTopPolicy(currentGame);
    if (gameStatus.specialElection) {
        gameStatus.specialElection = false;
        gameStatus.president = gameStatus.termLimitedPresident;
    }
    prepareNextRound(currentGame);
    release();
}

const electHitlerAfterThreeFacistPolicies = (currentGame: Game_room): boolean =>
    currentGame.gameStatus.enactedFascistPolicy >= 3 && currentGame.roles.get(currentGame.gameStatus.chancellor as User) === HITLER

const revealVotes = (currentGame: Game_room): boolean => {
    const { gameStatus } = currentGame;
    const agree = gameStatus.agree;
    const disagree = gameStatus.disagree;
    const electionTracker = gameStatus.electionTracker;
    const result = gameStatus.agree.length > gameStatus.disagree.length ? `가결` : `부결`;
    const embed = new MessageEmbed()
        .setTitle(`${electionTracker + 1}번째 선거 결과는 다음과 같습니다.`)
        .setDescription(
            `대통령 후보: ${gameStatus.president}, 수상 후보: ${gameStatus.chancellor}`
        )
        .setFields({
            name: `개표 결과, 이번 정부는 ${result}되었습니다.`,
            value: `찬성: ${agree}\n
        반대: ${disagree}`
        })
    currentGame.mainChannel.send({
        embeds: [embed]
    });
    return (result === '가결')
}

export const changePresident = (gameStatus: Game_status): User => {
    const { players, president } = gameStatus;
    const presidentIndex = players.indexOf(president as User);
    gameStatus.president = players[(presidentIndex + 1) % players.length];
    return gameStatus.president;
}

export const enactTopPolicy = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    const newPolicy: Policy = gameStatus.policyDeck.pop() as Policy;
    gameStatus.electionTracker = 0;
    if (newPolicy === FASCIST)
        enactTopFacistPolicy(currentGame);
    else
        enactTopLiberalPolicy(currentGame);
    if (gameStatus.policyDeck.length < 3)
        shufflePolicyDeck(currentGame);
    prepareNextRound(currentGame);
}

const enactTopFacistPolicy = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    const embed = new MessageEmbed()
        .setTitle('정부가 3연속 구성되지 않아 민중이 분노해 법안을 강제로 제정합니다!')
        .setDescription('제정된 법안은 파시스트당 법안이었습니다.')
        .setColor('RED');
    currentGame.mainChannel.send({ embeds: [embed] });
    gameStatus.enactedFascistPolicy += 1;
    if (currentGame.mastermindExists && gameStatus.enactedFascistPolicy === 5 && gameStatus.enactedLiberalPolicy === 4)
        endGame(currentGame, '4번째 자유당 법안 제정 후 5번째 파시스트 법안 제정으로 인한 배후 승리');
    if (gameStatus.enactedFascistPolicy === 6)
        endGame(currentGame, '파시스트 법안 트랙 완성인한 파시스트당 승리');
}

const enactTopLiberalPolicy = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    const embed = new MessageEmbed()
        .setTitle('정부가 3연속 구성되지 않아 민중이 분노해 법안을 강제로 제정합니다!')
        .setDescription('제정된 법안은 자유당 법안이었습니다.')
        .setColor('BLUE');
    currentGame.mainChannel.send({ embeds: [embed] })
    gameStatus.enactedLiberalPolicy += 1;
    if (gameStatus.enactedFascistPolicy === 5 && gameStatus.enactedLiberalPolicy === 4)
        revealsMastermind(currentGame);
    if (gameStatus.enactedLiberalPolicy === 5)
        endGame(currentGame, '자유당 법안 트랙 완성으로 인한 자유당 승리');
}