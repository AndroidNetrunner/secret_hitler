import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { LIBERAL, Policy } from "./board";
import { Game_room } from "./Game_room";
import { shuffle } from "./ready_game";
import { prepareNextRound, startExecutiveAction } from './executiveAction';
export const startLegislativeSession = (currentGame: Game_room) => {
    const { gameStatus } = currentGame;
    const first = gameStatus.policyDeck.pop();
    const second = gameStatus.policyDeck.pop();
    const third = gameStatus.policyDeck.pop();
    const drawedPolicies = [first, second, third] as Policy[];
    presidentChoosePolicy(currentGame, drawedPolicies);
}

const presidentChoosePolicy = async (currentGame: Game_room, drawedPolicies: Policy[]) => {
    const { gameStatus } = currentGame;
    const president = gameStatus.president;
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
        currentGame.mainChannel.send(`대통령이 법안을 하나 버렸습니다.`);
        drawedPolicies.splice(parseInt(interaction.customId), 1);
        chancellorChoosePolicy(currentGame, drawedPolicies);
        message?.delete();
    })
};

const chancellorChoosePolicy = async (currentGame: Game_room, drawedPolicies: Policy[]) => {
    const { gameStatus } = currentGame;
    const chancellor = gameStatus.chancellor;
    const embed = new MessageEmbed()
        .setTitle('이제 법안을 제정할 차례입니다.')
        .setDescription(`${chancellor}님, 버릴 법안을 하나 골라 버튼을 하나 눌러주세요.`);
    const policyButton = getPolicyButton(shuffle(drawedPolicies));
    if (gameStatus.enactedFascistPolicy === 5)
        policyButton.addComponents(
            new MessageButton()
                .setCustomId('veto')
                .setStyle('SECONDARY')
                .setLabel('거부권')
        )
    const message = await chancellor?.send({
        embeds: [embed],
        components: [policyButton],
    })
    const collector = chancellor?.dmChannel?.createMessageComponentCollector({
        max: 1,
    });
    collector?.on('collect', (interaction) => {
        if (interaction.customId === 'veto')
            vetoPower(currentGame, drawedPolicies);
        else {
            currentGame.mainChannel.send('수상이 법안을 하나 버렸습니다.')
            drawedPolicies.splice(parseInt(interaction.customId), 1);
            message?.delete();
            startExecutiveAction(currentGame, drawedPolicies[0]);
        }
    })
};

const getPolicyButton = (drawedPolicies: Policy[]): MessageActionRow => {
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

const vetoPower = async (currentGame: Game_room, drawedPolicies: Policy[]) => {
    const { gameStatus } = currentGame;
    const president = gameStatus.president;
    const embed = new MessageEmbed()
        .setTitle('수상이 거부권 사용을 요청했습니다.')
        .setDescription('거부권을 사용할 경우 법안들은 모두 폐기되고, 선거 트래커가 1 올라갑니다.');
    const vetoButton = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('agree')
                .setLabel('승인')
                .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('disagree')
                .setLabel('반려')
                .setStyle('DANGER')
        );
    const message = await president?.send({
        embeds: [embed],
        components: [vetoButton],
    })

    currentGame.mainChannel.send({
        content: embed.title,
    })

    const collector = president?.dmChannel?.createMessageComponentCollector({
        max: 1,
    });
    collector?.on('collect', (interaction) => {
        message?.delete();
        if (interaction.customId === 'agree') {
            currentGame.mainChannel.send("거부권 사용이 승인되었습니다.");
            prepareNextRound(currentGame);
        }
        else
            vetoRefused(currentGame, drawedPolicies);
    })
}

const vetoRefused = async (currentGame: Game_room, drawedPolicies: Policy[]) => {
    currentGame.mainChannel.send({
        content: '거부권 사용이 반려되었습니다.',
    })
    const { gameStatus } = currentGame;
    const chancellor = gameStatus.chancellor;
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
}