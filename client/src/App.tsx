import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
  description?: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface MonthlyBalance {
  month: string;
  monthKey: string;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  isEditingOpening?: boolean;
  isEditingClosing?: boolean;
}

interface CardDetails {
  id: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cardHolder: string;
  bankName: string;
  cardType: "credit" | "debit";
  color: string;
}

const CATEGORIES = [
  "Food",
  "Drinks",
  "Travel",
  "Recharge",
  "Entertainment",
  "Subscriptions",
  "Others",
];

// Update the API URL configuration
const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // In production, use relative path
    : "http://localhost:5000/api"; // In development, use local server

// Update the GlitterExplosion component
const GlitterExplosion = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          initial={{ opacity: 1, scale: 0 }}
          animate={{
            opacity: [1, 0],
            scale: [0, 3],
            x: Math.random() * 1000 - 500,
            y: Math.random() * 1000 - 500,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

// Update the MinusExplosion component
const MinusExplosion = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl text-[#FFB6C1]"
          initial={{ opacity: 1, scale: 0 }}
          animate={{
            opacity: [1, 0],
            scale: [0, 3],
            x: Math.random() * 1000 - 500,
            y: Math.random() * 1000 - 500,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          -
        </motion.div>
      ))}
    </div>
  );
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    description: "",
  });
  const [showPieChart, setShowPieChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"description" | "category">(
    "description"
  );
  const [showGlitter, setShowGlitter] = useState(false);
  const [showMinus, setShowMinus] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBalanceSummary, setShowBalanceSummary] = useState(false);
  const [monthlyBalances, setMonthlyBalances] = useState<MonthlyBalance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [editingBalance, setEditingBalance] = useState<{
    monthKey: string;
    value: string;
    type: "opening" | "closing";
  } | null>(null);
  const [budget, setBudget] = useState<number>(0);
  const [expensesPercentage, setExpensesPercentage] = useState<number>(40);
  const [savingsPercentage, setSavingsPercentage] = useState<number>(60);
  const [isEditingPercentages, setIsEditingPercentages] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);
  const [selectedMonthForBreakdown, setSelectedMonthForBreakdown] =
    useState<string>("");
  const [showWaterReminder, setShowWaterReminder] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"notes">("notes");
  const [cards, setCards] = useState<CardDetails[]>([]);
  const [newCard, setNewCard] = useState<Partial<CardDetails>>({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cardHolder: "",
    bankName: "",
    cardType: "debit",
    color: "#FFB6C1",
  });
  const [showCardPage, setShowCardPage] = useState(false);

  // Remove user filtering since we only have Vidhi's expenses
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  // Update savings percentage when expenses percentage changes
  useEffect(() => {
    setSavingsPercentage(100 - expensesPercentage);
  }, [expensesPercentage]);

  // Update expenses percentage when savings percentage changes
  useEffect(() => {
    setExpensesPercentage(100 - savingsPercentage);
  }, [savingsPercentage]);

  // Calculate budget based on the expenses percentage
  useEffect(() => {
    const newBudget = totalIncome * (expensesPercentage / 100);
    setBudget(newBudget);
  }, [totalIncome, expensesPercentage]);

  // Theme colors
  const theme = {
    dark: {
      bgPrimary: "#1A1A1A", // Darker background for better contrast
      bgSecondary: "#2A2A2A", // Slightly lighter than primary
      textPrimary: "#FFE4E1", // Cream text
      textSecondary: "#FFB6C1", // Baby pink for secondary text
      accent: "#FFB6C1", // Baby pink for accents
      accentHover: "#FFC0CB", // Lighter baby pink for hover
      border: "#FFB6C1", // Baby pink borders
      cardBg: "#2A2A2A", // Card background
      inputBg: "#1A1A1A", // Input background
      errorBg: "#4A1A1A", // Darker red for error messages
      errorText: "#FFB6C1", // Baby pink for error text
    },
    light: {
      bgPrimary: "#FFF5F5", // Light pink background
      bgSecondary: "#FFFFFF", // White for cards
      textPrimary: "#2A2A2A", // Dark gray for primary text
      textSecondary: "#FF6B6B", // Coral for secondary text
      accent: "#FFB6C1", // Baby pink for accents
      accentHover: "#FFC0CB", // Lighter baby pink for hover
      border: "#FFB6C1", // Baby pink borders
      cardBg: "#FFFFFF", // White card background
      inputBg: "#FFF5F5", // Light pink input background
      errorBg: "#FFE4E1", // Light red for error messages
      errorText: "#FF6B6B", // Coral for error text
    },
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    fetchTransactions();
    fetchNotes();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.amount) {
      setError("Please enter the amount");
      return;
    }

    if (formData.type === "expense" && !formData.category) {
      setError("Please select a category for the expense");
      return;
    }

    try {
      await axios.post(`${API_URL}/transactions`, {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date().toISOString(),
        title: formData.type === "expense" ? formData.category : "Income",
      });

      if (formData.type === "income") {
        setShowGlitter(true);
        setTimeout(() => setShowGlitter(false), 1000);
      } else {
        setShowMinus(true);
        setTimeout(() => setShowMinus(false), 1000);
      }

      fetchTransactions();
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError("Failed to add transaction. Please try again.");
    }
  };

  const pieChartData = {
    labels: CATEGORIES,
    datasets: [
      {
        data: CATEGORIES.map((category) =>
          transactions
            .filter((t) => t.type === "expense" && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: [
          "#FF6B6B", // Food - Coral Red
          "#4ECDC4", // Drinks - Turquoise
          "#45B7D1", // Travel - Sky Blue
          "#96CEB4", // Recharge - Sage Green
          "#FFEEAD", // Entertainment - Soft Yellow
          "#D4A5A5", // Subscriptions - Dusty Rose
          "#9B59B6", // Others - Purple
        ],
        borderColor: "#16213e",
        borderWidth: 2,
      },
    ],
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    if (searchType === "description") {
      return transaction.description?.toLowerCase().includes(query);
    } else {
      return transaction.category?.toLowerCase().includes(query);
    }
  });

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        await axios.post("http://localhost:5000/api/notes", {
          content: newNote.trim(),
          createdAt: new Date().toISOString(),
        });
        setNewNote("");
        fetchNotes();
      } catch (error) {
        console.error("Error adding note:", error);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notes");
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Update the getAllMonths function
  const getAllMonths = () => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Get all months from January of current year
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthName = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      months.push({ monthKey, monthName });
    }

    return months;
  };

  // Modify the calculateMonthlyBalances function
  const calculateMonthlyBalances = () => {
    const monthlyData: { [key: string]: MonthlyBalance } = {};
    const allMonths = getAllMonths();

    // Initialize all months
    allMonths.forEach(({ monthKey, monthName }) => {
      monthlyData[monthKey] = {
        month: monthName,
        monthKey,
        openingBalance: 0,
        closingBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
      };
    });

    // Calculate totals for each month from transactions
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlyData[monthKey]) {
        if (transaction.type === "income") {
          monthlyData[monthKey].totalIncome += transaction.amount;
        } else {
          monthlyData[monthKey].totalExpenses += transaction.amount;
        }
      }
    });

    // Calculate balances for each month independently
    const sortedMonths = Object.keys(monthlyData).sort();
    let previousClosingBalance = 0;

    sortedMonths.forEach((monthKey) => {
      const month = monthlyData[monthKey];
      month.openingBalance = previousClosingBalance;
      month.closingBalance =
        month.openingBalance + month.totalIncome - month.totalExpenses;
      previousClosingBalance = month.closingBalance;
    });

    return Object.values(monthlyData);
  };

  const handleBalanceChange = (
    monthKey: string,
    value: string,
    type: "opening" | "closing"
  ) => {
    setEditingBalance({ monthKey, value, type });
  };

  const handleBalanceSave = (monthKey: string, type: "opening" | "closing") => {
    if (editingBalance) {
      const newBalance = parseFloat(editingBalance.value) || 0;
      const updatedBalances = [...monthlyBalances];
      const monthIndex = updatedBalances.findIndex(
        (b) => b.monthKey === monthKey
      );

      if (monthIndex !== -1) {
        if (type === "opening") {
          // Update only the current month's opening balance
          updatedBalances[monthIndex] = {
            ...updatedBalances[monthIndex],
            openingBalance: newBalance,
            closingBalance:
              newBalance +
              updatedBalances[monthIndex].totalIncome -
              updatedBalances[monthIndex].totalExpenses,
          };
        } else {
          // Update only the current month's closing balance
          updatedBalances[monthIndex] = {
            ...updatedBalances[monthIndex],
            closingBalance: newBalance,
          };
        }
      }

      setMonthlyBalances(updatedBalances);
      setEditingBalance(null);
    }
  };

  useEffect(() => {
    const balances = calculateMonthlyBalances();
    setMonthlyBalances(balances);
  }, [transactions]);

  const monthlyPieData = (monthKey: string) => {
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      const tMonthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      return tMonthKey === monthKey && t.type === "expense";
    });

    return {
      labels: CATEGORIES,
      datasets: [
        {
          data: CATEGORIES.map((category) =>
            monthTransactions
              .filter((t) => t.category === category)
              .reduce((sum, t) => sum + t.amount, 0)
          ),
          backgroundColor: [
            "#FF6B6B", // Food - Coral Red
            "#4ECDC4", // Drinks - Turquoise
            "#45B7D1", // Travel - Sky Blue
            "#96CEB4", // Recharge - Sage Green
            "#FFEEAD", // Entertainment - Soft Yellow
            "#D4A5A5", // Subscriptions - Dusty Rose
            "#9B59B6", // Others - Purple
          ],
          borderColor: "#16213e",
          borderWidth: 2,
        },
      ],
    };
  };

  // Add water reminder effect
  useEffect(() => {
    const showReminder = () => {
      setShowWaterReminder(true);
      setTimeout(() => {
        setShowWaterReminder(false);
      }, 5000); // Hide after 5 seconds
    };

    // Show reminder every 30 minutes
    const interval = setInterval(showReminder, 30 * 60 * 1000);

    // Show initial reminder after 1 minute
    const initialTimeout = setTimeout(showReminder, 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div
      className="min-h-screen p-8 font-sans relative transition-colors duration-300 flex flex-col items-center"
      style={{
        backgroundColor: currentTheme.bgPrimary,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Water Reminder Popup */}
      <AnimatePresence>
        {showWaterReminder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFB6C1] text-[#2A2A2A] p-6 rounded-lg shadow-lg z-[100]"
          >
            <p className="text-xl font-semibold mb-4">
              Drink some water love😙
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowWaterReminder(false)}
                className="px-4 py-2 bg-white text-[#2A2A2A] rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watermark */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="fixed text-sm z-10"
        style={{
          color: currentTheme.textSecondary,
          right: "20px",
          bottom: "20px",
        }}
      >
        With Love - Kartekeya❤️
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: currentTheme.accent }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: currentTheme.accent }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed left-4 top-4 bg-[#FFB6C1] text-[#2A2A2A] p-2 rounded-lg shadow-lg z-20"
      >
        {showSidebar ? "×" : "☰"}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: showSidebar ? 0 : -320 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-10"
        style={{ backgroundColor: currentTheme.cardBg }}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveSidebarTab("notes")}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                activeSidebarTab === "notes"
                  ? "bg-[#FFB6C1] text-[#2A2A2A]"
                  : "bg-transparent text-[#FFB6C1]"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setShowCardPage(true)}
              className="flex-1 py-2 rounded-lg transition-colors bg-transparent text-[#FFB6C1] hover:bg-[#FFB6C1] hover:text-[#2A2A2A]"
            >
              Cards
            </button>
          </div>

          {/* Notes Section */}
          {activeSidebarTab === "notes" && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: currentTheme.inputBg,
                    borderColor: currentTheme.border,
                    color: currentTheme.textPrimary,
                  }}
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  className="w-full bg-[#FFB6C1] text-[#2A2A2A] py-2 rounded-lg"
                >
                  Add Note
                </button>
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.inputBg,
                      borderColor: currentTheme.border,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p
                        className="text-sm"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-sm text-[#FFB6C1] hover:text-[#FFC0CB]"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          showSidebar ? "ml-80" : ""
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Theme Toggle Button */}
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="fixed top-4 right-4 p-2 rounded-full bg-[#FFB6C1] text-[#2A2A2A] shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? "🌞" : "🌙"}
          </motion.button>

          {/* Search Bar */}
          <div className="w-full max-w-3xl mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder={`Search by ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: currentTheme.inputBg,
                    borderColor: currentTheme.border,
                    color: currentTheme.textPrimary,
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchType("description")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    searchType === "description"
                      ? "bg-[#FFB6C1] text-[#2A2A2A]"
                      : "bg-transparent border border-[#FFB6C1] text-[#FFB6C1]"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSearchType("category")}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    searchType === "category"
                      ? "bg-[#FFB6C1] text-[#2A2A2A]"
                      : "bg-transparent border border-[#FFB6C1] text-[#FFB6C1]"
                  }`}
                >
                  Category
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl p-6 shadow-lg border relative"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <AnimatePresence>
                {showGlitter && <GlitterExplosion />}
                {showMinus && <MinusExplosion />}
              </AnimatePresence>
              <h2 className="text-xl font-semibold mb-2">Total Income</h2>
              <motion.p
                className="text-2xl font-bold"
                style={{ color: currentTheme.accent }}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                ₹{totalIncome.toFixed(2)}
              </motion.p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl p-6 shadow-lg border"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <h2 className="text-xl font-semibold mb-2">Total Expenses</h2>
              <div className="space-y-2">
                <motion.p
                  className="text-2xl font-bold"
                  style={{
                    color:
                      totalExpenses > budget ? "#FF4444" : currentTheme.accent,
                  }}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  ₹{totalExpenses.toFixed(2)}
                </motion.p>
                <div
                  className="text-sm"
                  style={{ color: currentTheme.textSecondary }}
                >
                  <p>Budget: ₹{budget.toFixed(2)}</p>
                  {totalExpenses > budget && (
                    <p className="text-red-500">
                      Exceeded by ₹{(totalExpenses - budget).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl p-6 shadow-lg border"
              style={{
                backgroundColor: currentTheme.cardBg,
                borderColor: currentTheme.border,
              }}
            >
              <h2 className="text-xl font-semibold mb-2">Savings</h2>
              <motion.p
                className="text-2xl font-bold"
                style={{ color: currentTheme.accent }}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                ₹{savings.toFixed(2)}
              </motion.p>
            </motion.div>
          </div>

          {/* Pie Chart Toggle */}
          <div className="w-full max-w-3xl flex justify-center gap-4 mb-8">
            <button
              onClick={() => {
                setShowPieChart(!showPieChart);
                setShowBalanceSummary(false);
              }}
              className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                showPieChart
                  ? "bg-[#FFB6C1] text-[#2A2A2A]"
                  : "bg-transparent border border-[#FFB6C1] text-[#FFB6C1]"
              }`}
            >
              Expenses Breakdown
            </button>
            <button
              onClick={() => {
                setShowBalanceSummary(!showBalanceSummary);
                setShowPieChart(false);
              }}
              className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                showBalanceSummary
                  ? "bg-[#FFB6C1] text-[#2A2A2A]"
                  : "bg-transparent border border-[#FFB6C1] text-[#FFB6C1]"
              }`}
            >
              Monthly Balance
            </button>
          </div>

          {/* Monthly Balance and Income Distribution */}
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              {showBalanceSummary ? (
                <div className="flex flex-col md:flex-row gap-6">
                  <motion.div
                    key="balance-summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 rounded-xl p-6 shadow-lg border mb-8"
                    style={{
                      backgroundColor: currentTheme.cardBg,
                      borderColor: currentTheme.border,
                    }}
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                      Monthly Balance Summary
                    </h2>

                    {/* Month Selection */}
                    <div className="mb-4 flex justify-center gap-4">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                      >
                        <option value="">All Months</option>
                        {getAllMonths().map(({ monthKey, monthName }) => (
                          <option key={monthKey} value={monthKey}>
                            {monthName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className="border-b"
                            style={{ borderColor: currentTheme.border }}
                          >
                            <th className="py-2 px-4 text-left">Month</th>
                            <th className="py-2 px-4 text-right">
                              Opening Balance
                            </th>
                            <th className="py-2 px-4 text-right">Income</th>
                            <th className="py-2 px-4 text-right">Expenses</th>
                            <th className="py-2 px-4 text-right">
                              Closing Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyBalances
                            .filter(
                              (balance) =>
                                !selectedMonth ||
                                balance.monthKey === selectedMonth
                            )
                            .map((balance) => (
                              <tr
                                key={balance.monthKey}
                                className="border-b"
                                style={{ borderColor: currentTheme.border }}
                              >
                                <td className="py-2 px-4">{balance.month}</td>
                                <td className="py-2 px-4 text-right">
                                  {editingBalance?.monthKey ===
                                    balance.monthKey &&
                                  editingBalance.type === "opening" ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <input
                                        type="number"
                                        value={editingBalance.value}
                                        onChange={(e) =>
                                          handleBalanceChange(
                                            balance.monthKey,
                                            e.target.value,
                                            "opening"
                                          )
                                        }
                                        className="w-24 p-1 border rounded"
                                        style={{
                                          backgroundColor: currentTheme.inputBg,
                                          borderColor: currentTheme.border,
                                          color: currentTheme.textPrimary,
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          handleBalanceSave(
                                            balance.monthKey,
                                            "opening"
                                          )
                                        }
                                        className="p-1 rounded hover:bg-[#FFB6C1] hover:text-[#2A2A2A]"
                                      >
                                        ✓
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      className="cursor-pointer hover:text-[#FFB6C1]"
                                      onClick={() =>
                                        handleBalanceChange(
                                          balance.monthKey,
                                          balance.openingBalance.toString(),
                                          "opening"
                                        )
                                      }
                                    >
                                      ₹{balance.openingBalance.toFixed(2)}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2 px-4 text-right text-green-500">
                                  +₹{balance.totalIncome.toFixed(2)}
                                </td>
                                <td className="py-2 px-4 text-right text-red-500">
                                  -₹{balance.totalExpenses.toFixed(2)}
                                </td>
                                <td className="py-2 px-4 text-right">
                                  {editingBalance?.monthKey ===
                                    balance.monthKey &&
                                  editingBalance.type === "closing" ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <input
                                        type="number"
                                        value={editingBalance.value}
                                        onChange={(e) =>
                                          handleBalanceChange(
                                            balance.monthKey,
                                            e.target.value,
                                            "closing"
                                          )
                                        }
                                        className="w-24 p-1 border rounded"
                                        style={{
                                          backgroundColor: currentTheme.inputBg,
                                          borderColor: currentTheme.border,
                                          color: currentTheme.textPrimary,
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          handleBalanceSave(
                                            balance.monthKey,
                                            "closing"
                                          )
                                        }
                                        className="p-1 rounded hover:bg-[#FFB6C1] hover:text-[#2A2A2A]"
                                      >
                                        ✓
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      className="cursor-pointer hover:text-[#FFB6C1]"
                                      onClick={() =>
                                        handleBalanceChange(
                                          balance.monthKey,
                                          balance.closingBalance.toString(),
                                          "closing"
                                        )
                                      }
                                    >
                                      ₹{balance.closingBalance.toFixed(2)}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  <motion.div
                    key="income-distribution"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 rounded-xl p-6 shadow-lg border mb-8"
                    style={{
                      backgroundColor: currentTheme.cardBg,
                      borderColor: currentTheme.border,
                    }}
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                      Income Distribution
                    </h2>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base">Total Income</h3>
                          <span
                            className="text-lg font-semibold"
                            style={{ color: currentTheme.accent }}
                          >
                            ₹{totalIncome.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg">Expenses</h3>
                          {isEditingPercentages ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={expensesPercentage}
                                onChange={(e) => {
                                  const value = Math.min(
                                    100,
                                    Math.max(0, Number(e.target.value))
                                  );
                                  setExpensesPercentage(value);
                                }}
                                className="w-16 p-1 border rounded text-center"
                                style={{
                                  backgroundColor: currentTheme.inputBg,
                                  borderColor: currentTheme.border,
                                  color: currentTheme.textPrimary,
                                }}
                              />
                              <span>%</span>
                            </div>
                          ) : (
                            <span
                              className="text-lg font-semibold"
                              style={{ color: currentTheme.accent }}
                            >
                              {expensesPercentage}%
                            </span>
                          )}
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: currentTheme.inputBg }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: currentTheme.accent,
                              width: `${expensesPercentage}%`,
                            }}
                          />
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: currentTheme.textSecondary }}
                        >
                          Budget: ₹{budget.toFixed(2)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg">Savings</h3>
                          {isEditingPercentages ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={savingsPercentage}
                                onChange={(e) => {
                                  const value = Math.min(
                                    100,
                                    Math.max(0, Number(e.target.value))
                                  );
                                  setSavingsPercentage(value);
                                }}
                                className="w-16 p-1 border rounded text-center"
                                style={{
                                  backgroundColor: currentTheme.inputBg,
                                  borderColor: currentTheme.border,
                                  color: currentTheme.textPrimary,
                                }}
                              />
                              <span>%</span>
                            </div>
                          ) : (
                            <span
                              className="text-lg font-semibold"
                              style={{ color: currentTheme.accent }}
                            >
                              {savingsPercentage}%
                            </span>
                          )}
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: currentTheme.inputBg }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: currentTheme.accent,
                              width: `${savingsPercentage}%`,
                            }}
                          />
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: currentTheme.textSecondary }}
                        >
                          Target: ₹
                          {((totalIncome * savingsPercentage) / 100).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setIsEditingPercentages(!isEditingPercentages)
                        }
                        className="w-full bg-[#FFB6C1] hover:bg-[#FFC0CB] text-[#2A2A2A] font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        {isEditingPercentages
                          ? "Save Changes"
                          : "Edit Percentages"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              ) : showPieChart ? (
                <motion.div
                  key="pie-chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-xl p-6 shadow-lg border mb-8"
                  style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.border,
                  }}
                >
                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    {showHistogram ? "Income Chart" : "Expenses Breakdown"}
                  </h2>

                  {/* Chart Type Toggle */}
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      onClick={() => {
                        setShowHistogram(false);
                        setSelectedMonthForBreakdown("");
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        !showHistogram
                          ? "bg-[#FFB6C1] text-[#2A2A2A]"
                          : "bg-transparent border border-[#FFB6C1] text-[#FFB6C1]"
                      }`}
                    >
                      Overall Expenses
                    </button>
                    <button
                      onClick={() => {
                        setShowHistogram(true);
                        setSelectedMonthForBreakdown("");
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        showHistogram
                          ? "bg-[#FFB6C1] text-[#2A2A2A]"
                          : "bg-transparent border border-[#FFB6C1] text-[#FFB6C1]"
                      }`}
                    >
                      Income Chart
                    </button>
                  </div>

                  {/* Month Selection for Both Views */}
                  <div className="mb-6 flex justify-center">
                    <select
                      value={selectedMonthForBreakdown}
                      onChange={(e) =>
                        setSelectedMonthForBreakdown(e.target.value)
                      }
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: currentTheme.inputBg,
                        borderColor: currentTheme.border,
                        color: currentTheme.textPrimary,
                      }}
                    >
                      <option value="">All Months</option>
                      {getAllMonths().map(({ monthKey, monthName }) => (
                        <option key={monthKey} value={monthKey}>
                          {monthName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="h-96 flex-1">
                      {showHistogram ? (
                        <Bar
                          data={
                            selectedMonthForBreakdown
                              ? {
                                  labels: [
                                    monthlyBalances.find(
                                      (b) =>
                                        b.monthKey === selectedMonthForBreakdown
                                    )?.month || "",
                                  ],
                                  datasets: [
                                    {
                                      label: "Savings",
                                      data: [
                                        (() => {
                                          const balance = monthlyBalances.find(
                                            (b) =>
                                              b.monthKey ===
                                              selectedMonthForBreakdown
                                          );
                                          return balance
                                            ? balance.totalIncome -
                                                balance.totalExpenses
                                            : 0;
                                        })(),
                                      ],
                                      backgroundColor: "#FFB6C1",
                                    },
                                  ],
                                }
                              : {
                                  labels: monthlyBalances.map((b) => b.month),
                                  datasets: [
                                    {
                                      label: "Savings",
                                      data: monthlyBalances.map(
                                        (b) => b.totalIncome - b.totalExpenses
                                      ),
                                      backgroundColor: "#FFB6C1",
                                    },
                                  ],
                                }
                          }
                          options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                              legend: {
                                labels: {
                                  color: currentTheme.textPrimary,
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  color: currentTheme.textPrimary,
                                },
                                grid: {
                                  color: currentTheme.border,
                                },
                              },
                              x: {
                                ticks: {
                                  color: currentTheme.textPrimary,
                                },
                                grid: {
                                  color: currentTheme.border,
                                },
                              },
                            },
                          }}
                        />
                      ) : (
                        <Pie
                          data={
                            selectedMonthForBreakdown
                              ? monthlyPieData(selectedMonthForBreakdown)
                              : pieChartData
                          }
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                labels: {
                                  color: currentTheme.textPrimary,
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 p-4 rounded-lg border h-96 overflow-y-auto"
                      style={{
                        backgroundColor: currentTheme.inputBg,
                        borderColor: currentTheme.border,
                      }}
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        {showHistogram
                          ? "Monthly Summary"
                          : "Top Spending Category"}
                      </h3>
                      {showHistogram ? (
                        <div className="space-y-4">
                          {selectedMonthForBreakdown
                            ? (() => {
                                const balance = monthlyBalances.find(
                                  (b) =>
                                    b.monthKey === selectedMonthForBreakdown
                                );
                                return balance ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold">
                                      {balance.month}
                                    </p>
                                    <div className="flex justify-between">
                                      <span>Income:</span>
                                      <span className="text-green-500">
                                        ₹{balance.totalIncome.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Expenses:</span>
                                      <span className="text-red-500">
                                        ₹{balance.totalExpenses.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Savings:</span>
                                      <span className="text-[#FFB6C1]">
                                        ₹
                                        {(
                                          balance.totalIncome -
                                          balance.totalExpenses
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ) : null;
                              })()
                            : monthlyBalances.map((balance) => (
                                <div
                                  key={balance.monthKey}
                                  className="space-y-1 mb-4"
                                >
                                  <p className="font-semibold">
                                    {balance.month}
                                  </p>
                                  <div className="flex justify-between">
                                    <span>Income:</span>
                                    <span className="text-green-500">
                                      ₹{balance.totalIncome.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Expenses:</span>
                                    <span className="text-red-500">
                                      ₹{balance.totalExpenses.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Savings:</span>
                                    <span className="text-[#FFB6C1]">
                                      ₹
                                      {(
                                        balance.totalIncome -
                                        balance.totalExpenses
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                        </div>
                      ) : (
                        (() => {
                          const categoryTotals = CATEGORIES.map((category) => ({
                            category,
                            total: transactions
                              .filter(
                                (t) =>
                                  t.type === "expense" &&
                                  t.category === category &&
                                  (!selectedMonthForBreakdown ||
                                    new Date(t.date)
                                      .toISOString()
                                      .slice(0, 7) ===
                                      selectedMonthForBreakdown)
                              )
                              .reduce((sum, t) => sum + t.amount, 0),
                          }));

                          const topCategory = categoryTotals.reduce(
                            (max, current) =>
                              current.total > max.total ? current : max
                          );

                          return (
                            <div className="space-y-2">
                              <p
                                className="text-xl font-bold"
                                style={{ color: currentTheme.accent }}
                              >
                                {topCategory.category}
                              </p>
                              <p className="text-lg">
                                Total Spent: ₹{topCategory.total.toFixed(2)}
                              </p>
                              <p
                                className="text-sm"
                                style={{ color: currentTheme.textSecondary }}
                              >
                                {(
                                  (topCategory.total /
                                    (selectedMonthForBreakdown
                                      ? transactions
                                          .filter(
                                            (t) =>
                                              t.type === "expense" &&
                                              new Date(t.date)
                                                .toISOString()
                                                .slice(0, 7) ===
                                                selectedMonthForBreakdown
                                          )
                                          .reduce((sum, t) => sum + t.amount, 0)
                                      : totalExpenses)) *
                                  100
                                ).toFixed(1)}
                                % of total expenses
                              </p>
                            </div>
                          );
                        })()
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="transaction-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-xl p-6 shadow-lg border mb-8"
                  style={{
                    backgroundColor: currentTheme.cardBg,
                    borderColor: currentTheme.border,
                  }}
                >
                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    Add Transaction
                  </h2>
                  {error && (
                    <div
                      className="px-4 py-3 rounded mb-4"
                      style={{
                        backgroundColor: currentTheme.errorBg,
                        color: currentTheme.errorText,
                        borderColor: currentTheme.border,
                      }}
                    >
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        required
                      />
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as "income" | "expense",
                            category:
                              e.target.value === "income"
                                ? ""
                                : formData.category,
                          })
                        }
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      {formData.type === "expense" && (
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: currentTheme.inputBg,
                            borderColor: currentTheme.border,
                            color: currentTheme.textPrimary,
                          }}
                          required
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <textarea
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: currentTheme.inputBg,
                        borderColor: currentTheme.border,
                        color: currentTheme.textPrimary,
                      }}
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#FFB6C1] hover:bg-[#FFC0CB] text-[#2A2A2A] font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Add Transaction
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Transactions List */}
          <div
            className="w-full max-w-3xl rounded-xl p-6 shadow-lg border"
            style={{
              backgroundColor: currentTheme.cardBg,
              borderColor: currentTheme.border,
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Recent Transactions
            </h2>
            {searchQuery && (
              <p
                className="text-sm mb-4 text-center"
                style={{ color: currentTheme.textSecondary }}
              >
                Showing {filteredTransactions.length} results for "{searchQuery}
                " in {searchType}
              </p>
            )}
            <div className="space-y-4">
              {filteredTransactions
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((transaction) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.inputBg,
                      borderColor: currentTheme.border,
                    }}
                  >
                    <div>
                      <h3 className="font-semibold">
                        {transaction.category || "Income"}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      {transaction.description && (
                        <p
                          className="text-sm mt-1"
                          style={{ color: currentTheme.textSecondary }}
                        >
                          {transaction.description}
                        </p>
                      )}
                    </div>
                    <p
                      className="font-bold"
                      style={{
                        color:
                          transaction.type === "income"
                            ? currentTheme.accent
                            : currentTheme.textSecondary,
                      }}
                    >
                      {transaction.type === "income" ? "+" : "-"}₹
                      {transaction.amount.toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              {filteredTransactions.length === 0 && (
                <p
                  className="text-center py-4"
                  style={{ color: currentTheme.textSecondary }}
                >
                  {searchQuery
                    ? `No transactions found matching "${searchQuery}" in ${searchType}`
                    : "No transactions yet"}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card Page */}
      <AnimatePresence>
        {showCardPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
            style={{ backgroundColor: currentTheme.bgPrimary }}
          >
            <div className="max-w-4xl mx-auto p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h1
                  className="text-3xl font-bold"
                  style={{ color: currentTheme.textPrimary }}
                >
                  Card Management
                </h1>
                <button
                  onClick={() => setShowCardPage(false)}
                  className="p-2 rounded-lg hover:bg-[#FFB6C1] hover:text-[#2A2A2A] transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Add New Card Form */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8 p-6 rounded-xl shadow-lg"
                style={{ backgroundColor: currentTheme.cardBg }}
              >
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: currentTheme.textPrimary }}
                >
                  Add New Card
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        Card Name
                      </label>
                      <input
                        type="text"
                        value={newCard.cardName}
                        onChange={(e) =>
                          setNewCard({ ...newCard, cardName: e.target.value })
                        }
                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#FFB6C1] focus:border-transparent transition-all"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        placeholder="e.g., My Personal Card"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={newCard.cardNumber}
                        onChange={(e) =>
                          setNewCard({ ...newCard, cardNumber: e.target.value })
                        }
                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#FFB6C1] focus:border-transparent transition-all"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={newCard.expiryDate}
                        onChange={(e) =>
                          setNewCard({ ...newCard, expiryDate: e.target.value })
                        }
                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#FFB6C1] focus:border-transparent transition-all"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        placeholder="MM/YY"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        Card Holder
                      </label>
                      <input
                        type="text"
                        value={newCard.cardHolder}
                        onChange={(e) =>
                          setNewCard({ ...newCard, cardHolder: e.target.value })
                        }
                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#FFB6C1] focus:border-transparent transition-all"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: currentTheme.textSecondary }}
                      >
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={newCard.bankName}
                        onChange={(e) =>
                          setNewCard({ ...newCard, bankName: e.target.value })
                        }
                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#FFB6C1] focus:border-transparent transition-all"
                        style={{
                          backgroundColor: currentTheme.inputBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        placeholder="Bank Name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: currentTheme.textSecondary }}
                        >
                          Card Type
                        </label>
                        <select
                          value={newCard.cardType}
                          onChange={(e) =>
                            setNewCard({
                              ...newCard,
                              cardType: e.target.value as "credit" | "debit",
                            })
                          }
                          className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#FFB6C1] focus:border-transparent transition-all"
                          style={{
                            backgroundColor: currentTheme.inputBg,
                            borderColor: currentTheme.border,
                            color: currentTheme.textPrimary,
                          }}
                        >
                          <option value="debit">Debit Card</option>
                          <option value="credit">Credit Card</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{ color: currentTheme.textSecondary }}
                        >
                          Card Color
                        </label>
                        <input
                          type="color"
                          value={newCard.color}
                          onChange={(e) =>
                            setNewCard({ ...newCard, color: e.target.value })
                          }
                          className="w-full h-12 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      if (newCard.cardName && newCard.cardNumber) {
                        setCards([
                          ...cards,
                          {
                            ...newCard,
                            id: Date.now().toString(),
                          } as CardDetails,
                        ]);
                        setNewCard({
                          cardName: "",
                          cardNumber: "",
                          expiryDate: "",
                          cardHolder: "",
                          bankName: "",
                          cardType: "debit",
                          color: "#FFB6C1",
                        });
                      }
                    }}
                    className="px-6 py-3 bg-[#FFB6C1] text-[#2A2A2A] rounded-lg font-semibold hover:bg-[#FFC0CB] transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </motion.div>

              {/* Cards Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl shadow-lg relative overflow-hidden"
                    style={{
                      backgroundColor: card.color,
                      borderColor: currentTheme.border,
                      color: "#2A2A2A",
                    }}
                  >
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() =>
                          setCards(cards.filter((c) => c.id !== card.id))
                        }
                        className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{card.cardName}</h3>
                          <p className="text-sm opacity-80">{card.bankName}</p>
                        </div>
                        <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
                          {card.cardType.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-mono tracking-wider">
                          {card.cardNumber.replace(/(\d{4})/g, "$1 ").trim()}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-6">
                        <div>
                          <p className="text-xs opacity-80">Card Holder</p>
                          <p className="font-semibold">{card.cardHolder}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-80">Expires</p>
                          <p className="font-semibold">{card.expiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
