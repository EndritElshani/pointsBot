const { SlashCommandBuilder } = require("discord.js");
const { User } = require("../../schemas/user");
const { triviaChannel, botChannel } = process.env;
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("triviaexchange")
    .setDescription("Convert TriviaPoints to Kamas")
    .addNumberOption((option) =>
      option
        .setName("points")
        .setDescription("Number of TriviaPoints to convert")
        .setRequired(true)
    ),

  async execute(interaction) {
    const embed = new EmbedBuilder();

    if (
      interaction.channelId !== botChannel &&
      interaction.channelId !== subChannel
    ) {
      return interaction.reply({
        content: `This command can only be used in <#${botChannel}> or in <#${triviaChannel}>.`,
        ephemeral: true,
      });
    }
    const userID = interaction.user.id;
    const user = await User.findOne({ id: userID });

    if (!user) {
      return interaction.reply({
        content: "You must first receive points.",
        ephemeral: true,
      });
    }

    const triviaPointsEx = user.TriviaPointsEx;
    const pointsToConvert = interaction.options.getNumber("points");

    if (pointsToConvert > triviaPointsEx) {
      return interaction.reply({
        content: "Insufficient Trivia Points to perform the exchange.",
        ephemeral: true,
      });
    }

    const convertedMoney = pointsToConvert * 100000;
    const remainingTriviaPointsEx = triviaPointsEx - pointsToConvert;

    // Update user's TriviaPointsEx
    user.TriviaPointsEx = remainingTriviaPointsEx;
    await user.save();

    return interaction.reply({
      embeds: [
        embed
        .setTitle(`🔄 Trivia Points Exchange`)
        .setDescription(
          `${
            interaction.user
          }, please inform one of our Admins to collect ${convertedMoney.toLocaleString()} Kamas!\nYou now have **${remainingTriviaPointsEx}** Trivia Points left.`
        ),
      ],
    });
  },
};
