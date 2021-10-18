import { Mutex } from "async-mutex";
import { MessageEmbed, User } from "discord.js";
import { Game_room } from "./Game_room";
import { startRound } from "./start_round";
import { startLegislativeSession } from "./legislativeSession";

export const readVotes = async (currentGame: Game_room) => {
    const voteLock = new Mutex()
    const release = await voteLock.acquire();
    const agree = currentGame.agree;
    const disagree = currentGame.disagree;
    if (agree.length + disagree.length >= currentGame.players.length) {
        const isElected = revealVotes(currentGame);
        currentGame.agree = [];
        currentGame.disagree = [];
        if (isElected) {
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
            changePresident(currentGame);
            startRound(currentGame.mainChannel.id);
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
            value: `찬성: ${currentGame.agree}\n
        반대: ${currentGame.disagree}`
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

}