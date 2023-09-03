const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { User } = require("../../schemas/user");
const { botChannel, subChannel } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reset-reward")
    .setDescription("Resets all users' reward points to 0.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    if (interaction.channelId !== botChannel && interaction.channelId !== subChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${botChannel}> or in <#${subChannel}>.`,
        ephemeral: true,
      });
    }
    try {
      await User.updateMany({}, { rewardPoints: 0 });
      await interaction.reply("All users' reward points have been reset to 0.");
    } catch (error) {
      console.error(error);
      await interaction.reply(
        "An error occurred while resetting reward points."
      );
    }
  },
};
