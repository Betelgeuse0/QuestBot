const Discord = require('discord.js');
const DayPassed = require('./dateFunctions').DayPassed;

let quests = 
{
    //possible quests to pick
    questTemplates : 
    {
        easyJobs : ['make lava cast art',
                    'breed every kind of farm animal',
                    'farm every crop possible',
                    'find the edge of the world',
                    'show off a full suit of gold armor'
                    ],
        mediumJobs : ['get every kind of music disk', 
                      'give 4 players a diamond',
                      'kill the ender dragon',
                      'kill the whither',
                      'kill another player at least 200 blocks from spawn',
                      'make an ice farm',
                      'make an automatic mob farm',
                      'create a trident farm',
                      'kill a player'],
        hardJobs : ['enchant a full pair of diamond armor, then burn it',
                    'find an undiscovered player base and leak the coordinates',
                    'create a fully automatic villager breeder',
                    'create a fully automatic iron farm',
                    'create a fully automatic gold farm',
                    'kill 3 players and steal their drops'
                    ],
        easyRewards : ['1 stack of iron ingots', 
                       '32 gold ingots', 
                       'berry bush', 
                       'low level enchantment', 
                       'any two animals of choice',
                       'randomly spawned villager',
                       '16 bottles of enchanting',
                       'any plant or seeds of your choosing'
                       ],
        mediumRewards : ['1 diamond block', 
                         '6 golden apples', 
                         'medium level enchantment', 
                         'trident', 
                         '1 shulker box',
                         'horse armor of choice + saddle',
                         '2 emerald blocks',
                         '5 block border expansion',
                         '32 bottles of enchanting',
                         'totem of undying',
                         'any potion of choice'],
        hardRewards : ['open end portal at spawn', 
                       '10 enchanted gold apples',
                       'any monster spawner except bosses or shulkers',
                       'high level enchantment',
                       'beacon with gold blocks',
                       'ANY item of your choosing except a spawner',
                       '10 shulker boxes',
                       '20 block border expansion',
                       '10 stacks of bottles of enchanting',
                       '10 totems of undying',
                       'heart of the sea / conduit']
    },

    quests : [],
    submitted : [], //a list of the quests submitted with player name attached to the string who need reward
    channel : undefined,

    // a list of the quests players submitted. They expire after a week
    playerQuests : {
        quests : [],
        daysPassed : []
    },

    approved : [],      // a list of the players who earned rewards. resets daily
    date : undefined,

    Start : function(c) 
    {
        this.channel = c;
        this.Reset();
        this.channel.send("Quest System Started")
        this.Show();
        console.log("Quest System Started");
    },

    Reset : function(message) 
    {
        //bypass if message is undefined
        if (message !== undefined && !this.CheckAdmin(message)) {
            return false;
        }

        this.date = new Date();
        this.approved = [];
        this.submitted = [];
        this.playerQuests.quests = [];
        this.playerQuests.daysPassed = [];

        let easy = "Job: " + this.questTemplates.easyJobs[Math.floor(Math.random() * this.questTemplates.easyJobs.length)];
        easy += "\nReward: " + this.questTemplates.easyRewards[Math.floor(Math.random() * this.questTemplates.easyRewards.length)];

        let medium = "Job: " + this.questTemplates.mediumJobs[Math.floor(Math.random() * this.questTemplates.mediumJobs.length)];
        medium += "\nReward: " + this.questTemplates.mediumRewards[Math.floor(Math.random() * this.questTemplates.mediumRewards.length)];

        let hard = "Job: " + this.questTemplates.hardJobs[Math.floor(Math.random() * this.questTemplates.hardJobs.length)];
        hard += "\nReward: " + this.questTemplates.hardRewards[Math.floor(Math.random() * this.questTemplates.hardRewards.length)];

        this.quests = []; //empty array
        this.quests.push(easy);
        this.quests.push(medium);
        this.quests.push(hard);

        return true;
    },

    ResetDaily : function() 
    {
        if (DayPassed(this.date) && this.Reset()) {
            console.log("Performed daily reset");
            this.channel.send("Performed daily reset");
            this.Show();
        }
    },

    //reads commands
    Read : function(message) 
    {
        let m = message.content;
        m = m.toLowerCase();

        let words = m.split(' ');

        if (words[0] !== '!quest') {
            return;
        }

        let command = words[1];
        let questNum = parseInt(words[2]);

        if (command == 'help') {
            this.Help(message);
        }
        else if (command == 'show') {
            this.Show();
        }
        else if (command == 'submit') {
            this.Submit(message, questNum);
        }
        else if (command == 'submissions') {
            this.ShowSubmissions(message);
        }
        else if (command == 'approved') {
            this.ShowApproved(message);
        }
        else if (command == 'approve') {
            //admin command
            this.Approve(message, questNum); 
        }
        else if (command == 'reset') {
            //admin command
            if (this.Reset(message)) {
                message.channel.send("Quests system has been reset");
            }
        }
        else {
            //invalid command
            this.Warn(message, 'invalid command');
        }
    },

    Help : function(message) 
    {
        let m = "always type !quest before using the following commands ->\n\n";
        m +=    "universal commands:\n";
        m +=    "show - show's the quests currently in progress \n";
        m +=    "submit [quest number] - submits a quest for review \n";
        m +=    "submissions - shows the submissions in progress \n";
        m +=    "approved - shows all the approved submissions \n";
        m +=    "\nadmin commands:\n";
        m +=    "approve [submission number] - approves a submission for reward \n";
        m +=    "reset - shuffles quests and clears submissions \n";

        message.channel.send(m);
    },

    Show : function() 
    {
        if (this.quests.length == 0) {
            this.channel.send("No current quests active");
            return;
        }

        let m = 'Daily Quests\n';
        m += '-----------------\n';
        m += 'EASY\n' + this.quests[0];
        m += '\n\nMEDIUM\n' + this.quests[1];
        m += '\n\nHARD\n' + this.quests[2];

        this.channel.send(m);
    },

    ShowSubmissions : function(message) 
    {
        if (this.submitted.length == 0) {
            message.channel.send("No current submissions active");
            return;
        }

        let m = 'Submissions\n';
        m +=    '-----------\n';
        for (let i = 0; i < this.submitted.length; i++)
        {
            m += (i + 1) + '. ' + this.submitted[i] + '\n';
        }
        message.channel.send(m);
    },

    ShowApproved : function(message) 
    {
        if (this.approved.length == 0) {
            message.channel.send("No current approved submissions active");
            return;
        }

        let m = 'Approved Submissions\n';
        m +=    '--------------------\n';
    
        for (let i = 0; i < this.approved.length; i++)
        {
            m += (i + 1) + '. ' + this.approved[i] + '\n';
        }
        message.channel.send(m);
    },

    Submit : function(message, n) 
    {
        if (!this.CheckQuestValid(message, n)) {
            return;
        }

        let user = message.member.user.username;
        this.submitted.push(user + ": " + "quest no. " + n);
        let m = "Thank you " + user + "\nYour submission has been submitted for further review.";
        m += "\nPlease post evidence of your submission below if not done already.";

        message.channel.send(m);
    },

    Approve : function(message, n) 
    {
        //only admin has access 
        if (!this.CheckAdmin(message) || !this.CheckSubmissionValid(message, n)) {
            return;
        }
        
        let m = "submission: '" + this.submitted[n - 1] + "' has been approved. :)";
        message.channel.send(m);

        this.approved.push(this.submitted[n - 1]);
        this.submitted.splice(n - 1, 1);
    },

    CheckQuestValid(message, n) 
    {
        if (this.quests.length == 0) {
            this.Warn(message, "no current quests active");
            return;
        }

        n -= 1;
        let valid = !(n === undefined || isNaN(n) || n < 0 || n >= this.quests.length);

        if (!valid) {
            this.Warn(message, "invalid quest number entered");
        }
        return valid;
    },

    CheckSubmissionValid(message, n)
    {
        if (this.submitted.length == 0) {
            this.Warn(message, "no current submissions active");
            return;
        }

        n -= 1;
        let valid = !(n === undefined || isNaN(n) || n < 0 || n >= this.submitted.length );

        if (!valid) {
            this.Warn(message, "invalid submission number entered");
        }
        return valid;
    },

    CheckAdmin(message)
    {
        let adminRole = message.guild.roles.cache.find(r => r.name === "admin");
        let isAdmin = message.member.roles.cache.has(adminRole.id);

        if (!isAdmin) {
            this.Warn(message, "Only admins have access to this command");
        }

        return isAdmin;
    },

    Warn(message, m) {
        m = 'ERROR: ' + m.toUpperCase();
        message.channel.send(m);
    }
};

exports.quests = quests;