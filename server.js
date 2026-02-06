const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const mainRoutes = require("./src/routes/mainRoutes");

dotenv.config();
const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} [${req.method}] ${req.originalUrl} - Started`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} [${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use("/api", mainRoutes);

// Test route to verify server is alive
app.get("/ping", (req, res) => res.send("pong"));

const os = require('os');
connectDB();
app.listen(port, "0.0.0.0", () => {
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
      }
    }
  }
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Mobile access: http://${localIp}:${port}`);
});