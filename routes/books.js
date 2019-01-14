var express = require('express');
var router = express.Router();
var Book = require("../models").Book;
var Sequelize = require('sequelize');
const Op = Sequelize.Op;



/* GET all the books */
router.get('/pageblob:page', function(req, res, next) {
  const search = req.query.search;
  if(search === undefined) {
    Book.findAll({order: [["title", "ASC"]]}).then(function(books) {
      const limitPage = 5;
      let booksArray = [];
      const pagesNbr = Math.ceil(books.length / limitPage);
      let counter = 0;
      for (let i=0; i < pagesNbr; i++) {
        const newArray = [];
        for (let j=0; j < limitPage; j++) {
          if (counter < books.length) {
            newArray.push(books[counter]);
            counter += 1;
          }
        }
        booksArray.push(newArray);
      }
      res.render("books/index", {books: booksArray[req.params.page - 1], title: "Books", pagesNbr: Math.ceil(books.length / limitPage)});
      console.log("ON A TOUT !");
    });
  } else {
    const searchSplit = search.split(" ");
    console.log(searchSplit);

    let searches = "";
    for (let i = 0; i < searchSplit.length; i++) {
      searches += "%" + searchSplit[i] + "%";
      if (i < searchSplit.length - 1) {
        searches += " , ";
      }
    }
    console.log(searches);

    Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.like]: '%' + search + '%'}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.or]: {[Op.like]: '%' + search + '%'}}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.or]: {[Op.like]: '%harry%', [Op.like]: '%fire%'}}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {[Op.and]: [{title: {[Op.like]: '%harry%'}}, {title: {[Op.like]: '%fire%'}}]}}).then(function(books) { // ça, ça marche bien
    // Book.findAll({order: [["title", "ASC"]], where: {[Op.and]: [{title: {[Op.like]: '%harry%'}}]}}).then(function(books) { // marche aussi avec un seul
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.and]: [{[Op.like]: '%' + searchSplit[0] + '%'}, {[Op.like]: '%' + searchSplit[1] + '%'}]}}}).then(function(books) { // marche aussi comme ça
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.contained]: ['%harry%', '%fire%']}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.and]: [{[Op.like]: '%harry%'}]}}}).then(function(books) { // marche aussi avec un seul
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.like]: '%fire%', [Op.like]: '%harry%'}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.or]: {searches}}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.like]: {[Op.any]: ['Harry', 'Potter']}}}}).then(function(books) { // ça marche pas ça
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.like]: '%harry%' && '%fire%'}}}).then(function(books) {
    // Book.findAll({order: [["title", "ASC"]], where: {title: {[Op.like]: searches}}}).then(function(books) {
      res.render("books/index", {books: books, title: "Books"});
      console.log("ON A UNE SELECTION !");
    });
  }
});


/* Create a new book form. */
router.get('/new-book', function(req, res, next) {
  res.render("books/new-book", {book: Book.build(), title: "New Book"});
});

/* POST create book. */
router.post('/new-book', function(req, res, next) {
  Book.create(req.body).then(function(book) {
    res.redirect("/books/pageblob1");
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
    res.redirect("/books/pageblob1");
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
    res.redirect("/books/pageblob1");
  }).catch(function(err){
    res.send(500);
  });
});


module.exports = router;
