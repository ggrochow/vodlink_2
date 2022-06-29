require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const port = process.env.port || 3001;

const routes = require("./routes");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/", routes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
