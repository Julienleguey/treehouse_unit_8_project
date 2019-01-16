var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
var Sequelize = require('sequelize');
const Op = Sequelize.Op;

/****************
GET all the books
****************/
router.get('/', function(req, res, next) {
  // defining search
  let search = req.query.search;
  if(search === undefined) {
    search = "";
  }
  // adding the search term in an array
  let searchTerms = search.split(" ");
  // function used to search for different keywords
  function functionSearch(search, searchTerms) {
    let searchArray = [];
    for (let i = 0; i < searchTerms.length; i++) {
      searchArray.push({[Op.like]: '%' + searchTerms[i] + '%'});
    }
    if (search === "") {
      return {[Op.like]: '%' + "" + '%'};
    } else {
      return searchArray;
    }
  }
  // finding all the books according to search
  /* Search principle:
    1. The user may want to find a book using words in the title.
    Since a library can have a lot of books, ALL of the keywords used by the user have to be in the title.
    e.g.: searching for "harry fire" will only return "Harry Potter and the Goblet of Fire"
    2. The user may want to find a book by author, genre or year. In those cases, the search will return any books with one of the keywords
    matching these 3 categories.
    e.g.: searching for "Rowling 2011" will return all the books by J.K. Rowling and all the books from 2011.
    e.g.: searching for "harry fire 2011" will only return the books from 2011, since no books title matches exactly this 3 keywords.
    e.g.: searching for "harry fire rowling 2011" will return all the books by J.K. Rowling and all the books from 2011.
  */
  Book.findAll({order: [["title", "ASC"]], where: {[Op.or]: {
    title: {[Op.and]: functionSearch(search, searchTerms)},
    author: {[Op.or]: functionSearch(search, searchTerms)},
    genre: {[Op.or]: functionSearch(search, searchTerms)},
    year: {[Op.or]: functionSearch(search, searchTerms)},
  }}}).then(function(books) {
    res.render("books/index", {books: books, title: "Books"});
  });
});


/**************************
GET, create a new book form
**************************/
router.get('/new', function(req, res, next) {
  res.render("books/new-book", {book: Book.build(), title: "New Book"});
});


/**********************
POST, create a book
**********************/
router.post('/new', function(req, res, next) {
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


/*****************************************************
GET an individual book in order to update or delete it
*****************************************************/
router.get("/:id", function(req, res, next){
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


/******************
POST a book update
******************/
router.post("/:id", function(req, res, next){
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


/******************************
POST, delete an individual book
******************************/
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
