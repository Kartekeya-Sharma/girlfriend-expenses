const express = require("express");
const router = express.Router();
const Income = require("../models/Income");

// Get all income
router.get("/", async (req, res) => {
  try {
    const income = await Income.find().sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new income
router.post("/", async (req, res) => {
  const income = new Income({
    amount: req.body.amount,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    type: "income",
  });

  try {
    const newIncome = await income.save();
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete income
router.delete("/:id", async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
