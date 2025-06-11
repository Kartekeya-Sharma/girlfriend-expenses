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

const sources = ["Shoots"];

function IncomeCard() {
  const [income, setIncome] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
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
        "http://localhost:5001/api/income",
        formData
      );
      setIncome([...income, response.data]);
      setFormData({ amount: "", source: "", remarks: "" });
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/income/${id}`);
      setIncome(income.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting income:", error);
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
          Income
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
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            margin="normal"
            required
          >
            {sources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
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
            Add Income
          </Button>
        </Box>
        <List>
          {income.map((item) => (
            <ListItem
              key={item._id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(item._id)}>
                  <DeleteIcon sx={{ color: "error.main" }} />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${item.source}: ₹${item.amount}`}
                secondary={item.remarks}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default IncomeCard;
