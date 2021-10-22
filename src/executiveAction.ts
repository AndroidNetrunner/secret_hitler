import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { BLANK, CALL_SPECIAL_ELECTION, EXECUTION, FASCIST, FascistBoard, FASCIST_WIN, HITLER, INVESTIGATE_LOYALTY, LIBERAL, MASTERMIND, Policy, POLICY_PEEK } from "./board";
import { completeFascistTrack, completeLiberalTrack, enactFourthLiberalPolicyByMastermind, executeHitler, makeSuddenDeathByMastermind } from "./end_game";
import { Emojis, Game_room } from "./Game_room";
import { shuffle } from "./ready_game";
import { changePresident } from "./read_votes";
import { getFieldValue, startRound } from "./start_round";
import { active_games } from "./state";

export const startExecutiveAction = (currentGame: Game_room, policy: Policy) => {
    const { termLimitedPresident } = currentGame;
    currentGame.termLimitedPresident = currentGame.president;
    currentGame.termLimitedChancellor = currentGame.chancellor;
    currentGame.electionTracker = 0;
    if (policy === FASCIST) {
        const fascistBoard = currentGame.fascistBoard as FascistBoard;
        const scheduledPolicy = fascistBoard[currentGame.enactedFascistPolicy];
        const embed = new MessageEmbed()
        .setTitle(`${currentGame.enactedFascistPolicy + 1}번째 파시스트 법안이 제정되었습니다.`)
        .setDescription(scheduledPolicy === BLANK ? `` : `${currentGame.president}님은 ${scheduledPolicy} 권한을 사용할 수 있습니다.`);
        currentGame.mainChannel.send({
            embeds: [embed],
        });
        if (currentGame.policyDeck.length < 3)
            shufflePolicyDeck(currentGame);
        switch (scheduledPolicy) {
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
            case FASCIST_WIN:
                completeFascistTrack(currentGame);
                break;
            default:
                prepareNextRound(currentGame);
        }
        if (currentGame.enactedFascistPolicy < 5)
            currentGame.enactedFascistPolicy += 1;
    }
    else {
        const embed = new MessageEmbed()
        .setTitle(`${currentGame.enactedLiberalPolicy + 1}번째 자유당 법안이 제정되었습니다.`)
        if (currentGame.enactedFascistPolicy === 5 && 
            currentGame.enactedLiberalPolicy === 4 &&
            currentGame.roles.get(currentGame.chancellor as User) === MASTERMIND) {
                enactFourthLiberalPolicyByMastermind(currentGame);
            return;
        }
        currentGame.mainChannel.send({
            embeds: [embed],
        });
        if (currentGame.enactedLiberalPolicy === 4)
            completeLiberalTrack(currentGame);
        else {
        currentGame.enactedLiberalPolicy += 1;
        if (currentGame.policyDeck.length < 3)
            shufflePolicyDeck(currentGame);
        prepareNextRound(currentGame, termLimitedPresident as User);
        }
    }
}

export const shufflePolicyDeck = (currentGame: Game_room) => {
    const remainedFascistPolicy = currentGame.numberOfInitialPolicy - 6 - currentGame.enactedFascistPolicy;
    const remainedLiberalPolicy = 6 - currentGame.enactedLiberalPolicy;
    const fascistPolicyDeck = new Array(remainedFascistPolicy).fill(FASCIST);
    const liberalPolicyDeck = new Array(remainedLiberalPolicy).fill(LIBERAL);
    currentGame.policyDeck = shuffle(fascistPolicyDeck.concat(liberalPolicyDeck));
}

const investigateLoyalty = async (currentGame: Game_room) => {
    const roles = currentGame.roles;
    const president = currentGame.president as User;
    const embed = new MessageEmbed()
        .setTitle('이제 소속을 조사할 시간입니다.')
        .setDescription(`${president}님, 소속을 확인하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame.mainChannel?.id as string),
        })
    const message = await currentGame.mainChannel.send({
        embeds: [embed],
    });
    addReactions(message, currentGame);
    const filter = (reaction: MessageReaction, user: User) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president.id);
    const collector = message.createReactionCollector({
        filter, 
        max: 1,
    });
    collector.on('collect', (reaction, user) => {
        const target = currentGame.emojis.get(reaction.emoji.toString());
        const role = roles.get(target as User);
        reaction.message.reply(`${target}을 대통령이 조사하였습니다.`);
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
    const president = currentGame.president as User;
    const embed = new MessageEmbed()
        .setTitle('이제 특별 선거의 후보를 결정할 시간입니다.')
        .setDescription(`${president}님, 특별 선거의 대통령 후보로 지정하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame.mainChannel?.id as string),
        });
    const message = await currentGame.mainChannel?.send({
        embeds: [embed],
    })
    addReactions(message as Message, currentGame)
    const collector = message?.createReactionCollector({
        max: 1,
        filter: (reaction, user) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president.id),
    })
    collector?.on('collect', (reaction, user) => {
        reaction.message.delete();
        const target = currentGame.emojis.get(reaction.emoji.toString()) as User;
        startSpecialElection(currentGame, target);
    });
}

const startSpecialElection = (currentGame: Game_room, target: User) => {
    currentGame.specialElection = true
    changePresident(currentGame);
    startRound(currentGame.mainChannel?.id as string);
}

export const prepareNextRound = (currentGame: Game_room, termLimitedPresident?: User) => {
    if (!active_games.get(currentGame.mainChannel.id))
        return
    if (currentGame.specialElection) {
        currentGame.specialElection = false;
        if (termLimitedPresident)
            currentGame.president = termLimitedPresident;
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
    const president = currentGame.president as User;
    const embed = new MessageEmbed()
        .setTitle('이제 플레이어를 처형할 시간입니다.')
        .setDescription(`${president}님, 처형하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame.mainChannel?.id as string),
        })
    const message = await currentGame.mainChannel?.send({
        embeds: [embed],
    })
    addReactions(message as Message, currentGame)
    const collector = message?.createReactionCollector({
        filter: (reaction, user) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president.id),
        max: 1,
    })
    collector?.on('collect', (reaction, user) => {
        const roles = currentGame.roles;
        const target = currentGame.emojis.get(reaction.emoji.toString());
        const role = roles.get(target as User);
        reaction.message.delete()
        currentGame.mainChannel.send({
            content: `${target}님을 사살하였습니다.`,
        })
        if (role === HITLER)
            executeHitler(currentGame);
        else {
            if (currentGame.enactedLiberalPolicy === 4 && currentGame.enactedFascistPolicy === 5)
            {
                makeSuddenDeathByMastermind(currentGame);
                return;
            }
            currentGame.players = currentGame.players.filter(player => player !== target);
            currentGame.emojis.delete(reaction.emoji.toString());
            prepareNextRound(currentGame);
        }
    });
}