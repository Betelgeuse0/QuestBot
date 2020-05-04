const Discord = require('discord.js');
const Config = require('./config').config;
const Quests = require('./quests').quests;
const client = new Discord.Client();

client.once('ready', () => {
    Quests.Start(client.channels.cache.get(Config.channelID));
});

client.on('message', message => {
    if (message.channel.id === Config.channelID) {
        Quests.Read(message); 
    }
});

//check every hour
client.setInterval(function () {
    Quests.ResetDaily();
}, 1000 * 60 * 60); 

client.login(Config.token);


