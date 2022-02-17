import { MessageEmbed, TextBasedChannels, User } from "discord.js";
import { FASCIST, fascistBoard, HITLER, LIBERAL, MASTERMIND, Policy, Role, roleByNumberOfPlayers } from "./board";
import { getRoles } from "./end_game";
import { Game_room } from "./Game_room";
import { Game_status } from "./Game_status";
import { startRound } from "./start_round";
import { active_games } from "./state";

export const readyGame = async (channelId: string) : Promise<void> => {
    const currentGame = active_games.get(channelId) as Game_room;
    const { gameStatus } = currentGame;
    const roleOfPlayers = assignRoles(currentGame);
    try {
        await notifyRoles(roleOfPlayers, currentGame.mainChannel);
    }
    catch (error) {
        currentGame.mainChannel.send(
            `앗! 누군가가 봇에게 DM 발송 권한을 주지 않아 DM 발송에 실패했습니다. 
            설정 -> 개인정보 보호 및 보안 -> "서버 멤버가 보내는 다이렉트 메세지 허용하기"가 켜져있는지 확인해주세요!
            모든 플레이어가 허용한 후, ?리셋을 입력해 게임을 초기화할 수 있습니다.`);
    }
    console.log(roleOfPlayers);
    decideFirstPresident(gameStatus);
    setEmoji(currentGame);
    selectBoard(currentGame);
    setPolicyDeck(currentGame);
    printBoard(currentGame);
    startRound(currentGame);
}

const setMastermind = (possibleRoles: Role[], currentGame: Game_room) : Role[] => {
    const hasMastermind = Math.random() > 0.5;
    const currentPossibleRoles = [...possibleRoles];
    if (hasMastermind) {
        currentGame.mastermindExists = true;
        currentPossibleRoles.pop();
        currentPossibleRoles.push(MASTERMIND);
    }
    return currentPossibleRoles;
}

const assignRoles = (currentGame: Game_room): Map<User, Role> => {
    const players = currentGame.gameStatus.players;
    const shuffledPlayers = shuffle(players);
    const numberOfPlayers = shuffledPlayers.length;
    const possibleRoles = currentGame.mastermind ? setMastermind(roleByNumberOfPlayers[numberOfPlayers as 5 | 6 | 7 | 8 | 9 | 10], currentGame) : [...roleByNumberOfPlayers[numberOfPlayers as 5 | 6 | 7 | 8 | 9 | 10]] as Role[];
    const roleOfPlayers: Map<User, Role> = new Map();
    for (let player of players)
        roleOfPlayers.set(player, possibleRoles.pop() as Role)
    currentGame.roles = roleOfPlayers;
    return roleOfPlayers;
}

const notifyRoles = async (roleOfPlayers: Map<User, Role>, mainChannel: TextBasedChannels) : Promise<void> => {
    for (let [player, role] of roleOfPlayers) {
        const description = decideDescriptionByRole(player, roleOfPlayers);
        let color: "BLUE" | "RED" | "GREEN";
        switch (role) {
            case LIBERAL:
                color = "BLUE";
                break;
            case MASTERMIND:
                color = "GREEN";
                break;
            default:
                color = "RED";
                break;
        }
        const embed = new MessageEmbed().setTitle(`당신의 역할은 ${role}입니다.`).setDescription(description).setColor(color);
        if (role === MASTERMIND)
            embed.setFields({
                name: `각 플레이어의 정체는 다음과 같습니다.`,
                value: getRoles(roleOfPlayers),
            })
            await player.send({ embeds: [embed] });
    }
};

const decideFirstPresident = (gameStatus: Game_status) : void => {
    const players = gameStatus.players;
    gameStatus.president = choose(players);
}

const getWhoAreFascists = (player: User, roleOfPlayers: Map<User, Role>) : string => {
    let fascists: User[] = [];
    roleOfPlayers.forEach((role, opponent) => {
        if (opponent === player)
            return
        if (role === FASCIST)
            fascists.push(opponent)
    })
    return fascists.length ? fascists.toString() : `(존재하지 않음)`;
}

const getWhoIsHitler = (roleOfPlayers: Map<User, Role>) : User => {
    for (let [opponent, role] of roleOfPlayers)
        if (role === HITLER)
            return opponent;
    throw new Error("No hitler in roles");
}

const decideDescriptionByRole = (player: User, roleOfPlayers: Map<User, Role>): string => {
    const role = roleOfPlayers.get(player);
    switch (role) {
        case HITLER:
            if (roleOfPlayers.size > 6)
                return '3개의 파시스트 법안을 제정한 이후 수상으로 선출되거나, 파시스트 법안 트랙을 모두 채워 게임에서 승리하세요!';
            else
                return `당신의 파시스트 동료는 ${getWhoAreFascists(player, roleOfPlayers)}입니다!`
        case LIBERAL:
            return '히틀러를 암살하거나, 자유당 법안 트랙을 모두 채워 게임에서 승리하세요!';
        case FASCIST:
            return `당신의 파시스트 동료는 ${getWhoAreFascists(player, roleOfPlayers)}이며, 히틀러는 ${getWhoIsHitler(roleOfPlayers)}입니다!`;
        case MASTERMIND:
            return `4번째 자유당 법안을 제정한 뒤, 5번째 파시스트 법안이 제정하고 암살당하지 않으면 게임에서 승리합니다.
            만약 5번째 파시스트 법안이 먼저 제정되었다면, 4번째 자유당 법안을 제정한 수상이 되었을 때 승리합니다!`
        default:
            return `존재하지 않는 역할입니다.`;
    }
}

const selectBoard = (currentGame: Game_room) : void => {
    const numberOfPlayers = currentGame.gameStatus.players.length as 5 | 6 | 7 | 8 | 9 | 10;
    currentGame.fascistBoard = fascistBoard[numberOfPlayers];
}

const printBoard = (currentGame : Game_room) : void => {
    const { fascistBoard, mainChannel } = currentGame;
    if (!fascistBoard)
        return;
    const embed = new MessageEmbed().setTitle('모든 플레이어에게 역할 배분을 하였습니다.').setFields({
        name: '이번 게임에 쓰일 파시스트 트랙은 다음과 같습니다.',
        value: fascistBoard.join("\n"),
    })
    mainChannel.send({
        embeds: [embed],
    })
}

const setPolicyDeck = (currentGame : Game_room) : void => {
    const { gameStatus } = currentGame;
    if (currentGame.balance) {
        const { length } = gameStatus.players;
        switch (length) {
            case 6:
                gameStatus.policyDeck.pop()
                gameStatus.enactedFascistPolicy += 1;
                break;
            case 7:
                gameStatus.policyDeck.pop()
                currentGame.numberOfInitialPolicy -= 1;
            case 9:
                gameStatus.policyDeck.pop()
                currentGame.numberOfInitialPolicy -= 1;
        }
    }
    gameStatus.policyDeck = shuffle(gameStatus.policyDeck);
}

const setEmoji = (currentGame: Game_room) : void => {
    const players = currentGame.gameStatus.players as User[];
    for (let index = 0; index < 10; index++)
        currentGame.emojis.set(`${index.toString()}\u20E3`, players[index]);
}

export function shuffle(array: any[]) : any[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function choose(choices: any[]) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}