const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const { User } = require("../../schemas/user");
  const { botChannel, subChannel, guild } = process.env;
  const {
    pagination,
    ButtonTypes,
    ButtonStyles,
  } = require("@devraelfreeze/discordjs-pagination");
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("reward")
      .setDescription(
        "Displays all users and the amount of kamas and nuggets they will get based on their RPs."
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("normal-distribution")
          .setDescription(
            "Distribute the rewards to users between a min and a max value."
          )
          .addIntegerOption((option) =>
            option
              .setName("total-nuggets")
              .setDescription("The total of nuggets to calculate the ranking. ")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("total-kamas")
              .setDescription(
                "The total of kamas to calculate the ranking. If no Kamas, then insert 0."
              )
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("min")
              .setDescription("The minimal value of points required.")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("max")
              .setDescription(
                "The maximal value of points to be considered."
              )
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("max-distribution")
          .setDescription(
            "Distribute the rewards to users between a min and the value of the 1st-ranked user."
          )
          .addIntegerOption((option) =>
            option
              .setName("total-nuggets")
              .setDescription("The total of nuggets to calculate the ranking. ")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("total-kamas")
              .setDescription(
                "The total of kamas to calculate the ranking. If no Kamas, then insert 0."
              )
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("min")
              .setDescription("The minimal value of points required.")
              .setRequired(true)
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
  
      if (interaction.options.getSubcommand() === "normal-distribution") {
        const totalRewardKamas = interaction.options.getInteger("total-kamas");
        const totalRewardNuggets =
          interaction.options.getInteger("total-nuggets");
        const botValue = interaction.options.getInteger("min");
        const topValue = interaction.options.getInteger("max");
  
        // Leaderboard of users with more than botValue RewardPoints but less than topValue
        const leaderboard = await User.find(
          { rewardPoints: { $gte: botValue, $lte: topValue } },
          { rewardPoints: 1, name: 1 }
        ).sort({
          rewardPoints: -1,
        });
  
        if (leaderboard.length === 0) {
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`There are no users on the leaderboard yet.`);
  
          return interaction.reply({ embeds: [embed] });
        }
        const arrSize = 25;
        const sumRewardPointsBotGroup = leaderboard.reduce((total, user) => {
          if (user.rewardPoints >= botValue && user.rewardPoints < topValue) {
            return total + user.rewardPoints;
          }
          return total;
        }, 0);
  
        const chunkedLeaderboard = chunkArray(leaderboard, arrSize);
        const leaderboardEmbeds = [];
  
        await interaction.deferReply();
  
        for (let i = 0; i < chunkedLeaderboard.length; i++) {
          const leaderboardEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(
              `Rewards for ${totalRewardNuggets.toLocaleString()} Nuggets & ${totalRewardKamas.toLocaleString()} Kamas. \nMin: ${botValue.toLocaleString()}, Max: ${topValue.toLocaleString()}`
          )
          
            .setThumbnail("https://i.imgur.com/WvB8ZtS.png")
            .setTimestamp()
            .setDescription(
              chunkedLeaderboard[i]
                .map((user, index) => {
                  const rank = i * arrSize + index + 1;
                  const username = user.name || "Unknown";
                  const medal =
                    rank === 1
                      ? "🥇"
                      : rank === 2
                      ? "🥈"
                      : rank === 3
                      ? "🥉"
                      : " ";
                  const rankingScoreKamas = (
                    (user.rewardPoints / sumRewardPointsBotGroup) *
                    totalRewardKamas
                  ).toFixed(0);
                  const rankingScoreNuggets = (
                    (user.rewardPoints / sumRewardPointsBotGroup) *
                    totalRewardNuggets
                  ).toFixed(0);
                  return `${medal} \`${rank}.\` **${username}** - \`${rankingScoreNuggets}\` Ns - \`${rankingScoreKamas}\` Ks`;
                })
                .join("\n")
            );
          leaderboardEmbeds.push(leaderboardEmbed);
        }
        await pagination({
          embeds: leaderboardEmbeds /** Array of embeds objects */,
          author: interaction.member.user,
          interaction: interaction,
          ephemeral: true,
          time: 300000 /** 5 mins */,
          disableButtons: true /** Remove buttons after timeout */,
          fastSkip: false,
          pageTravel: false,
          customFilter: () => {
            return true;
          },
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
      } else if (interaction.options.getSubcommand() === "max-distribution") {
        const totalRewardKamas = interaction.options.getInteger("total-kamas");
        const totalRewardNuggets =
          interaction.options.getInteger("total-nuggets");
        const botValue = interaction.options.getInteger("min");
        //const topValue = 1000;
        const topUser = await User.findOne().sort({ rewardPoints: -1 });
        const topValue = topUser.rewardPoints + 1;
  
        // Leaderboard of users with more than botValue RewardPoints but less than topValue
        const leaderboard = await User.find(
          { rewardPoints: { $gte: botValue, $lte: topValue } },
          { rewardPoints: 1, name: 1 }
        ).sort({
          rewardPoints: -1,
        });
  
        if (leaderboard.length === 0) {
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`There are no users on the leaderboard yet.`);
  
          return interaction.reply({ embeds: [embed] });
        }
        const arrSize = 25;
        const sumRewardPointsBotGroup = leaderboard.reduce((total, user) => {
          if (user.rewardPoints >= botValue && user.rewardPoints < topValue) {
            return total + user.rewardPoints;
          }
          return total;
        }, 0);
  
        const chunkedLeaderboard = chunkArray(leaderboard, arrSize);
        const leaderboardEmbeds = [];
  
        await interaction.deferReply();
  
        for (let i = 0; i < chunkedLeaderboard.length; i++) {
          const leaderboardEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(
              `Rewards for ${totalRewardNuggets.toLocaleString()} Nuggets & ${totalRewardKamas.toLocaleString()} Kamas. \nMin: ${botValue.toLocaleString()}, Max: ${topValue.toLocaleString()}`
          )
          
            .setThumbnail("https://i.imgur.com/WvB8ZtS.png")
            .setTimestamp()
            .setDescription(
              chunkedLeaderboard[i]
                .map((user, index) => {
                  const rank = i * arrSize + index + 1;
                  const username = user.name || "Unknown";
                  const medal =
                    rank === 1
                      ? "🥇"
                      : rank === 2
                      ? "🥈"
                      : rank === 3
                      ? "🥉"
                      : " ";
                  const rankingScoreKamas = (
                    (user.rewardPoints / sumRewardPointsBotGroup) *
                    totalRewardKamas
                  ).toFixed(0);
                  const rankingScoreNuggets = (
                    (user.rewardPoints / sumRewardPointsBotGroup) *
                    totalRewardNuggets
                  ).toFixed(0);
                  return `${medal} \`${rank}.\` **${username}** - \`${rankingScoreNuggets}\` Ns - \`${rankingScoreKamas}\` Ks`;
                })
                .join("\n")
            );
          leaderboardEmbeds.push(leaderboardEmbed);
        }
        await pagination({
          embeds: leaderboardEmbeds /** Array of embeds objects */,
          author: interaction.member.user,
          interaction: interaction,
          ephemeral: true,
          time: 300000 /** 5 mins */,
          disableButtons: true /** Remove buttons after timeout */,
          fastSkip: false,
          pageTravel: false,
          customFilter: () => {
            return true;
          },
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
      }
    },
  };
  