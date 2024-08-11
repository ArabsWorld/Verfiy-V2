const {
    Client,
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    MessageAttachment,
} = require("discord.js");
const config = require("./config");
const { Captcha } = require("captcha-canvas");
const captcha = new Captcha();

/**
 *
 * @param {Client} client
 */
module.exports = async(client) => {
    // code
    client.on("interactionCreate", async(interaction) => {
        if (interaction.isCommand()) {
            if (interaction.commandName == "ping") {
                interaction.reply({
                    content: `Pong :: ${client.ws.ping}`,
                    ephemeral: true,
                });
            } else if (interaction.commandName == "setup") {
                if (!interaction.member.permissions.has("MANAGE_ROLES")) {
                    return interaction.reply({
                        content: `you don't have perms to run command`,
                        ephemeral: true,
                    });
                }

                let verifyChannel = interaction.guild.channels.cache.get(
                    config.verifyChannel
                );
                let verifyRole = interaction.guild.roles.cache.get(config.verifyRole);

                if (!verifyChannel || !verifyRole) {
                    return interaction.reply({
                        content: `verifyChannel and VerifyRole is not found`,
                        ephemeral: true,
                    });
                } else {
                    let embed = new MessageEmbed()
                        .setColor("BLURPLE")
                        .setTitle(`• Verification System of __${interaction.guild.name}__ <:WolfFire:1269992062099525664>\n• All you have to do is click on me **Verfiy Role**\n• If u need help: https://discord.com/channels/1262055464255094824/1269994137009258602`);

                    let btnrow = new MessageActionRow().addComponents([
                        new MessageButton()
                        .setCustomId(`v_ping`)
                        .setLabel("Ping Me")
                        .setStyle("PRIMARY")
                        .setEmoji("<a:1135895562076557463:1270004195646242847>"),
                        new MessageButton()
                        .setCustomId(`v_verify`)
                        .setLabel("Verify Role")
                        .setStyle("SUCCESS")
                        .setEmoji("<a:1135924776565747792:1270004207952461834>"),
                    ]);

                    await verifyChannel.send({
                        embeds: [embed],
                        components: [btnrow],
                    });

                    // changing permissions
                    let role = interaction.guild.roles.everyone;
                    interaction.guild.channels.cache
                        .filter((ch) => ch.id !== verifyChannel.id)
                        .forEach(async(ch) => {
                            // changing perms of every role
                            await ch.permissionOverwrites.edit(role, {
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                                READ_MESSAGE_HISTORY: false,
                                CONNECT: false,
                            });

                            // giving perms to client;
                            await ch.permissionOverwrites.edit(client.user.id, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                                READ_MESSAGE_HISTORY: true,
                                CONNECT: true,
                                MANAGE_CHANNELS: true,
                                MANAGE_ROLES: true,
                            });
                            // adding perms for verify role
                            await ch.permissionOverwrites.edit(verifyRole, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                                READ_MESSAGE_HISTORY: true,
                                CONNECT: true,
                            });
                        });
                    interaction.reply({
                        content: `Verification System Setup in ${verifyChannel} and Verify Role is ${verifyRole}`,
                        ephemeral: true,
                    });
                }
            } else {
                interaction.reply({
                    content: `${interaction.commandName} is not valid`,
                    ephemeral: true,
                });
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId == "v_ping") {
                return interaction.reply({
                    content: `**i am working fine** <a:__:1270003750353895445>`,
                    ephemeral: true,
                });
            } else if (interaction.customId == "v_verify") {
                // code
                let verifyRole = interaction.guild.roles.cache.get(config.verifyRole);
                if (!verifyRole) return;

                if (interaction.member.roles.cache.has(verifyRole.id)) {
                    return interaction.reply({
                        content: `**u have been verified** <a:tsdarthpepe82:1270006845762965534>`,
                        ephemeral: true,
                    });
                } else {
                    if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) {
                        return interaction.reply({
                            content: `**i don't have permission**`,
                            ephemeral: true,
                        });
                    }

                    // creatings captcha
                    captcha.async = true;
                    captcha.addDecoy();
                    captcha.drawTrace();
                    captcha.drawCaptcha();

                    const captchaImage = new MessageAttachment(
                        await captcha.png,
                        "captcha.png"
                    );

                    let cmsg = await interaction.user.send({
                        embeds: [
                            new MessageEmbed()
                            .setColor("BLUE")
                            .setTitle(`Captcha Verification`)
                            .setImage(`attachment://captcha.png`),
                        ],
                        files: [captchaImage],
                    });

                    interaction.reply({
                        content: `check your private bro <:rdekpanda:1270003630539538545>\nAnd u only have 60 seconds of time <a:1135895524076175420Copy:1270004191091359854>`,
                        ephemeral: true,
                    });

                    await cmsg.channel
                        .awaitMessages({
                            filter: (m) => m.author.id == interaction.user.id,
                            max: 1,
                            time: 1000 * 60,
                            errors: ["time"],
                        })
                        .then(async(value) => {
                            let isValid = value.first().content == captcha.text;
                            if (isValid) {
                                await interaction.member.roles.add(verifyRole).catch((e) => {});
                                interaction.user.send({
                                    content: `ur verified <a:1606verifystaff:1270003699669798955>`,
                                    ephemeral: true,
                                });
                                x
                            } else {
                                await interaction.user.send(
                                    `Your time here is up...u have to go to server __**${interaction.guild.name}**__ and try again`
                                );
                                interaction.member.kick().catch((e) => {});
                            }
                        })
                        .catch(async(e) => {
                            await interaction.user.send(
                                `Go here to see the rules: https://discord.com/channels/1262055464255094824/1262055998705893407`
                            );
                            interaction.member.kick().catch((e) => {});
                        });
                }
            }
        }
    });
};