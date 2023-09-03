const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const user = require("../../schemas/user");
const { User } = require("../../schemas/user");
const { botChannel, subChannel } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Modify points for multiple members.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add points to multiple members.")
        .addStringOption((option) =>
          option
            .setName("user")
            .setDescription("Members to add points to. Separate the @tags with commas.")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("value")
            .setDescription("Value of points to add.")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove points from multiple members.")
        .addStringOption((option) =>
          option
            .setName("user")
            .setDescription("Members to remove points from. Separate the @tags with commas.")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("value")
            .setDescription("Value of points to remove.")
            .setRequired(true)
            .setMinValue(1)
        )
    ),

  async execute(interaction) {
  if (interaction.channelId !== botChannel && interaction.channelId !== subChannel) {
    return interaction.reply({
      content: `This command can only be used in <#${botChannel}> or in <#${subChannel}>.`,
      ephemeral: true,
    });
  }

  const mentionRegex = /<@!?(\d+)>/g;
  const mentions = interaction.options.getString("user").match(mentionRegex);
  if (!mentions || mentions.length === 0) {
    return interaction.reply({
      content: "Invalid user mention provided.",
      ephemeral: true,
    });
  }

  const value = interaction.options.getNumber("value");
  const embed = new EmbedBuilder().setColor("Random");

  await Promise.all(
    mentions.map(async (mention) => {
      const userID = mention.replace(/[\\<>@#&!]/g, "");
      const member = interaction.guild.members.cache.get(userID);

      try {
        const nickname = member?.nickname;

        const userData =
          (await User.findOne({ id: userID })) ||
          new User({ id: userID });
        if (nickname) {
          userData.name = nickname;
        } else {
          userData.name = member.user.tag;
        }
        if (interaction.options.getSubcommand() === "add") {
          userData.rewardPoints += value;
          userData.rankPoints += value;
          userData.monthlyPoints += value;
          await userData.save();
        } else if (interaction.options.getSubcommand() === "remove") {
          userData.rewardPoints -= value;
          userData.rankPoints -= value;
          userData.monthlyPoints -= value;
          await userData.save();
        }
        await userData.updateRank();
      } catch (error) {
        console.log(error);
      }
    })
  );

  if (interaction.options.getSubcommand() === "add") {
    return interaction.reply({
      embeds: [
        embed.setDescription(
          `🟩 Added \`${value}\` points to ${mentions.join(", ")}.`
        ),
      ],
    });
  } else if (interaction.options.getSubcommand() === "remove") {
    return interaction.reply({
      embeds: [
        embed.setDescription(
          `🟥 Removed \`${value}\` points from ${mentions.join(", ")}.`
        ),
      ],
    });
  }
}
}