const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiter");

dotenv.config({ path: "../.env" });
connectDB();

const app = express();

// ── Trust proxy — required for Render/Vercel so rate limiting
//    works on the real client IP, not the platform's proxy IP
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// ── Base rate limit: 100 req / 15 min on all /api/* routes ──
app.use("/api", generalLimiter);

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders",   require("./routes/order.routes"));
app.use("/api/reviews",  require("./routes/review.routes"));
app.use("/api/admin",    require("./routes/admin.routes"));


app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on port ${process.env.PORT}`)
);
