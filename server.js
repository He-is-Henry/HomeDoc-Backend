require("dotenv").config();
const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cors(corsOptions));
connectDB();
app.use(cookieParser());
app.use(express.json());

app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/symptoms", require("./routes/symptomRoutes"));
app.use("/chats", require("./routes/chatRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
