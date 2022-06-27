require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const port = process.env.port || 3001;

const routes = require("./routes");

app.use(morgan("dev"));
app.use("/", routes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
