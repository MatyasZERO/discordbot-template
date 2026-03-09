import { Client, GatewayIntentBits, EmbedBuilder, Collection, ModalSubmitInteraction, GuildMember, ChatInputCommandInteraction, ButtonInteraction, ActivityType, ActivityOptions } from 'discord.js'
import { defLog } from "streamlogs"
import "dotenv/config"
import fs from "node:fs"
import path from "node:path"

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildIntegrations,
        // Insert all intents here
    ]
})
const Timeout = new Set<string>()
client.slash = new Collection<string, Command>()
client.modals = new Collection<string, Modal>()
client.buttons = new Collection<string, Button>()
const commands: Command[] = []

if(fs.existsSync("./commands")) {
    fs.readdirSync("./commands").forEach(async (item) => {
        if(fs.lstatSync(path.resolve("commands", item)).isDirectory()) {
            fs.readdirSync(path.resolve("commands", item)).forEach(async (item2) => {
                commands.push((await import(path.resolve("commands", item, item2))).command)
            })
        } else {
            commands.push((await import("./commands/" + item)).command)
        }
    })
}

if(fs.existsSync("./modals")) {
    fs.readdirSync("./modals").forEach(async (item) => {
        const modal = ((await import(path.resolve("modals", item))).modal)
        client.modals.set(modal.name, modal)
        defLog.info(modal.name + " loaded!", "modal-loader")
    })
}


if(fs.existsSync("./buttons")) {
    fs.readdirSync("./buttons").forEach(async (item) => {
        const button = ((await import(path.resolve("buttons", item))).button)
        client.buttons.set(button.name, button)
        defLog.info(button.name + " loaded!", "button-loader")
    })
}


setTimeout(() => {
    commands.forEach(cmd => {
        if(cmd.name) {
            client.slash.set(cmd.name, cmd)
            defLog.info(cmd.name + " loaded!", "cmd-loader")
        }
    })

    client.application.commands.set(commands.map(cmd => {
        return {
            name: cmd.name,
            description: cmd.description,
            options: cmd.options || [],
            defaultMemberPermissions: cmd.permissions
        }
    }))

    defLog.info("Loaded " + commands.length + " commands!", "cmd-loader")
}, 2000)








client.on("clientReady", () => {
    defLog.info(`Logged in as ${client.user.tag}!`, "App")
    const activity: ActivityOptions = {
        name: "Hello!",
        type: ActivityType.Playing
    }
    client.user.setActivity(activity)
    setInterval(() => {
        client.user.setActivity(activity)
    }, 1000 * 60 * 60)
})


client.on("interactionCreate", async (interaction) => {
    if(interaction.isButton()) {
        interaction as ButtonInteraction
        if(!client.buttons.has(interaction.customId)) return
        const button = client.buttons.get(interaction.customId)
        button.run(interaction, client)
    } else if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        if (!client.slash.has(interaction.commandName)) return
        if (!interaction.guild) return
        if (!interaction.isChatInputCommand()) return
        interaction as ChatInputCommandInteraction
        commandrun(interaction.commandName, interaction)
    } else if (interaction.isModalSubmit()) {
        interaction as ModalSubmitInteraction
        if(!client.modals.has(interaction.customId)) return
        const modal = client.modals.get(interaction.customId)
        modal.run(interaction, client)
    }

    async function commandrun(name, interaction: ChatInputCommandInteraction) {
        const command = client.slash.get(name)
        const member = interaction.member as GuildMember
        try {
            if (command.timeout) {
                if (Timeout.has(`${interaction.user.id}${command.name}`)) {
                    return interaction.reply({ content: `You need to wait **${command.timeout} ms** to use command again`, ephemeral: true })
                }
            }
            if (command.permissions) {
                if (!member.permissions.has(command.permissions)) {
                    return interaction.reply({ content: `:x: You need \`${command.permissions}\` to use this command`, ephemeral: true })
                }
            }
            command.run(interaction, client)
            Timeout.add(`${interaction.user.id}${command.name}`)
            setTimeout(() => {
                Timeout.delete(`${interaction.user.id}${command.name}`)
            }, command.timeout)
        } catch (error) {
            defLog.error(error, "App")
            await interaction.reply({ content: ":x: There was an error while executing this command!", ephemeral: true })
        }
    }
})


client.login(process.env.token)