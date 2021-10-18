import DiscordJS, { Intents, User } from 'discord.js';
import WOKCommands from 'wokcommands';
import path from 'path';
import dotenv from 'dotenv';
import { active_games } from './state';
import { startVote } from './start_vote';

dotenv.config()

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.on('ready', () => {
    console.log('The bot is ready');

    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: true,
    }).setDefaultPrefix('?');
})

client.on('messageReactionAdd', (reaction, user) => {

})

client.login(process.env.TOKEN);