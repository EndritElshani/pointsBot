const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  pointsNeeded: {
    type: Number,
    required: true,
    min: 0,
  },
});

module.exports = mongoose.model('Rank', rankSchema);
