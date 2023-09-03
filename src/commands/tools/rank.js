const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const Rank = require("../../schemas/rankSchema");
  const { botChannel, subChannel } = process.env;
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("rank")
      .setDescription("Add, remove, or view ranks.")
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription("Show the list of available ranks.")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a new rank.")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("The name of the rank.")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("points-needed")
              .setDescription(
                "The number of points required to achieve the rank."
              )
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Remove an existing rank.")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("The name of the rank to be removed.")
              .setRequired(true)
          )
      ),
    async execute(interaction) {
      if (interaction.channelId !== botChannel && interaction.channelId !== subChannel) {
        return interaction.reply({
          content: `This command can only be used in <#${botChannel}> or in <#${subChannel}>.`,
          ephemeral: true,
        });
      }
      const subcommand = interaction.options.getSubcommand();
  
      if (subcommand === "list") {
        const ranks = await Rank.find().sort({ pointsNeeded: -1 });
        if (ranks.length === 0) {
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription("There are no ranks defined.");
          return interaction.reply({ embeds: [embed] });
        }
        const rankList = ranks
          .map((rank) => `**${rank.name}** - \`${rank.pointsNeeded}\` points`)
          .join("\n");
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("Available Ranks")
          .setDescription(rankList);
        return interaction.reply({ embeds: [embed] });
      }
  
      if (subcommand === "add") {
        const name = interaction.options.getString("name");
        const pointsNeeded = interaction.options.getInteger("points-needed");
  
        // Check if a rank with the same pointsNeeded already exists
        const existingRank = await Rank.findOne({ pointsNeeded });
        if (existingRank) {
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Rank Already Exists")
            .setDescription(
              `A rank with \`${pointsNeeded}\` points needed already exists.`
            );
          return interaction.reply({ embeds: [embed] });
        }
  
        // Check if a rank with the same name already exists
        const nameRank = await Rank.findOne({ name });
        if (nameRank) {
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Rank Already Exists")
            .setDescription(`\`${name}\` already exists as a rank.`);
          return interaction.reply({ embeds: [embed] });
        }
  
        // Create a new rank
        const newRank = new Rank({ name, pointsNeeded });
        await newRank.save();
  
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("Rank Added")
          .setDescription(
            `\`${name}\` has been added as a new rank with \`${pointsNeeded}\` points needed.`
          );
        return interaction.reply({ embeds: [embed] });
      }
  
      if (subcommand === "remove") {
        const name = interaction.options.getString("name");
  
        // Check if the rank exists
        const existingRank = await Rank.findOne({ name });
        if (!existingRank) {
          //return interaction.reply(`${name} does not exist as a rank.`);
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`\`${name}\` does not exist as a rank.`);
          return interaction.reply({ embeds: [embed] });
        }
  
        // Remove the rank
        try {
          await Rank.deleteOne({ name });
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`Rank \`${name}\` got deleted.`);
          return interaction.reply({ embeds: [embed] });
        } catch (error) {
          console.error(error);
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`There was an error removing \`${name}\`.`);
          return interaction.reply({ embeds: [embed] });
        }
      }
    },
  };
  