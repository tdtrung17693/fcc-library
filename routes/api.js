/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var xss = require("xss");
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app, db) {
  app
    .route("/api/books")
    .get(function(req, res, next) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection("books")
        .aggregate([
          {
            $project: { _id: 1, title: 1, commentcount: { $size: "$comments" } }
          }
        ])
        .toArray()
        .then(docs => {
          return res.json(docs);
        })
        .catch(next);
    })

    .post(function(req, res, next) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title)
        return next({ error: "title_missing", message: "Missing title" });

      db.collection("books")
        .insertOne({
          title: xss(title),
          comments: []
        })
        .then(book => {
          return res.json(book.ops[0]);
        })
        .catch(next);
    })

    .delete(function(req, res, next) {
      //if successful response will be 'complete delete successful'
      db.collection("books")
        .deleteMany({})
        .then(() =>
          res.json({
            success: true,
            message: "All books are deleted successfully"
          })
        )
        .catch(next);
    });

  app
    .route("/api/books/:id")
    .all(function(req, res, next) {
      var bookid = req.params.id;

      if (!bookid)
        return next({ error: "missing_id", message: "Missing book id" });

      if (bookid.length < 24)
        return next({ error: "invalid_id", message: "Invalid id" });

      next();
    })
    .get(function(req, res, next) {
      var bookid = req.params.id;

      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection("books")
        .findOne({
          _id: new ObjectId(bookid)
        })
        .then(doc => {
          if (!doc)
            return next({
              error: "id_not_found",
              message: "Book id not found"
            });
          return res.json(doc);
        })
        .catch(next);
    })

    .post(function(req, res, next) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

      if (!comment || comment.length < 15)
        return next({
          error: "short_comment",
          message: "Comment must be at least 16 characters"
        });

      db.collection("books")
        .findOne({
          _id: new ObjectId(bookid)
        })
        .then(book => {
          if (!book)
            return next({
              error: "id_not_found",
              message: "Book id not found"
            });

          db.collection("books")
            .findOneAndUpdate(
              { _id: new ObjectId(bookid) },
              {
                $push: {
                  comments: xss(comment)
                }
              }
            )
            .then(doc => res.json(doc.value))
            .catch(next);
        });
    })

    .delete(function(req, res, next) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.collection("books")
        .deleteOne({
          _id: new ObjectId(bookid)
        })
        .then(ret => {
          if (ret.result.n === 0)
            return next({
              error: "id_not_found",
              message: "Book id not foudn"
            });

          res.json({ success: true, message: "Successfully deleted" });
        })
        .catch(next);
    });

  app.use("/api", function(err, req, res, next) {
    if (err.error) {
      res.status(400);
      return res.json({ error: err.error, message: err.message });
    }

    res.status(500);
    res.json({ error: err, message: err.message });
  });
};
