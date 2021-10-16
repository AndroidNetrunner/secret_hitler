import { Message, TextBasedChannels, User } from "discord.js";
import { fascistBoard, role } from "./board";

export type emojis = Map<string, User>;

interface IGameRoom {
    players: User[],
    president: User | null,
    roles: Map<User, role>,
    remainedElection: 0 | 1 | 2 | 3,
    termLimitedPresident: User | null,
    termLimitedChancellor: User | null,
    fascistBoard: fascistBoard | null,
    mainChannel: TextBasedChannels | null,
    emojis: emojis,
}

export class Game_room implements IGameRoom {
    players: User[] = [];
    president: User | null = null;
    roles: Map<User, role> = new Map();
    remainedElection: 0 | 1 | 2 | 3 = 3;
    termLimitedPresident: User | null = null;
    termLimitedChancellor: User | null = null;
    fascistBoard: fascistBoard | null = null;
    mainChannel: TextBasedChannels | null = null;
    emojis: emojis = new Map();
    constructor(message: Message) {
        this.players = [message.author];
        this.mainChannel = message.channel;
    }
}

// \u0E3