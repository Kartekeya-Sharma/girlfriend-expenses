const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: "income",
  },
});

module.exports = mongoose.model("Income", incomeSchema);
