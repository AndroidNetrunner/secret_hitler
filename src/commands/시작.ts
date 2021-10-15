import { MessageEmbed } from 'discord.js';
import {ICommand} from 'WOKCommands';
import { Game_room } from '../Game_room';
import { active_games } from '../state';

const start : ICommand = {
    category: 'joining',
    description: 'creating new game',
    callback: ({ message }) => {
        const channelOfMessage = message.channel;
        if (active_games.get(message.channelId)) {
            channelOfMessage.send(`이미 시작한 게임이 존재합니다.`);
            return
        }
        active_games.set(message.channelId, new Game_room(message.author));
        const embed = new MessageEmbed()
        .setTitle('시크릿 히틀러에 오신 것을 환영합니다!')
        .setDescription('게임에 참가하시려면 ?참가 를 입력해주세요.')
        channelOfMessage.send({embeds: [embed]});  
    }
}

export default start;