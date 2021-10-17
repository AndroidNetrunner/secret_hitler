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
    if (user.bot)
        return
    const currentGame = active_games.get(reaction.message.channelId);
    if (currentGame) {
        if (user !== currentGame.president)
            return
        const chancellor = currentGame.emojis.get(reaction.emoji.toString());
        if (chancellor)
            currentGame.chancellor = chancellor;
        reaction.message.delete()
        startVote(reaction.message.channelId);
    }
})

client.login(process.env.TOKEN);