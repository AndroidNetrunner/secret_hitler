import { MessageActionRow, MessageButton, User } from "discord.js";
import { FASCIST, LIBERAL, Policy } from "./board";

interface GameStatus {
  president?: User;
  chancellor?: User;
  players: User[];
  electionTracker: 0 | 1 | 2 | 3;
  termLimitedChancellor?: User;
  termLimitedPresident?: User;
  specialElection: boolean;
  agree: User[];
  disagree: User[];
  enactedFascistPolicy: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  enactedLiberalPolicy: 0 | 1 | 2 | 3 | 4 | 5;
  policyDeck: Policy[];
}

export class Game_status implements GameStatus {
  president?: User;
  chancellor?: User;
  players: User[] = [];
  electionTracker: 0 | 1 | 2 | 3 = 0;
  termLimitedPresident?: User;
  termLimitedChancellor?: User;
  specialElection: boolean = false;
  agree: User[] = [];
  disagree: User[] = [];
  enactedFascistPolicy: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;
  enactedLiberalPolicy: 0 | 1 | 2 | 3 | 4 | 5 = 0;
  policyDeck: Policy[] = [
    LIBERAL,
    LIBERAL,
    LIBERAL,
    LIBERAL,
    LIBERAL,
    LIBERAL,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
    FASCIST,
  ];

  get eligibleNominees() {
    if (this.players.length <= 5)
      return this.players.filter(
        (player) =>
          player !== this.termLimitedPresident && player !== this.president
      );
    return this.players.filter(
      (player) =>
        player !== this.termLimitedPresident &&
        player !== this.termLimitedChancellor &&
        player !== this.president
    );
  }

  get ineligibleNominees() {
    if (this.players.length <= 5)
      return this.players.filter(
        (player) =>
          player === this.termLimitedPresident || player === this.president
      );
    return this.players.filter(
      (player) =>
        player === this.termLimitedPresident ||
        player === this.termLimitedChancellor ||
        player === this.president
    );
  }

  getPlayerButtons(filter: (player: User) => boolean) {
    const actionRow = [
      new MessageActionRow().addComponents(
        this.players
          .slice(0, 5)
          .map((player) =>
            new MessageButton()
              .setLabel(player.username)
              .setDisabled(!filter(player))
              .setCustomId(player.id)
              .setStyle("SECONDARY")
          )
      ),
    ];
    if (this.players.length > 5) {
      return actionRow.concat([
        new MessageActionRow().addComponents(
          this.players
            .slice(5)
            .map((player) =>
              new MessageButton()
                .setLabel(player.username)
                .setDisabled(!filter(player))
                .setCustomId(player.id)
                .setStyle("SECONDARY")
            )
        ),
      ]);
    }
    return actionRow;
  }
}
