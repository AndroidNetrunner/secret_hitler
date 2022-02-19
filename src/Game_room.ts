import { Message, TextBasedChannel, User } from "discord.js";
import { FascistBoard, Role } from "./board";
import { Game_status } from './Game_status';
export type Emojis = Map<string, User>;

interface GameRoom {
    mastermind: boolean,
    roles: Map<User, Role>,
    fascistBoard?: FascistBoard,
    mainChannel: TextBasedChannel,
    emojis: Emojis,
    gameStatus: Game_status,
}

export class Game_room implements GameRoom {
    mastermind: boolean = false;
    mastermindExists: boolean = false;
    roles: Map<User, Role> = new Map();
    balance: boolean = false;
    fascistBoard?: FascistBoard;
    mainChannel: TextBasedChannel;
    numberOfInitialPolicy: 15 | 16 | 17 = 17;
    emojis: Emojis = new Map();
    gameStatus: Game_status = new Game_status();
    constructor(message: Message) {
        this.gameStatus.players = [message.author];
        this.mainChannel = message.channel;
    }
}
