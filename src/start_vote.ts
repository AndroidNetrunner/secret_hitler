import { MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js';
import { Game_room } from './Game_room';
import {active_games} from './state';
import { readVotes } from './read_votes';
export const startVote = async (channelId: string) => {
    const currentGame = active_games.get(channelId) as Game_room;
    const players = currentGame.players as User[];
    const president = currentGame.president as User;
    const chancellor = currentGame.chancellor as User;
    for (let player of players) {
        const embed = new MessageEmbed()
        .setTitle('이제 내각에 관한 투표를 할 시간입니다.')
        .setDescription(`대통령 후보: ${president.username}, 수상 후보: ${chancellor.username}`)
        .setFields({
            name: "투표는 아래 버튼을 통해 이루어집니다.",
            value: "찬성한다면 찬성 버튼을, 반대한다면 반대 버튼을 눌러주세요!"
        });
        const messageRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('agree')
            .setLabel('찬성')
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('disagree')
            .setLabel('반대')
            .setStyle('DANGER')
        );
        const message = await player.send({
            embeds: [embed],
            components: [messageRow],
        })

        const collector = player.dmChannel?.createMessageComponentCollector({
            max: 1,
        });
        collector?.on('collect', (interaction) => {
            let content: string | null = null;
            if (interaction.customId === 'agree') {
                content = "찬성에 투표하셨습니다.";
                currentGame.agree.push(interaction.user);
            }
            else {
                content = "반대에 투표하셨습니다.";
                currentGame.disagree.push(interaction.user);
            }
            message.edit({
                content: content,
                embeds: [],
                components: [],
            });
            readVotes(currentGame);
        });
    }
}