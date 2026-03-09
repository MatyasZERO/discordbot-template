import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChatInputCommandInteraction
} from "discord.js";

export const command: Command = {
  name: "embed",
  description: "Creates embed messages",
  permissions: "Administrator",
  timeout: 5000,

  async run(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("embedmodal")
      .setTitle("Embed Builder");

    const rows = [
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("embed-title")
          .setLabel("Title")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),

      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("embed-color")
          .setLabel("Color")
          .setPlaceholder("#000000")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),

      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("embed-text")
          .setLabel("Text")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),

      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("embed-url")
          .setLabel("URL")
          .setPlaceholder("https://example.com")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),

      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("embed-thumbnail")
          .setLabel("Thumbnail URL")
          .setPlaceholder("https://example.com/image.jpg")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
    ];

    modal.components.push(...rows);

    await interaction.showModal(modal);
  }
};