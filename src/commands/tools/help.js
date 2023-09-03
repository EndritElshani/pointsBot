const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const { botChannel, subChannel } = process.env;
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("Shows information about the bot")
      .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  
    async execute(interaction) {
      if (interaction.channelId !== botChannel && interaction.channelId !== subChannel) {
        return interaction.reply({
          content: `This command can only be used in <#${botChannel}> or in <#${subChannel}>.`,
          ephemeral: true,
        });
      }
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(":robot: Bot Information")
        .setDescription(
          "This Bot helps manage this alliance's points. \nHere's a list of available commands and their descriptions:"
        )
        .addFields({ name: "Command List", value: "-------------" })
        .setFooter({
          text: "Thank you for using this bot! Contact Grougal [Endrit#8767] for more information.",
        });
  
      const commands = interaction.client.commands;
      commands.forEach((command) => {
        embed.addFields({
          name: `:white_small_square: \`${command.data.name}\``,
          value: `:small_orange_diamond: ${command.data.description}`,
          inline: true,
        });
      });
  
      await interaction.reply({ embeds: [embed] });
    },
  };
  