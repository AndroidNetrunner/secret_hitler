import { Message, TextBasedChannels, User } from "discord.js";
import { FASCIST, FascistBoard, LIBERAL, Policy, Role } from "./board";

export type Emojis = Map<string, User>;

interface IGameRoom {
    players: User[],
    president?: User,
    chancellor?: User,
    mastermind: boolean,
    roles: Map<User, Role>,
    electionTracker: 0 | 1 | 2 | 3,
    termLimitedPresident?: User,
    termLimitedChancellor?: User,
    agree: User[],
    disagree: User[],
    fascistBoard?: FascistBoard,
    mainChannel: TextBasedChannels,
    emojis: Emojis,
}

export class Game_room implements IGameRoom {
    players: User[] = [];
    president?: User;
    chancellor?: User;
    mastermind: boolean = false;
    roles: Map<User, Role> = new Map();
    balance: boolean = false;
    electionTracker: 0 | 1 | 2 | 3 = 0;
    termLimitedPresident?: User;
    termLimitedChancellor?: User;
    fascistBoard?: FascistBoard;
    mainChannel: TextBasedChannels;
    specialElection: boolean = false;
    agree: User[] = [];
    disagree: User[] = [];
    enactedFascistPolicy: 0 | 1 | 2 | 3 | 4 | 5 = 0;
    enactedLiberalPolicy: 0 | 1 | 2 | 3 | 4 = 0;
    policyDeck: Policy[] = [LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST];
    numberOfInitialPolicy: 15 | 16 | 17 = 17;
    emojis: Emojis = new Map();
    constructor(message: Message) {
        this.players = [message.author];
        this.mainChannel = message.channel;
    }
}