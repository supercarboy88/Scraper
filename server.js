// steves npr news scraper

var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");
var path = require("path");

var db = require("./models");
var PORT = process.env.PORT || 3000

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
    axios.get("https://www.npr.org").then(function (response) {
        var $ = cheerio.load(response.data);
        $("article").each(function (i, element) {
            var result = {};

            result.headline = $(this)
                .find("h2")
                .text();
            result.URL = $(this)
                .find("a")
                .attr("href");
            result.summary = $(this)
                .find("p")
                .text()

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err)
                })
        })
        res.send("Scrape Complete")
    })
});

app.get("/articles", function (req, res) {
    db.Article
        .find(req.query)
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.put("/articles/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true }).then(function (savedArticle) {
        res.json(savedArticle)
    })
});

app.get("/articles/:id", function (req, res) {
    db.Article
        .findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id}, { note: dbNote._id }, { new: true })
        })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.get("/saved", function(req, res) {
	res.sendFile(path.join(__dirname, '/public/saved.html'));
});

app.get("/api/saved", function(req, res) {
    db.Article
        .find({ saved: true })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.post("/api/notes", function (req, res) {
    db.Note 
        .create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id}, { new: true })
        })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        })
});

app.get("/api/notes", function (req, res) {
    db.Note.find({ _headlineId: req.body._headlineId }).then(function (dbNote) {
        console.log("note added")
        res.json(dbNote)
    })
});

app.get("/api/clear", function (req, res) {
    db.Article  
        .find(req.query)
        .then(function (dbArticle) {
            db.Article.collection.deleteMany()
            initPage()
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.listen(PORT, function () {
    console.log("app running on port " + PORT)
});