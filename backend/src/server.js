const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config({ path: "../.env" });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
