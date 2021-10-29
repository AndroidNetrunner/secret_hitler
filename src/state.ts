import { Game_room } from "./Game_room";

type channelId = string;

export const active_games : Map<channelId, Game_room> = new Map();