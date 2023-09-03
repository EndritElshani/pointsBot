const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { User } = require("../../schemas/user");
const Rank = require("../../schemas/rankSchema");
const { botChannel } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to check balance for.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  async execute(interaction) {
    if (interaction.channelId !== botChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${botChannel}>.`,
        ephemeral: true,
      });
    }

    const userID =
      interaction.options.getUser("user")?.id || interaction.user.id;
    const userData = await User.findOne({ id: userID });

    if (!userData) {
      return interaction.reply({
        content:
          "You must first receive points from an Administrator or select an alliance role with /role.",
        ephemeral: true,
      });
    }
    // Update the user's rank based on their current rank points
    const rank = await Rank.findOne({
      pointsNeeded: { $lte: userData.rankPoints },
    })
      .sort({ pointsNeeded: -1 })
      .select({ name: 1, pointsNeeded: 1 })
      .exec();
    if (rank && rank.name !== userData.rank) {
      userData.rank = rank.name;
      await userData.save();
    }
    const userAvatar =
      interaction.options
        .getUser("user")
        ?.displayAvatarURL({ dynamic: true }) ||
      interaction.user.displayAvatarURL({ dynamic: true });
    const targetUser = interaction.options.getUser("user");
    const username = targetUser
      ? targetUser.username
      : interaction.member.displayName;
    const balanceEmbed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`🧮 Balance of \`${username}\``)
      .setDescription(" ")
      .setThumbnail(userAvatar)
      .addFields(
        {
          name: "🎖️ Rank Ps",
          value: `\`${userData.rankPoints.toLocaleString()}\``,
          inline: true,
        },
        {
          name: "💰 Reward Ps",
          value: `\`${userData.rewardPoints.toLocaleString()}\``,
          inline: true,
        },
        {
          name: "📅 Monthly Ps",
          value: `\`${userData.monthlyPoints.toLocaleString()}\``,
          inline: true,
        },
        {
          name: "📚 Trivia Ps",
          value: `\`${userData.TriviaPoints.toLocaleString()}\``,
          inline: true,
        },
        {
          name: "🔄 Trivia Ps",
          value: `\`${userData.TriviaPointsEx.toLocaleString()}\``,
          inline: true,
        },
        {
          name: "🏅 Rank",
          value: `\`${userData.rank}\``,
          inline: true,
        }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [balanceEmbed] });
  },
};
