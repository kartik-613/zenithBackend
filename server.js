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

app.use("/api", mainRoutes);

// Test route to verify server is alive
app.get("/ping", (req, res) => res.send("pong"));

connectDB();
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
  console.log(`Mobile access: http://10.30.79.203:${port}`);
});