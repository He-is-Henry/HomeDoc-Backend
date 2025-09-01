// config/corsOptions.js
const allowedOrigins = [
  "http://localhost:5173",
  "https://homedoc-backend-69l2.onrender.com"
  // "http://localhost:3000","https://your-production-domain.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
