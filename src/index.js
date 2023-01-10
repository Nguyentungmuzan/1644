const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();

//port
const port = process.env.PORT || 3333;
const main = async () => {
  const app = express();

  // app config
  app.use(cors());
  app.use(morgan("tiny"));
  app.use(express.json());

  app.use("/", (req, res) => {
    res.json({
      message: "Du moa chung may",
    });
  });

  app.use("*", (req, res) => {
    res.json({
      message: "This url does not exist",
    });
  });

  app.listen(port, () => {
    console.log(`Server is listening on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}`);
  });
};

main();