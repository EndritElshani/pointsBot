const fs = require("fs");
const { User } = require("../../schemas/user");
const { EmbedBuilder } = require("discord.js");
const { triviaChannel, guildId } = process.env;

let pickedQuestions = [];
const embed = new EmbedBuilder();

module.exports = {
  name: "ready",
  async execute(client) {
    function getRandomQuestion() {
      const data = fs.readFileSync("./src/events/client/triviaQuestions.json");
      const questions = JSON.parse(data).questions;

      if (pickedQuestions.length === questions.length) {
        pickedQuestions = [];
        const channel = client.channels.cache.get(triviaChannel);
        if (channel) {
          channel.send({
            embeds: [
              embed
                .setDescription(
                  `All questions have been answered! We are starting over!`
                )
                .setColor("Random"),
            ],
          });
        }
      }

      let availableQuestions = questions.filter(
        (question) => !pickedQuestions.includes(question.question)
      );

      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const randomQuestion = availableQuestions[randomIndex];

      pickedQuestions.push(randomQuestion.question);

      return randomQuestion;
    }
    function getRandomDelay() {
      const firstQuestionDelay =
        Math.random() * (5 * 1000 - 1 * 1000) + 1 * 1000;
      const nextQuestionDelay =
        Math.random() * (5 * 1000 - 2 * 1000) + 2 * 1000;

      return pickedQuestions.length === 0
        ? firstQuestionDelay
        : nextQuestionDelay;
    }

    async function sendRandomQuestion() {
      const randomQuestion = getRandomQuestion();
      const channel = client.channels.cache.get(triviaChannel);
      if (channel) {
        try {
          const guild = client.guilds.cache.get(guildId);
          const role = guild.roles.cache.find((role) => role.name === "Trivia");
          const mention = role ? role : "@Trivia";
          const message = await channel.send({
            embeds: [
              embed
                .setTitle(`📚 Trivia Quiz!`)
                .setDescription(`${mention} ${randomQuestion.question}`)
                .setColor("Random"),
            ],
          });

          const collector = channel.createMessageCollector({
            filter: (msg) => msg.author.id !== client.user.id,
            time: 10000,
          });
          let check = true;

          collector.on("collect", async (message) => {
            const userAnswer = message.content.toLowerCase();
            const correctAnswer = randomQuestion.answer.toLowerCase();
            const aliases = randomQuestion.aliases.map((alias) =>
              alias.toLowerCase()
            );

            if (aliases.includes(userAnswer) || userAnswer === correctAnswer) {
              const allCorrectAnswers = [
                randomQuestion.answer,
                ...randomQuestion.aliases,
              ].join(" | ");
              channel.send({
                embeds: [
                  embed.setDescription(
                    `Congratulations ${message.author}!\nThe possible answer(s) to the question *${randomQuestion.question}*:\n**${allCorrectAnswers}**.\nYou gained 1 Trivia Point!`
                  ),
                ],
              });

              // Add 1 point to the user's rewardPoints
              const user =
                (await User.findOne({ id: message.author.id })) ||
                new User({ id: message.author.id });
              if (user) {
                user.TriviaPoints += 1; 
                user.TriviaPointsEx += 1; 
                await user.save();
              }

              collector.stop();
            } else {
              check = false;
            }
          });

          collector.on("end", (collected) => {
            if (collected.size === 0) {
              channel.send({
                embeds: [
                  embed
                    .setDescription(`${mention} Time out! No answer was given.`)
                    .setColor("Random"),
                ],
              });
            } else if (check === false) {
              const allCorrectAnswers = [
                randomQuestion.answer,
                ...randomQuestion.aliases,
              ].join(" | ");
              channel.send({
                embeds: [
                  embed
                    .setDescription(
                      `${mention} Time out! No correct answers were given.\nThe possible answer(s):\n**${allCorrectAnswers}**.\nSee you the next time!`
                    )
                    .setColor("Random"),
                ],
              });
            } else if (check === true) {
              channel.send({
                embeds: [
                  embed
                    .setDescription(
                      `${mention} This Trivia Quiz has ended.\nSee you the next time!`
                    )
                    .setColor("Random"),
                ],
              });
            }
            const delay = getRandomDelay();
            setTimeout(sendRandomQuestion, delay);
          });
        } catch (error) {
          console.error("Failed to send question:", error);
          const delay = getRandomDelay();
          setTimeout(sendRandomQuestion, delay);
        }
      }
    }

    const delay = getRandomDelay();
    setTimeout(sendRandomQuestion, delay);
  },
};
