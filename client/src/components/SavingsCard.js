import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

function SavingsCard() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, expensesRes] = await Promise.all([
          axios.get("http://localhost:5001/api/income"),
          axios.get("http://localhost:5001/api/expenses"),
        ]);
        setIncome(incomeRes.data);
        setExpenses(expensesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const savings = totalIncome - totalExpenses;

  const data = {
    labels: ["Income", "Expenses", "Savings"],
    datasets: [
      {
        data: [totalIncome, totalExpenses, savings],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
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
          Savings Overview
        </Typography>
        <Box
          sx={{
            height: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pie data={data} options={options} />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ color: "success.main" }}>
            Total Income: ₹{totalIncome}
          </Typography>
          <Typography variant="h6" sx={{ color: "error.main" }}>
            Total Expenses: ₹{totalExpenses}
          </Typography>
          <Typography variant="h6" sx={{ color: "info.main" }}>
            Savings: ₹{savings}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SavingsCard;
