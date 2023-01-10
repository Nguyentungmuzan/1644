const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 3333;

const app = express();

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Du moa chung may",
  });
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
})
