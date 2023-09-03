const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const { User } = require("../../schemas/user");
  const { botChannel, subChannel } = process.env;
  const {
    pagination,
    ButtonTypes,
    ButtonStyles,
  } = require("@devraelfreeze/discordjs-pagination");
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("Displays the top users based on their points.")
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("The type of points to display.")
          .setRequired(true)
          .addChoices(
            { name: "Reward Points", value: "rewardPoints" },
            { name: "Rank Points", value: "rankPoints" },
            { name: "Trivia Points", value: "TriviaPoints" },
            { name: "Monthly Points", value: "monthlyPoints" }
          )
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
  
    async execute(interaction) {
      if (
        interaction.channelId !== botChannel &&
        interaction.channelId !== subChannel
      ) {
        return interaction.reply({
          content: `This command can only be used in <#${botChannel}> or in <#${subChannel}>.`,
          ephemeral: true,
        });
      }
      const pointType = interaction.options.getString("type");
      let sortField, title, thumbnail;
      switch (pointType) {
        case "rewardPoints":
          sortField = "rewardPoints";
          title = "Reward Points Leaderboard";
          thumbnail = "https://i.imgur.com/51ulR5H.png";
          break;
        case "rankPoints":
          sortField = "rankPoints";
          title = "Rank Points Leaderboard";
          thumbnail = "https://i.imgur.com/081eyuU.png";
          break;
        case "monthlyPoints":
          sortField = "monthlyPoints";
          title = "Monthly Points Leaderboard";
          thumbnail = "https://i.imgur.com/1k2dHNR.png";
          break;
          case "TriviaPoints":
          sortField = "TriviaPoints";
          title = "Trivia Points Leaderboard";
          break;
        default:
          return interaction.reply("Invalid point type.");
      }
  
      const leaderboard = await User.find().sort({ [sortField]: -1 });
      //.limit(30);
      if (leaderboard.length === 0) {
        //return interaction.reply("There are no users on the leaderboard yet.");
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setDescription(`There are no users on the leaderboard yet.`);
        return interaction.reply({ embeds: [embed] });
      }
      const arrSize = 25;
      const chunkedLeaderboard = chunkArray(leaderboard, arrSize);
      const leaderboardEmbeds = [];
      await interaction.deferReply();
  
      for (let i = 0; i < chunkedLeaderboard.length; i++) {
        const leaderboardEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(title)
          .setThumbnail(thumbnail)
          .setTimestamp()
          .setDescription(
            chunkedLeaderboard[i]
              .map((user, index) => {
                const rank = i * arrSize + index + 1;
                const username =
                  interaction.guild.members.cache.get(user.id)?.displayName ||
                  "Unknown";
                const medal =
                  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : " ";
                return `${medal} \`${rank}.\` **${username}** - \`${
                  user[sortField]
                }\` ${pointType.charAt(0).toUpperCase() + pointType.slice(1)}`;
              })
              .join("\n")
          );
        leaderboardEmbeds.push(leaderboardEmbed);
      }
      await pagination({
        embeds: leaderboardEmbeds /** Array of embeds objects */,
        author: interaction.member.user,
        interaction: interaction,
        //ephemeral: true,
        time: 300000 /** 5 mins */,
        disableButtons: true /** Remove buttons after timeout */,
        fastSkip: false,
        pageTravel: false,
        customFilter: () => {return true},
        buttons: [
          {
            type: ButtonTypes.previous,
            label: "Previous Page",
            style: ButtonStyles.Primary,
          },
          {
            type: ButtonTypes.next,
            label: "Next Page",
            style: ButtonStyles.Success,
          },
        ],
      });
      function chunkArray(arr, chunkSize) {
        const chunkedArr = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
          chunkedArr.push(arr.slice(i, i + chunkSize));
        }
        return chunkedArr;
      }
    },
  };
  