import { User } from "discord.js";

interface IGameRoom {
    players: User[],
}

export class Game_room implements IGameRoom {
    players: User[] = []; 
    constructor(starter : User) {
        this.players = [starter];
    }
}