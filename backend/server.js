require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const analyzeRoute = require("./routes/analyze");

const app = express();
app.use(helmet());
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://edge-finder-ysme.onrender.com",
      "https://edge-finder.vercel.app",
      "https://edge-finder-eta.vercel.app",
    ],
  })
);
app.use(express.json());
 
// Rate limiting — 10 requests per IP per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests. Try again in an hour." },
});
app.use("/api/", limiter);
 
// Routes
app.use("/api/analyze", analyzeRoute);
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 
