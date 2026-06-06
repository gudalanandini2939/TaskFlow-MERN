import { useEffect, useState } from "react";
import "../dashboard.css";

const API_URL = "https://taskflow-mern-qrle.onrender.com/tasks";
function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
  }, [lightMode]);

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  }

  function resetAddForm() {
    setTaskTitle("");
    setDescription("");
    setDate("");
    setPriority("Medium");
  }

  function resetEditForm() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDate("");
    setEditPriority("Medium");
    setShowEditModal(false);
  }

  function formatDate(value) {
    if (!value) return "No date";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getDateAfter(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  function setQuickDate(type, mode = "add") {
    let selectedDate = getDateAfter(0);

    if (type === "tomorrow") selectedDate = getDateAfter(1);
    if (type === "nextWeek") selectedDate = getDateAfter(7);

    if (mode === "edit") setEditDate(selectedDate);
    else setDate(selectedDate);
  }

  async function fetchTasks() {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to fetch tasks");
        return;
      }

      setTasks(data);
    } catch {
      showMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function addTask() {
    if (taskTitle.trim() === "") {
      showMessage("Please enter a task title");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: taskTitle,
          description,
          date,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to add task");
        return;
      }

      setTasks([data, ...tasks]);
      resetAddForm();
      setShowAddModal(false);
      showMessage("Task added successfully");
    } catch {
      showMessage("Failed to add task");
    }
  }

  async function completeTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to update task");
        return;
      }

      setTasks(tasks.map((task) => (task._id === id ? data : task)));
      showMessage("Task status updated");
    } catch {
      showMessage("Failed to update task");
    }
  }

  async function editTask() {
    if (!editingId) return;

    if (editTitle.trim() === "") {
      showMessage("Task title cannot be empty");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editingId}/edit`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          date: editDate,
          priority: editPriority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to edit task");
        return;
      }

      setTasks(tasks.map((task) => (task._id === editingId ? data : task)));
      resetEditForm();
      showMessage("Task updated successfully");
    } catch {
      showMessage("Failed to edit task");
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to delete task");
        return;
      }

      setTasks(tasks.filter((task) => task._id !== id));
      showMessage("Task deleted successfully");
    } catch {
      showMessage("Failed to delete task");
    }
  }

  async function clearAllTasks() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all tasks?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || "Failed to clear tasks");
        return;
      }

      setTasks([]);
      showMessage("All tasks deleted successfully");
    } catch {
      showMessage("Failed to clear tasks");
    }
  }

  function openEditModal(task) {
    setEditingId(task._id);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditDate(task.date || "");
    setEditPriority(task.priority || "Medium");
    setShowEditModal(true);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const highPriorityTasks = tasks.filter((task) => task.priority === "High").length;

  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && task.completed) ||
      (filter === "Pending" && !task.completed) ||
      task.priority === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-bg"></div>

      {message && <div className="toast-message">{message}</div>}

      <nav className="navbar">
        <div className="logo">
          <h2>TaskFlow</h2>
          <span>Productivity Dashboard</span>
        </div>

        <div className="nav-right">
          <input
            type="text"
            placeholder="Search your tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <button className="theme-btn" onClick={() => setLightMode(!lightMode)}>
            {lightMode ? "🌙" : "☀️"}
          </button>

          <button className="profile-btn" onClick={() => setShowProfile(true)}>
            Profile
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="welcome">
        <div className="welcome-text">
          <h1>Good Day, {user?.name || "User"} 👋</h1>
          <p>Stay focused, finish your tasks, and track your progress beautifully.</p>
        </div>

        <div className="score-box">
          <span>Productivity Score</span>
          <h2>{percentage}%</h2>
        </div>
      </section>

      <section className="progress-section">
        <div className="progress-info">
          <h3>Task Progress</h3>
          <span>
            {completedTasks} of {tasks.length} tasks completed
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
      </section>

      <section className="stats">
        <div className="card">
          <h3>Total Tasks</h3>
          <p>{tasks.length}</p>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <p>{pendingTasks}</p>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </div>

        <div className="card">
          <h3>High Priority</h3>
          <p>{highPriorityTasks}</p>
        </div>
      </section>

      <section className="tasks">
        <div className="section-header">
          <div>
            <h2>Today's Tasks ({filteredTasks.length})</h2>
            <p>Manage your tasks in one beautiful dashboard.</p>
          </div>

          <div className="header-buttons">
            <button onClick={() => setShowAddModal(true)}>+ Add Task</button>
            <button className="clear-btn" onClick={clearAllTasks}>
              Clear All
            </button>
          </div>
        </div>

        <div className="filter-row">
          {["All", "Pending", "Completed", "High", "Medium", "Low"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active-filter" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && <p className="loading-message">Loading tasks...</p>}

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <h3>🚀 Ready to be productive?</h3>
              <p>Create your first task and start tracking progress.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                className={`task-card ${task.completed ? "completed" : ""}`}
                key={task._id}
              >
                <div className="task-actions">
                  <button className="complete-btn" onClick={() => completeTask(task._id)}>
                    ✓
                  </button>

                  <button className="edit-btn" onClick={() => openEditModal(task)}>
                    ✏
                  </button>

                  <button className="delete-btn" onClick={() => deleteTask(task._id)}>
                    ×
                  </button>
                </div>

                <h3>{task.title}</h3>

                <div className="task-meta">
                  <p className={`priority ${task.priority?.toLowerCase()}`}>
                    {task.priority} Priority
                  </p>

                  <p className="task-description">
                    {task.description || "No description"}
                  </p>
                </div>

                <div className="task-footer">
                  <span>{task.completed ? "Completed" : "Pending"}</span>
                  <span>📅 {formatDate(task.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bottom-section">
        <div className="deadlines">
          <h2>Upcoming Deadlines</h2>

          <ul>
            {tasks.filter((task) => task.date && !task.completed).length === 0 ? (
              <li>No upcoming deadlines</li>
            ) : (
              tasks
                .filter((task) => task.date && !task.completed)
                .slice(0, 4)
                .map((task) => (
                  <li key={task._id}>
                    📅 {task.title} - {formatDate(task.date)}
                  </li>
                ))
            )}
          </ul>
        </div>

        <div className="activity">
          <h2>Activity</h2>

          <ul>
            <li>✅ Completed tasks: {completedTasks}</li>
            <li>⏳ Pending tasks: {pendingTasks}</li>
            <li>🔥 High priority tasks: {highPriorityTasks}</li>
          </ul>
        </div>
      </section>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="popup-content old-popup">
            <h2>Add New Task</h2>

            <input
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="date-wrapper">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="quick-dates">
              <button onClick={() => setQuickDate("today")}>Today</button>
              <button onClick={() => setQuickDate("tomorrow")}>Tomorrow</button>
              <button onClick={() => setQuickDate("nextWeek")}>Next Week</button>
            </div>

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <div className="popup-buttons">
              <button onClick={addTask}>Add Task</button>
              <button
                onClick={() => {
                  resetAddForm();
                  setShowAddModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="popup-content old-popup">
            <h2>Update Task</h2>

            <input
              type="text"
              placeholder="Task Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <textarea
              placeholder="Task Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <div className="date-wrapper">
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="quick-dates">
              <button onClick={() => setQuickDate("today", "edit")}>Today</button>
              <button onClick={() => setQuickDate("tomorrow", "edit")}>Tomorrow</button>
              <button onClick={() => setQuickDate("nextWeek", "edit")}>Next Week</button>
            </div>

            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <div className="popup-buttons">
              <button onClick={editTask}>Update Task</button>
              <button onClick={resetEditForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal-overlay">
          <div className="profile-card">
            <button className="modal-close" onClick={() => setShowProfile(false)}>
              ×
            </button>

            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>

            <h2>{user?.name || "User"}</h2>
            <p>{user?.email || "No email available"}</p>

            <div className="profile-stats">
              <div>
                <span>{tasks.length}</span>
                <small>Total</small>
              </div>

              <div>
                <span>{completedTasks}</span>
                <small>Done</small>
              </div>

              <div>
                <span>{pendingTasks}</span>
                <small>Pending</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;