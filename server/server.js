const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const Task = require("./models/Task");
const User = require("./models/User");
const protect = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://task-flow-mern-one.vercel.app",
      "https://task-flow-mern-42s5nxbmz-gudalanandini.vercel.app",
      "https://task-flow-mern-hj19xan3z-gudalanandini.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TaskFlow API is running");
});

// REGISTER USER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "taskflowsecret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN USER
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "taskflowsecret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// GET TASKS
app.get("/tasks", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// ADD TASK
app.post("/tasks", protect, async (req, res) => {
  try {
    const { title, description, date, priority } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title is required" });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description || "",
      date: date || "",
      priority: priority || "Medium",
      completed: false,
      user: req.user._id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to add task" });
  }
});

// COMPLETE / UNCOMPLETE TASK
app.put("/tasks/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// EDIT TASK
app.put("/tasks/:id/edit", protect, async (req, res) => {
  try {
    const { title, description, date, priority } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title.trim();
    task.description = description || "";
    task.date = date || "";
    task.priority = priority || "Medium";

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to edit task" });
  }
});

// DELETE ONE TASK
app.delete("/tasks/:id", protect, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// DELETE ALL TASKS
app.delete("/tasks", protect, async (req, res) => {
  try {
    await Task.deleteMany({ user: req.user._id });

    res.json({ message: "All tasks cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear tasks" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});