require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const OWNER_ID = "535796365192724480";
const DEFAULT_COLOR = 0x3498db;

client.once('ready', () => console.log(`✅ Bot ${client.user.tag} online!`));

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand() && interaction.commandName === 'announce') {
    if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: "🚫 Cuma owner.", ephemeral: true });

    const modal = new ModalBuilder().setCustomId('announceModal').setTitle('Create Announcement');

    const channelInput = new TextInputBuilder().setCustomId('channelId').setLabel("Channel ID / Mention").setStyle(TextInputStyle.Short).setRequired(true);
    const titleInput = new TextInputBuilder().setCustomId('title').setLabel("Judul Embed").setStyle(TextInputStyle.Short).setRequired(true);
    const contentInput = new TextInputBuilder().setCustomId('content').setLabel("Isi / Pesan Embed").setStyle(TextInputStyle.Paragraph).setRequired(true);
    const thumbnailInput = new TextInputBuilder().setCustomId('thumbnail').setLabel("Thumbnail URL (opsional)").setStyle(TextInputStyle.Short).setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(channelInput),
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(contentInput),
      new ActionRowBuilder().addComponents(thumbnailInput)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'announceModal') {
    if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: "🚫 Tidak boleh submit.", ephemeral: true });

    const channelId = interaction.fields.getTextInputValue('channelId').replace(/[<#>]/g, '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return interaction.reply({ content: '⚠️ Channel tidak valid.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(interaction.fields.getTextInputValue('title'))
      .setDescription(interaction.fields.getTextInputValue('content'))
      .setColor(DEFAULT_COLOR)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: `Pengirim ID: ${interaction.user.id}` })
      .setTimestamp();

    const thumbnail = interaction.fields.getTextInputValue('thumbnail');
    if (thumbnail) embed.setThumbnail(thumbnail);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Announcement berhasil dikirim ke <#${channel.id}>!`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
