import { TextBasedChannel, User } from "discord.js";
import { FascistBoard, Role } from "./board";
import { Game_status } from "./Game_status";

interface GameRoom {
  mastermind: boolean;
  roles: Map<User, Role>;
  fascistBoard?: FascistBoard;
  mainChannel: TextBasedChannel;
  gameStatus: Game_status;
}

export class Game_room implements GameRoom {
  mastermind: boolean = false;
  mastermindExists: boolean = false;
  roles: Map<User, Role> = new Map();
  balance: boolean = false;
  fascistBoard?: FascistBoard;
  mainChannel: TextBasedChannel;
  numberOfInitialPolicy: 15 | 16 | 17 = 17;
  gameStatus: Game_status = new Game_status();
  constructor(starter: User, channel: TextBasedChannel) {
    this.gameStatus.players = [starter];
    this.mainChannel = channel;
  }
}
