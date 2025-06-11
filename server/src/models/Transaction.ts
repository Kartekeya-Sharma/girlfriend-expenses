import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: Date;
}

const TransactionSchema: Schema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    required: true,
    enum: ["income", "expense"],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
