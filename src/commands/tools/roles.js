const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const { User } = require("../../schemas/user");
  const { botChannel } = process.env;
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("roles")
      .setDescription("Select your role from the list.")
      .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
      .addStringOption((option) =>
        option
          .setName("role")
          .setDescription("The role to select.")
          .setRequired(true)
          .addChoices(
            { name: "Champion", value: "Champion" },
            { name: "Seer", value: "Seer" },
            { name: "Scout", value: "Scout" },
            { name: "Healer", value: "Healer" },
            { name: "Sentinel", value: "Sentinel" },
            { name: "Undertaker", value: "Undertaker" },
            { name: "Cannon Fodder", value: "Cannon Fodder" }
          )
      ),
  
    async execute(interaction) {
      if (interaction.channelId !== botChannel) {
        return interaction.reply({
          content: `This command can only be used in <#${botChannel}>.`,
          ephemeral: true,
        });
      }
      const role = interaction.options.getString("role");
  
      const user = await User.findOneAndUpdate(
        { id: interaction.user.id },
        { selectedRole: role },
        { upsert: true, new: true }
      );
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(
          `Your alliance role has been set to \`${user.selectedRole}\`.`
        );
      return interaction.reply({ embeds: [embed] });
    },
  };
  