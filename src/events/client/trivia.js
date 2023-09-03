/*const fs = require("fs");
const { User } = require("../../schemas/user");

let pickedQuestions = [];

module.exports = {
  name: "ready",
  async execute(client) {
    function getRandomQuestion() {
      const data = fs.readFileSync("./src/events/client/triviaQuestions.json");
      const questions = JSON.parse(data).questions;

      if (pickedQuestions.length === questions.length) {
        pickedQuestions = [];
        const channel = client.channels.cache.get("1094917483871342602");
        if (channel) {
          channel.send(
            "All questions have been answered! We are starting over!"
          );
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
      // The first question is sent after a random delay between 1 to 8 hours (in milliseconds)
      const firstQuestionDelay =
        Math.random() * (8 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000) +
        1 * 60 * 60 * 1000;

      // The subsequent questions are sent after a random delay between 4 to 8 hours (in milliseconds)
      const nextQuestionDelay =
        Math.random() * (8 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000) +
        4 * 60 * 60 * 1000;

      return pickedQuestions.length === 0
        ? firstQuestionDelay
        : nextQuestionDelay;
    }

    async function sendRandomQuestion() {
      const randomQuestion = getRandomQuestion();
      const channel = client.channels.cache.get("1094917483871342602");
      if (channel) {
        try {
          const message = await channel.send(randomQuestion.question);

          const collector = channel.createMessageCollector({
            filter: (msg) => msg.author.id !== client.user.id,
            time: 10000,
          });
          let check = true;

          collector.on("collect", async (message) => {
            if (
              message.content.toLowerCase() ===
              randomQuestion.answer.toLowerCase()
            ) {
              channel.send(
                `Congratulations ${message.author}! **${randomQuestion.answer}** was the right answer to the question **"${randomQuestion.question}"**.\nYou gained 1 Trivia Point!`
              );

              // Add 1 point to the user's rewardPoints
              const user =
                (await User.findOne({ id: message.author.id })) ||
                new User({ id: message.author.id });
              if (user) {
                user.TriviaPoints += 1; // Only growing Trivia points for rankings.
                user.TriviaPointsEx += 1; // Exchangeable Trivia points for money.
                await user.save();
              }

              collector.stop();
            } else if (
              message.content.toLowerCase() !==
              randomQuestion.answer.toLowerCase()
            ) {
              check = false;
            }
          });

          collector.on("end", (collected) => {
            if (collected.size === 0) {
              channel.send(`Time out! No answer was given.`);
            } else if (check === false) {
              channel.send(
                `Time out! No correct answers were given. See you the next time!`
              );
            } else if (check === true) {
              channel.send(
                `This Trivia Quiz has ended. See you the next time!`
              );
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
*/