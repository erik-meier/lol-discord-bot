# RiftGuardian

[![discord.js](https://img.shields.io/github/package-json/dependency-version/erik-meier/lol-discord-bot/discord.js)](https://discord.js.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/erik-meier/lol-discord-bot.svg)](https://github.com/erik-meier/lol-discord-bot/stargazers)
[![Pull Requests](https://img.shields.io/badge/Pull%20Requests-Welcome!-brightgreen)](https://github.com/erik-meier/lol-discord-bot/pulls)

**RiftGuardian** - A comprehensive League of Legends Discord bot for competitive gameplay and esports.

## Introduction

RiftGuardian is a comprehensive League of Legends Discord bot designed to enhance your competitive gameplay and esports experience. Whether you're a casual player looking to improve or a competitive team preparing for tournaments, RiftGuardian provides powerful tools for game analysis, team coordination, and community management.

Built with TypeScript and discord.js v14, RiftGuardian offers scalable architecture with built-in sharding and clustering capabilities to handle servers of any size.

## Features

### League of Legends Features:

- Champion analysis and builds optimization
- Match history tracking and statistics
- Team composition recommendations
- Tournament and scrim organization tools
- Esports news and updates
- Rank tracking and progression monitoring

### Discord Bot Features:

- Slash commands with autocomplete
- Rate limits and command cooldowns
- Welcome message when joining a server
- Shows server count in bot status
- Multi-language support
- Comprehensive permission system

### Developer Friendly:

- Written with TypeScript
- Uses the [discord.js](https://discord.js.org/) framework
- Built-in debugging setup for VSCode
- Written with [ESM](https://nodejs.org/api/esm.html#introduction) for future compatibility with packages
- Support for running with the [PM2](https://pm2.keymetrics.io/) process manager
- Support for running with [Docker](https://www.docker.com/)

### Scales as Your Bot Grows:

- Supports [sharding](https://discordjs.guide/sharding/) which is required when your bot is in 2500+ servers
- Supports clustering which allows you to run your bot on multiple machines

## Commands

RiftGuardian includes powerful League of Legends-focused commands alongside essential Discord bot functionality.

### Help Command

A `/help` command to get help on different areas of the bot or to contact support:

![](https://i.imgur.com/UUA4WzL.png)

![](https://i.imgur.com/YtDdmTe.png)

![](https://i.imgur.com/JXMisap.png)

### Info Command

A `/info` command to get information about RiftGuardian or links to different resources.

![](https://i.imgur.com/0kKOaWM.png)

### Test Command

A generic command, `/test`, which can be copied to create additional commands.

![](https://i.imgur.com/lqjkNKM.png)

### Dev Command

A `/dev` command which can only be run by the bot developer. Shows developer information and can be extended to perform developer-only actions.

![](https://i.imgur.com/2o1vEno.png)

### Welcome Message

A welcome message is sent to the server and owner when RiftGuardian is added.

![](https://i.imgur.com/QBw8H8v.png)

## Setup

1. Copy example config files.
    - Navigate to the `config` folder of this project.
    - Copy all files ending in `.example.json` and remove the `.example` from the copied file names.
        - Ex: `config.example.json` should be copied and renamed as `config.json`.
2. Obtain a bot token.
    - You'll need to create a new bot in your [Discord Developer Portal](https://discord.com/developers/applications/).
        - See [here](https://www.writebots.com/discord-bot-token/) for detailed instructions.
        - At the end you should have a **bot token**.
3. Modify the config file.
    - Open the `config/config.json` file.
    - You'll need to edit the following values:
        - `client.id` - Your discord bot's [user ID](https://techswift.org/2020/04/22/how-to-find-your-user-id-on-discord/).
        - `client.token` - Your discord bot's token.
4. Install packages.
    - Navigate into the downloaded source files and type `npm install`.
5. Register commands.
    - In order to use slash commands, they first [have to be registered](https://discordjs.guide/creating-your-bot/command-deployment.html).
    - Type `npm run commands:register` to register RiftGuardian's commands.
        - Run this script any time you change a command name, structure, or add/remove commands.
        - This is so Discord knows what your commands look like.
        - It may take up to an hour for command changes to appear.

## Start Scripts

You can run RiftGuardian in multiple modes:

1. Normal Mode
    - Type `npm start`.
    - Starts a single instance of RiftGuardian.
2. Manager Mode
    - Type `npm run start:manager`.
    - Starts a shard manager which will spawn multiple RiftGuardian shards.
3. PM2 Mode
    - Type `npm run start:pm2`.
    - Similar to Manager Mode but uses [PM2](https://pm2.keymetrics.io/) to manage processes.

## Contributing

RiftGuardian is open source and welcomes contributions! Whether you're interested in adding new League of Legends features, improving existing functionality, or fixing bugs, your help is appreciated.

Feel free to:
- Submit bug reports and feature requests
- Create pull requests for improvements
- Suggest new League of Legends integrations
- Help with documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
