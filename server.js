"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");
const logger = require("./app/log");
const initDb = require("./app/db");

const app = express();

app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: "PHP 4.2.0" }));
app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route("/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Start our server and tests!
const PORT = process.env.PORT || 3000;

initDb((err, db) => {
  if (err) return logger.error("Database error", err);
  //Routing for API
  apiRoutes(app, db);

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });

  app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
    logger.log("Listening on port" + PORT);
    if (process.env.NODE_ENV === "test") {
      console.log("Running Tests...");
      setTimeout(function() {
        try {
          runner.run();
        } catch (e) {
          const error = e;
          console.log("Tests are not valid:");
          console.log(error);
        }
      }, 1500);
    }
  });
});

module.exports = app; //for unit/functional testing
