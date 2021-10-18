import { Message, MessageEmbed, User } from "discord.js";
import { CALL_SPECIAL_ELECTION, EXECUTION, FASCIST, FascistBoard, FASCIST_WIN, HITLER, INVESTIGATE_LOYALTY, LIBERAL, Policy, POLICY_PEEK } from "./board";
import { Emojis, Game_room } from "./Game_room";
import { shuffle } from "./ready_game";
import { changePresident } from "./read_votes";
import { getFieldValue, startRound } from "./start_round";
import { active_games } from "./state";

export const startExecutiveAction = (currentGame: Game_room, policy: Policy) => {
    if (policy === FASCIST) {
        currentGame.enactedFascistPolicy += 1;
        if (currentGame.policyDeck.length < 3)
            shufflePolicyDeck(currentGame);
        const fascistBoard = currentGame.fascistBoard as FascistBoard;
        switch (fascistBoard[currentGame.enactedFascistPolicy - 1]) {
            case INVESTIGATE_LOYALTY:
                investigateLoyalty(currentGame);
                break;
            case CALL_SPECIAL_ELECTION:
                callSpecialElection(currentGame);
                break;
            case POLICY_PEEK:
                policyPeek(currentGame);
                break;
            case EXECUTION:
                execution(currentGame);
                break;
            // case FASCIST_WIN:
            //     end_game(currentGame);
            //     break;
            default:
                startRound(currentGame.mainChannel?.id as string);
        }
    }
    else {
        currentGame.enactedLiberalPolicy += 1;
        if (currentGame.policyDeck.length < 3)
            shufflePolicyDeck(currentGame);
        prepareNextRound(currentGame);
    }
}

const shufflePolicyDeck = (currentGame: Game_room) => {
    const remainedFascistPolicy = 11 - currentGame.enactedFascistPolicy;
    const remainedLiberalPolicy = 6 - currentGame.enactedLiberalPolicy;
    const fascistPolicyDeck = new Array(remainedFascistPolicy).fill(FASCIST);
    const liberalPolicyDeck = new Array(remainedLiberalPolicy).fill(LIBERAL);
    return shuffle(fascistPolicyDeck.concat(liberalPolicyDeck));
}

const investigateLoyalty = async (currentGame: Game_room) => {
    const roles = currentGame.roles;
    const president = currentGame.president as User;
    console.log(`president - ${president?.id}`);
    const embed = new MessageEmbed()
        .setTitle('이제 소속을 조사할 시간입니다.')
        .setDescription(`${president}님, 소속을 확인하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame.mainChannel?.id as string),
        })
    const message = await president.send({
        embeds: [embed],
    });
    addReactions(message, currentGame);
    const collector = message.createReactionCollector({
        max: 1,
        filter: (reaction, user) => user.id === president.id,
    });

    collector.on('collect', (reaction, user) => {
        console.log(`collected! ${user.id}`)
        const target = currentGame.emojis.get(reaction.emoji.toString());
        const role = roles.get(target as User);
        reaction.message.delete()
        president.send({
            content: `${target}의 소속은 ${role === LIBERAL ? '자유당' : '파시스트'}입니다.`,
        })
        prepareNextRound(currentGame);
    });
}

const addReactions = (message: Message, currentGame: Game_room) => {
    const emojis = currentGame.emojis as Emojis;
    const president = currentGame.president as User;
    for (let [emoji, player] of emojis) {
        if (!player)
            break;
        if (!(player === president))
            message.react(emoji);
    }
}

const callSpecialElection = async (currentGame: Game_room) => {
    const president = currentGame.president;
    const embed = new MessageEmbed()
        .setTitle('이제 특별 선거의 후보를 결정할 시간입니다.')
        .setDescription(`${president}님, 특별 선거의 대통령 후보로 지정하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame.mainChannel?.id as string),
        });
    const message = await president?.send({
        embeds: [embed],
    })
    addReactions(message as Message, currentGame)
    const collector = message?.createReactionCollector({
        max: 1,
        filter: (reaction, user) => user.id === president?.id,
    })
    collector?.on('collect', (reaction, user) => {
        const target = currentGame.emojis.get(reaction.emoji.toString()) as User;
        startSpecialElection(currentGame, target);
    });
}

const startSpecialElection = (currentGame: Game_room, target: User) => {
    currentGame.specialElection = true
    const president = changePresident(currentGame);
    startRound(currentGame.mainChannel?.id as string);
}

const prepareNextRound = (currentGame: Game_room) => {
    if (currentGame.specialElection) {
        currentGame.specialElection = false;
        currentGame.president = currentGame.termLimitedPresident;
    }
    changePresident(currentGame);
    startRound(currentGame.mainChannel?.id as string);
}

const policyPeek = (currentGame: Game_room) => {
    const president = currentGame.president as User;
    const topPolicies = currentGame.policyDeck.slice(-3).reverse();
    president.send(`정책 덱 맨 위에 있는 세 장은 ${topPolicies}입니다. (왼쪽이 가장 위)`);
    prepareNextRound(currentGame);
}

const execution = async (currentGame: Game_room) => {
    const president = currentGame.president;
    const embed = new MessageEmbed()
        .setTitle('이제 플레이어를 처형할 시간입니다.')
        .setDescription(`${president}님, 처형하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame.mainChannel?.id as string),
        })
    const message = await president?.send({
        embeds: [embed],
    })
    addReactions(message as Message, currentGame)
    const collector = message?.createReactionCollector({
        filter: (reaction, user) => user.id === president?.id,
        max: 1,
    })
    collector?.on('collect', (reaction, user) => {
        const roles = currentGame.roles;
        const target = currentGame.emojis.get(reaction.emoji.toString());
        const role = roles.get(target as User);
        reaction.message.delete()
        president?.send({
            content: `${target}님을 사살하였습니다.`,
        })
        if (role === HITLER)
            console.log(`game over`);
        else {
            currentGame.players = currentGame.players.filter(player => player !== target);
            currentGame.roles.delete(target as User);
            prepareNextRound(currentGame);
        }
    });
}