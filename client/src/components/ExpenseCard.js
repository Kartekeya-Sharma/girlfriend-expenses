import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const categories = [
  "Food",
  "Drinks",
  "Purchases",
  "Recharge",
  "Subscriptions",
  "Travel",
  "Entertainment",
  "Shopping",
  "Others",
];

function ExpenseCard() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5001/api/expenses",
        formData
      );
      setExpenses([...expenses, response.data]);
      setFormData({ amount: "", category: "", remarks: "" });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/expenses/${id}`);
      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <Card
      sx={{
        background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(255, 105, 180, 0.2)",
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ color: "primary.main" }}
        >
          Expenses
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
            required
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              background: "linear-gradient(45deg, #ff69b4 30%, #ff1493 90%)",
            }}
          >
            Add Expense
          </Button>
        </Box>
        <List>
          {expenses.map((expense) => (
            <ListItem
              key={expense._id}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(expense._id)}
                >
                  <DeleteIcon sx={{ color: "error.main" }} />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${expense.category}: ₹${expense.amount}`}
                secondary={expense.remarks}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default ExpenseCard;
