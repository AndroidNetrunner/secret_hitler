import { Mutex } from "async-mutex";
import { MessageEmbed, User } from "discord.js";
import { Game_room } from "./Game_room";
import { startLegislativeSession } from "./legislativeSession";
import { prepareNextRound, shufflePolicyDeck } from './executiveAction';
import { FASCIST, HITLER, Policy } from "./board";
import { completeFascistTrack, completeLiberalTrack, electHitlerByChancellor, makeSuddenDeathByMastermind } from './end_game';
import { revealsMastermind } from "./executiveAction";
import { Game_status } from "./Game_status";

export const readVotes = async (currentGame: Game_room) => {
    const { gameStatus } = currentGame;
    const voteLock = new Mutex();
    const release = await voteLock.acquire();
    const agree = gameStatus.agree;
    const disagree = gameStatus.disagree;
    if (agree.length + disagree.length >= gameStatus.players.length) {
        const isElected = revealVotes(currentGame);
        gameStatus.agree = [];
        gameStatus.disagree = [];
        if (isElected) {
            if (gameStatus.enactedFascistPolicy >= 3 &&
                currentGame.roles.get(gameStatus.chancellor as User) === HITLER)
                electHitlerByChancellor(currentGame);
            else
                startLegislativeSession(currentGame);
        }
        else {
            gameStatus.electionTracker += 1;
            if (gameStatus.electionTracker === 3)
                enactTopPolicy(currentGame);
            if (gameStatus.specialElection) {
                gameStatus.specialElection = false;
                gameStatus.president = gameStatus.termLimitedPresident;
            }
            prepareNextRound(currentGame);
        }
    }
    release();
}

const revealVotes = (currentGame: Game_room) => {
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

export const changePresident = (gameStatus: Game_status) => {
    const { players, president } = gameStatus;
    const presidentIndex = players.indexOf(president as User);
    gameStatus.president = players[(presidentIndex + 1) % players.length];
    return gameStatus.president;
}

const enactTopPolicy = (currentGame: Game_room) => {
    const { gameStatus } = currentGame;
    const newPolicy: Policy = gameStatus.policyDeck.pop() as Policy;
    gameStatus.electionTracker = 0;
    if (newPolicy === FASCIST) {
        currentGame.mainChannel.send('파시스트 법안이 랜덤으로 제정되었습니다.');
        gameStatus.enactedFascistPolicy += 1;
        if (gameStatus.enactedFascistPolicy === 5 && gameStatus.enactedLiberalPolicy === 4)
            makeSuddenDeathByMastermind(currentGame);
        if (gameStatus.enactedFascistPolicy === 6)
            completeFascistTrack(currentGame);
    }
    else {
        currentGame.mainChannel.send('자유당 법안이 랜덤으로 제정되었습니다.');
        gameStatus.enactedLiberalPolicy += 1;
        if (gameStatus.enactedFascistPolicy === 5 && gameStatus.enactedLiberalPolicy === 4)
            revealsMastermind(currentGame);
        if (gameStatus.enactedLiberalPolicy === 5)
            completeLiberalTrack(currentGame);
    }
    if (gameStatus.policyDeck.length < 3)
        shufflePolicyDeck(currentGame);
    prepareNextRound(currentGame);
}