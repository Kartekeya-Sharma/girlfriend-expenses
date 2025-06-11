const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expense_tracker";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  title: String,
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["income", "expense"],
  },
  date: {
    type: String,
    default: new Date().toISOString(),
  },
  category: String,
  description: String,
});

// Note Schema
const noteSchema = new mongoose.Schema({
  content: String,
  createdAt: {
    type: String,
    default: new Date().toISOString(),
  },
  userId: String,
});

// Models
const Transaction = mongoose.model("Transaction", transactionSchema);
const Note = mongoose.model("Note", noteSchema);

// Routes
app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      date: req.body.date || new Date().toISOString(),
    });
    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(400).json({ message: "Error creating transaction" });
  }
});

app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      createdAt: req.body.createdAt || new Date().toISOString(),
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(400).json({ message: "Error creating note" });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
