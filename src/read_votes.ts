import { Mutex } from "async-mutex";
import { MessageEmbed, User } from "discord.js";
import { Game_room } from "./Game_room";
import { startLegislativeSession } from "./legislativeSession";
import { prepareNextRound, shufflePolicyDeck } from './executiveAction';
import { FASCIST, HITLER, Policy } from "./board";
import { completeFascistTrack, completeLiberalTrack, electHitlerByChancellor } from './end_game';

export const readVotes = async (currentGame: Game_room) => {
    const voteLock = new Mutex();
    const release = await voteLock.acquire();
    const agree = currentGame.agree;
    const disagree = currentGame.disagree;
    if (agree.length + disagree.length >= currentGame.players.length) {
        const isElected = revealVotes(currentGame);
        currentGame.agree = [];
        currentGame.disagree = [];
        if (isElected) {
            if (currentGame.enactedFascistPolicy >= 3 &&
                currentGame.roles.get(currentGame.chancellor as User) === HITLER)
                electHitlerByChancellor(currentGame);
            else
                startLegislativeSession(currentGame);
        }
        else {
            currentGame.electionTracker += 1;
            if (currentGame.electionTracker === 3)
                enactTopPolicy(currentGame);
            if (currentGame.specialElection) {
                currentGame.specialElection = false;
                currentGame.president = currentGame.termLimitedPresident;
            }
            prepareNextRound(currentGame);
        }
    }
    release();
}

const revealVotes = (currentGame: Game_room) => {
    const agree = currentGame.agree;
    const disagree = currentGame.disagree;
    const electionTracker = currentGame.electionTracker;
    const result = currentGame.agree.length > currentGame.disagree.length ? `가결` : `부결`;
    const embed = new MessageEmbed()
        .setTitle(`${electionTracker + 1}번째 선거 결과는 다음과 같습니다.`)
        .setDescription(
            `대통령 후보: ${currentGame.president?.username}, 수상 후보: ${currentGame.chancellor?.username}`
        )
        .setFields({
            name: `개표 결과, 이번 정부는 ${result}되었습니다.`,
            value: `찬성: ${agree}\n
        반대: ${disagree}`
        })
    currentGame.mainChannel?.send({
        embeds: [embed]
    })
    return (result === '가결')
}

export const changePresident = (currentGame: Game_room) => {
    const { players, president } = currentGame;
    const presidentIndex = players.indexOf(president as User);
    currentGame.president = players[(presidentIndex + 1) % players.length];
    return currentGame.president;
}

const enactTopPolicy = (currentGame: Game_room) => {
    const newPolicy: Policy = currentGame.policyDeck.pop() as Policy;
    currentGame.electionTracker = 0;
    if (newPolicy === FASCIST) {
        currentGame.mainChannel.send('파시스트 법안이 랜덤으로 제정되었습니다.');
        if (currentGame.enactedFascistPolicy === 5)
            completeFascistTrack(currentGame);
        else
            currentGame.enactedFascistPolicy += 1;
    }
    else {
        currentGame.mainChannel.send('자유당 법안이 랜덤으로 제정되었습니다.');
        if (currentGame.enactedLiberalPolicy === 4)
            completeLiberalTrack(currentGame);
        else
            currentGame.enactedLiberalPolicy += 1;
    }
    if (currentGame.policyDeck.length < 3)
        shufflePolicyDeck(currentGame);
    prepareNextRound(currentGame);
}