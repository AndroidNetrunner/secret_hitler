import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { BLANK, CALL_SPECIAL_ELECTION, EXECUTION, FASCIST, FascistBoard, FASCIST_WIN, HITLER, INVESTIGATE_LOYALTY, LIBERAL, MASTERMIND, Policy, POLICY_PEEK } from "./board";
import { completeFascistTrack, completeLiberalTrack, enactFourthLiberalPolicyByMastermind, executeHitler, makeSuddenDeathByMastermind } from "./end_game";
import { Emojis, Game_room } from "./Game_room";
import { Game_status } from "./Game_status";
import { shuffle } from "./ready_game";
import { changePresident } from "./read_votes";
import { getFieldValue, startRound } from "./start_round";
import { active_games } from "./state";

export const endExecutiveAction = (gameStatus: Game_status): void => {
    gameStatus.termLimitedPresident = gameStatus.president;
    gameStatus.termLimitedChancellor = gameStatus.chancellor;
    gameStatus.electionTracker = 0;
}

export const enactFascistPolicy = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    gameStatus.enactedFascistPolicy += 1;
    const fascistBoard = currentGame.fascistBoard as FascistBoard;
    const scheduledPolicy = fascistBoard[gameStatus.enactedFascistPolicy - 1];
    const embed = new MessageEmbed()
        .setTitle(`${gameStatus.enactedFascistPolicy}번째 파시스트 법안이 제정되었습니다.`)
        .setDescription(scheduledPolicy === BLANK ? `` : `${gameStatus.president}님은 ${scheduledPolicy} 권한을 사용할 수 있습니다.`)
        .setColor('RED');
    currentGame.mainChannel.send({
        embeds: [embed],
    });
    if (gameStatus.policyDeck.length < 3)
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
}

export const enactLiberalPolicy = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    gameStatus.enactedLiberalPolicy += 1;
    const { termLimitedPresident } = gameStatus;
    const embed = new MessageEmbed()
        .setTitle(`${gameStatus.enactedLiberalPolicy}번째 자유당 법안이 제정되었습니다.`)
        .setColor('BLUE');
    if (gameStatus.enactedFascistPolicy === 5 && gameStatus.enactedLiberalPolicy === 4 && checkWinningOfMastermind(currentGame))
        return;
    currentGame.mainChannel.send({
        embeds: [embed],
    });
    if (gameStatus.enactedLiberalPolicy === 5)
        completeLiberalTrack(currentGame);
    else {
        if (gameStatus.policyDeck.length < 3)
            shufflePolicyDeck(currentGame);
        prepareNextRound(currentGame, termLimitedPresident as User);
    }
}

const checkWinningOfMastermind = (currentGame: Game_room) => {
    if (currentGame.roles.get(currentGame.gameStatus.chancellor as User) === MASTERMIND) { 
        enactFourthLiberalPolicyByMastermind(currentGame);
        return true;
    }
    revealsMastermind(currentGame);
    return false;
}

export const revealsMastermind = (currentGame: Game_room): void => {
    let mastermind: User | null = null;
    currentGame.roles.forEach((role, user) => role === MASTERMIND ? mastermind = user : null)
    if (!mastermind)
        return;
    currentGame.mainChannel.send(`배후의 정체가 드러났습니다! 배후는 ${mastermind}입니다.`);
    currentGame.gameStatus.players = currentGame.gameStatus.players.filter(player => player !== mastermind);
    let mastermindEmoji: string = "";
    currentGame.emojis.forEach((user, emoji) => user === mastermind ? mastermindEmoji = emoji : null);
    currentGame.emojis.delete(mastermindEmoji);
}

export const shufflePolicyDeck = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    const remainedFascistPolicy = currentGame.numberOfInitialPolicy - 6 - gameStatus.enactedFascistPolicy;
    const remainedLiberalPolicy = 6 - gameStatus.enactedLiberalPolicy;
    const fascistPolicyDeck = new Array(remainedFascistPolicy).fill(FASCIST);
    const liberalPolicyDeck = new Array(remainedLiberalPolicy).fill(LIBERAL);
    gameStatus.policyDeck = shuffle(fascistPolicyDeck.concat(liberalPolicyDeck));
}

const investigateLoyalty = async (currentGame: Game_room): Promise<void> => {
    const { gameStatus } = currentGame;
    const roles = currentGame.roles;
    const president = gameStatus.president;
    const embed = new MessageEmbed()
        .setTitle('이제 소속을 조사할 시간입니다.')
        .setDescription(`${president}님, 소속을 확인하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame),
        })
    const message = await currentGame.mainChannel.send({
        embeds: [embed],
    });
    addReactions(message, currentGame);
    const filter = (reaction: MessageReaction, user: User) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president?.id);
    const collector = message.createReactionCollector({
        filter,
        max: 1,
    });
    collector.on('collect', (reaction: MessageReaction, user: User) => {
        const target = currentGame.emojis.get(reaction.emoji.toString());
        const role = roles.get(target as User);
        reaction.message.channel.send(`${target}을 대통령이 조사하였습니다.`);
        reaction.message.delete()
        president?.send({
            content: `${target}의 소속은 ${role === LIBERAL ? LIBERAL : FASCIST}입니다.`,
        })
        prepareNextRound(currentGame);
    });
}

const addReactions = (message: Message, currentGame: Game_room): void => {
    const emojis = currentGame.emojis as Emojis;
    const president = currentGame.gameStatus.president as User;
    for (let [emoji, player] of emojis) {
        if (!player)
            break;
        if (!(player === president))
            message.react(emoji);
    }
}

const callSpecialElection = async (currentGame: Game_room): Promise<void> => {
    const president = currentGame.gameStatus.president as User;
    const embed = new MessageEmbed()
        .setTitle('이제 특별 선거의 후보를 결정할 시간입니다.')
        .setDescription(`${president}님, 특별 선거의 대통령 후보로 지정하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame),
        });
    const message = await currentGame.mainChannel?.send({
        embeds: [embed],
    })
    addReactions(message as Message, currentGame)
    const collector = message?.createReactionCollector({
        max: 1,
        filter: (reaction: MessageReaction, user: User) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president.id),
    })
    collector?.on('collect', (reaction: MessageReaction, user: User) => {
        reaction.message.delete();
        const target = currentGame.emojis.get(reaction.emoji.toString()) as User;
        startSpecialElection(currentGame, target);
    });
}

const startSpecialElection = (currentGame: Game_room, target: User): void => {
    const { gameStatus } = currentGame;
    gameStatus.specialElection = true
    changePresident(gameStatus);
    startRound(currentGame);
}

export const prepareNextRound = (currentGame: Game_room, termLimitedPresident?: User): void => {
    const { gameStatus } = currentGame;
    if (!active_games.get(currentGame.mainChannel.id))
        return
    if (gameStatus.specialElection) {
        gameStatus.specialElection = false;
        if (termLimitedPresident)
            gameStatus.president = termLimitedPresident;
    }
    changePresident(gameStatus);
    startRound(currentGame);
}

const policyPeek = (currentGame: Game_room): void => {
    const { gameStatus } = currentGame;
    const president = gameStatus.president as User;
    const topPolicies = gameStatus.policyDeck.slice(-3).reverse();
    president.send(`정책 덱 맨 위에 있는 세 장은 ${topPolicies}입니다. (왼쪽이 가장 위)`);
    prepareNextRound(currentGame);
}

const execution = async (currentGame: Game_room): Promise<void> => {
    const { gameStatus } = currentGame;
    const president = gameStatus.president as User;
    const embed = new MessageEmbed()
        .setTitle('이제 플레이어를 처형할 시간입니다.')
        .setDescription(`${president}님, 처형하고 싶은 1명의 이모티콘을 눌러주세요.`)
        .setFields({
            name: `이모티콘이 의미하는 플레이어는 다음과 같습니다.`,
            value: getFieldValue(currentGame),
        })
    const message = await currentGame.mainChannel?.send({
        embeds: [embed],
    })
    addReactions(message as Message, currentGame)
    const collector = message?.createReactionCollector({
        filter: (reaction: MessageReaction, user: User) => !!(currentGame.emojis.get(reaction.emoji.toString()) && user.id === president.id),
        max: 1,
    })
    collector?.on('collect', (reaction: MessageReaction, user: User) => {
        const target = currentGame.emojis.get(reaction.emoji.toString());
        const role = currentGame.roles.get(target as User);
        reaction.message.delete()
        currentGame.mainChannel.send({
            content: `${target}님을 사살하였습니다.`,
        })
        if (role === HITLER)
            return executeHitler(currentGame);
        if (currentGame.mastermindExists && gameStatus.enactedLiberalPolicy === 4 && gameStatus.enactedFascistPolicy === 5)
            return makeSuddenDeathByMastermind(currentGame);
        gameStatus.players = gameStatus.players.filter(player => player !== target);
        currentGame.emojis.delete(reaction.emoji.toString());
        prepareNextRound(currentGame);
    });
}