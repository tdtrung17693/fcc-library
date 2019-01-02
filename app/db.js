const mongo = require("mongodb").MongoClient;

module.exports = function init(cb) {
  mongo.connect(
    `mongodb://${process.env.MLAB_URI}`,
    {
      useNewUrlParser: true,
      auth: {
        user: process.env.MLAB_USER,
        password: process.env.MLAB_PASS
      },
      authSource: process.env.MLAB_DB
    },
    (err, client) => {
      if (err) return cb(err);

      const db = client.db(process.env.MLAB_DB);

      cb(null, db);
    }
  );
};
