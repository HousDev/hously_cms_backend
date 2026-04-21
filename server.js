const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const adminRoutes = require("./routes/adminRoutes");
const homeSlideRoutes = require("./routes/homeSlideRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const blogRoutes = require("./routes/blogRoutes");
const blogCategoryRoutes = require("./routes/blogCategoryRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const jobRoutes = require("./routes/jobRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const teamRoutes = require("./routes/teamRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // later restrict in production
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 New client connected");

  // Receive token from frontend
  const token = socket.handshake.auth?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, "secretkey");

      console.log("✅ Admin connected:", decoded.email);

      // Join admin room
      socket.join("admin");

    } catch (err) {
      console.log("❌ Invalid token");
    }
  }

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

app.use("/uploads", express.static("uploads"));
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server Running");
});

app.use("/api/admin", adminRoutes);
app.use("/api/home-slides", homeSlideRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Get Users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Fetch Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// ✅ Insert User
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";

  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "✅ User Added Successfully",
      id: result.insertId,
    });
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



