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

  function functionSearch(search, searchTerms) {
    let pouet = [];
    for (let i = 0; i < searchTerms.length; i++) {
      pouet.push({[Op.like]: '%' + searchTerms[i] + '%'});
    }
    if (search === "") {
      return {[Op.like]: '%' + "" + '%'};
    } else {
      return pouet;
    }
  }


  // adding the search term in an array
  let searchTerms = search.split(" ");
  console.log(searchTerms);
  // finding all the books according to search
  // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.like]: '%' + search + '%'}}}).then(function(books) {
  Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.and]: functionSearch(search, searchTerms)}}}).then(function(books) {
  // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.and]: [{[Op.like]: '%' + 'harry' + '%'}, {[Op.like]: '%' + 'fire' + '%'}]}}}).then(function(books) {
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
