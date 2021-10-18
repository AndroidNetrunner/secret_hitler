import { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { LIBERAL, Policy } from "./board";
import { Game_room } from "./Game_room";
import { shuffle } from "./ready_game";
import { startExecutiveAction } from './executiveAction';
export const startLegislativeSession = (currentGame: Game_room) => {
    const first = currentGame.policyDeck.pop();
    const second = currentGame.policyDeck.pop();
    const third = currentGame.policyDeck.pop();
    const drawedPolicies = [first, second, third] as Policy[];
    presidentChoosePolicy(currentGame, drawedPolicies);
}

const presidentChoosePolicy = async (currentGame: Game_room, drawedPolicies: Policy[]) => {
    const president = currentGame.president;
    const embed = new MessageEmbed()
    .setTitle('이제 법안을 제정할 차례입니다.')
    .setDescription(`${president}님, 버릴 법안을 하나 골라 버튼을 하나 눌러주세요.`);
    const policyButton = getPolicyButton(drawedPolicies);
    const message = await president?.send({
        embeds: [embed],
        components: [policyButton],
    });
    const collector = president?.dmChannel?.createMessageComponentCollector({
        max: 1,
    });
    collector?.on('collect', (interaction) => {
        drawedPolicies.splice(parseInt(interaction.customId), 1);
        chancellorChoosePolicy(currentGame, drawedPolicies);
        message?.delete();
    })
};

const chancellorChoosePolicy = async (currentGame: Game_room, drawedPolicies: Policy[]) => {
    const chancellor = currentGame.chancellor;
    const embed = new MessageEmbed()
    .setTitle('이제 법안을 제정할 차례입니다.')
    .setDescription(`${chancellor}님, 버릴 법안을 하나 골라 버튼을 하나 눌러주세요.`);
    const policyButton = getPolicyButton(shuffle(drawedPolicies));
    const message = await chancellor?.send({
        embeds: [embed],
        components: [policyButton],
    })
    const collector = chancellor?.dmChannel?.createMessageComponentCollector({
        max: 1,
    });
    collector?.on('collect', (interaction) => {
        drawedPolicies.splice(parseInt(interaction.customId), 1);
        message?.delete();
        startExecutiveAction(currentGame, drawedPolicies[0]);
    })
};

const getPolicyButton = (drawedPolicies: Policy[]) : MessageActionRow => {
    const actionRow = new MessageActionRow();
    for (let index in drawedPolicies)
    actionRow.addComponents(
        new MessageButton()
        .setCustomId(index)
        .setStyle(drawedPolicies[parseInt(index)] === LIBERAL ? 'PRIMARY' : 'DANGER')
        .setLabel(drawedPolicies[parseInt(index)])
    )
    return actionRow;
}
