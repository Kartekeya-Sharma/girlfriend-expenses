const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Income = require("../models/Income");

// Get savings overview
router.get("/", async (req, res) => {
  try {
    const [income, expenses] = await Promise.all([
      Income.find(),
      Expense.find(),
    ]);

    const totalIncome = income.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    const totalExpenses = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    const savings = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      savings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
