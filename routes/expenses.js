const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Expense.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new transaction
router.post("/", async (req, res) => {
  const transaction = new Expense({
    title: req.body.title,
    amount: req.body.amount,
    type: req.body.type,
    category: req.body.category,
    description: req.body.description,
    date: req.body.date || new Date(),
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete transaction
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    await transaction.remove();
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update transaction
router.patch("/:id", async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (req.body.title) transaction.title = req.body.title;
    if (req.body.amount) transaction.amount = req.body.amount;
    if (req.body.type) transaction.type = req.body.type;
    if (req.body.category) transaction.category = req.body.category;
    if (req.body.description) transaction.description = req.body.description;
    if (req.body.date) transaction.date = req.body.date;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
