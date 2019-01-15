var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

/* GET all the books */
router.get('/', function(req, res, next) {
  // defining search
  let search = req.query.search;
  if(search === undefined) {
    search = "";
  }
  // finding all the books according to search
  Book.findAll({
    order: [["title", "ASC"]], 
    // Construct request to get the following : "find Book where title LIKE brief and LIKE time"
    // This one is static obvsly
    // As there's no pre made function in js to do what you need you have to make the custom algorithm
    // 1- Split search string in an array of string
    // 2- Iterate through each string in the array (loop) to construct the request
    // I leave it static with that note because I don't even know how to make a js loop 😂
    where: {
      [Op.and]: [{
        title: { [Op.like]: '%' + "brief" + '%' },  
        title: { [Op.like]: '%' + "time" + '%' }
      }]
    }
  }).then(function(books) {
    res.render("books/index", {books: books, title: "Books"});
  });
});

/* Create a new book form. */
router.get('/new-book', function(req, res, next) {
  res.render("books/new-book", {book: Book.build(), title: "New Book"});
});

/* POST create book. */
router.post('/new-book', function(req, res, next) {
  Book.create(req.body).then(function(book) {
    res.redirect("/books");
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
      res.render("books/new-book", {
        book: Book.build(req.body),
        title: "New Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});

/* GET individual book in order to update or delete it. */
router.get("/:id/update", function(req, res, next){
  Book.findById(req.params.id).then(function(book) {
    if (book) {
      res.render("books/update-book", {book: book, title: "Update Book"});
    } else {
      res.status(404).render("books/error", {
        title: "Server Error",
        message: "Sorry! There was an unexpected error on the server."
      });
    }
  }).catch(function(err){
    res.send(500);
  });
});



/* POST update book. */
router.post("/:id/update", function(req, res, next){
  Book.findById(req.params.id).then(function(book) {
    if (book) {
      return book.update(req.body);
    } else {
      res.status(404).render("books/error", {
        title: "Server Error",
        message: "Sorry! There was an unexpected error on the server."
      });
    }
  }).then(function(){
    res.redirect("/books");
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
      const book = Book.build(req.body);
      book.id = req.params.id;

      res.render("books/update-book", {
        book: book,
        title: "Update Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch(function(err){
    res.send(500);
  });
});


/* DELETE individual book. */
router.post("/:id/delete", function(req, res, next){
  Book.findById(req.params.id).then(function(book) {
    if (book) {
      return book.destroy();
    } else {
      res.status(404).render("books/error", {
        title: "Server Error",
        message: "Sorry! There was an unexpected error on the server."
      });
    }
  }).then(function(){
    res.redirect("/books");
  }).catch(function(err){
    res.send(500);
  });
});


module.exports = router;
