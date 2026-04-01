import connectDB from "./config/db.js";
import dotenv from "dotenv";
import express from "express";

const app = express();

dotenv.config();

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/users", require("./routes/userRoutes.js"));
