if (process.env.NODE_ENV === "test") {
  module.exports = {
    info: () => {},
    error: () => {},
    log: () => {}
  };
} else {
  var Logger = require("logdna");
  var options = {
    hostname: "127.0.0.1",
    ip: "127.0.0.1",
    app: "fcc-library",
    env: "dev"
  };

  const apiKey = process.env.LOG_KEY;

  // Defaults to false, when true ensures meta object will be searchable
  options.index_meta = true;

  // Add tags in array or comma-separated string format:
  options.tags = ["logging", "nodejs", "logdna"];
  // or:
  options.tags = "logging,nodejs,logdna";

  // Define a singleton instance
  var logger = Logger.setupDefaultLogger(apiKey, options);

  module.exports = logger;
}
