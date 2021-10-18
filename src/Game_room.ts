import { Message, TextBasedChannels, User } from "discord.js";
import { FASCIST, FascistBoard, LIBERAL, Policy, Role } from "./board";

export type Emojis = Map<string, User>;

interface IGameRoom {
    players: User[],
    president: User | null,
    roles: Map<User, Role>,
    electionTracker: 0 | 1 | 2 | 3,
    termLimitedPresident: User | null,
    termLimitedChancellor: User | null,
    agree: User[],
    disagree: User[],
    fascistBoard: FascistBoard | null,
    mainChannel: TextBasedChannels | null,
    emojis: Emojis,
}

export class Game_room implements IGameRoom {
    players: User[] = [];
    president: User | null = null;
    chancellor: User | null = null;
    roles: Map<User, Role> = new Map();
    electionTracker: 0 | 1 | 2 | 3 = 0;
    termLimitedPresident: User | null = null;
    termLimitedChancellor: User | null = null;
    fascistBoard: FascistBoard | null = null;
    mainChannel: TextBasedChannels;
    specialElection: boolean = false;
    agree: User[] = [];
    disagree: User[] = [];
    enactedFascistPolicy: 0 | 1 | 2 | 3 | 4 | 5 = 0;
    enactedLiberalPolicy: 0 | 1 | 2 | 3 | 4 = 0;
    policyDeck: Policy[] = [LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST, FASCIST];
    emojis: Emojis = new Map();
    constructor(message: Message) {
        this.players = [message.author];
        this.mainChannel = message.channel;
    }
}