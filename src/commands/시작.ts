import { MessageEmbed } from 'discord.js';
import {ICommand} from 'WOKCommands';
import { Game_room } from '../Game_room';
import { active_games } from '../state';

const start : ICommand = {
    category: 'joining',
    description: '참가할 수 있는 게임을 만듭니다. 같은 채널에 이미 시작한 게임이 있다면 사용할 수 없습니다.',
    slash: true,
    callback: ({ interaction }) => {
        const channelOfMessage = interaction.channel;
        if (!channelOfMessage)
            return ;
        if (active_games.get(interaction.channelId)) {
            channelOfMessage.send(`이미 시작한 게임이 존재합니다.`);
            return ;
        }
        active_games.set(interaction.channelId, new Game_room(interaction.user, interaction.channel));
        const embed = new MessageEmbed()
        .setTitle('시크릿 히틀러에 오신 것을 환영합니다!')
        .setDescription('게임에 참가하시려면 /참가 를 입력해주세요.')
        channelOfMessage.send({embeds: [embed]});  
    }
}

export default start;