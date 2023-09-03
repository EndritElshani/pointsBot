const mongoose = require("mongoose");

const User = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String },
  rewardPoints: { type: Number, default: 0 },
  rankPoints: { type: Number, default: 0 },
  monthlyPoints: { type: Number, default: 0 },
  TriviaPoints: { type: Number, default: 0 },
  TriviaPointsEx: { type: Number, default: 0 },
  rank: {
    type: String,
    ref: "Rank",
    default: "No Rank"
  },
  selectedRole: { type: String, default: "Cannon Fodder" },
  lastDaily: { type: Date, default: null },
});

User.methods.updateRank = async function () {
  const Rank = mongoose.model("Rank");

  const rank = await Rank.findOne({ pointsNeeded: { $lte: this.rankPoints } })
    .sort("-pointsNeeded")
    .exec();

  if (rank && rank.name !== this.rank) {
    this.rank = rank.name;
    await this.save();
    return rank;
  }
  return null;
};

module.exports = { User: mongoose.model("User", User) };
