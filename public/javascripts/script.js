/*
File used for the pagination of index.pug
*/

// declaring the number of books per page
const limitPerPage = 5;

// selecting the books and the number of pages needed
const books = document.querySelectorAll('tbody tr');
const nbrPages = Math.ceil(books.length / limitPerPage);

// creating the buttons for the pagination
const divPages = document.querySelector('#pagination');

const ulPagination = document.createElement('ul');
divPages.appendChild(ulPagination);

for (let i = 0; i < nbrPages; i++) {
  const liPagination = document.createElement('li');
  const aButton = document.createElement('a');
  aButton.className = "button";
  aButton.href = '#';
  aButton.textContent = i+1;
  liPagination.appendChild(aButton);
  ulPagination.appendChild(liPagination);
}

// on first load of index.pug, the first page of book is displayed
document.addEventListener("DOMContentLoaded", function(event) {
  for (let i=0; i < limitPerPage; i++) {
    books[i].classList.remove('hidden');
    books[i].classList.add('displayed');
    // books[i].style.display = '';
  }
  for (let i=limitPerPage; i < books.length; i++) {
    books[i].classList.remove('displayed');
    books[i].classList.add('hidden');
    // books[i].style.display = 'none';
  }
});

// event listener for the pagination's buttons
divPages.addEventListener('click', (e) => {
  const buttonClicked = event.target.textContent;
  const pagesButtons = document.querySelectorAll('div ul li a');

  // when a pagination button is clicked, it takes the class 'active'
  for (let i = 0; i < nbrPages; i++) {
    pagesButtons[i].classList.remove('active');
  }
  event.target.classList.add('active');

  // displaying the books of the page and hidding the others
  let lastBookDisplayed = 0;
  if (limitPerPage*buttonClicked > books.length) {
    lastBookDisplayed = books.length;
  } else {
    lastBookDisplayed = limitPerPage*buttonClicked;
  }
  // hidding the books before the current page
  for (let i=0; i < limitPerPage*(buttonClicked-1); i++) {
    books[i].classList.remove('displayed');
    books[i].classList.add('hidden');
  }
  // displaying the books of the current page
  for (let i=limitPerPage*(buttonClicked-1); i < lastBookDisplayed; i++) {
    books[i].classList.remove('hidden');
    books[i].classList.add('displayed');
  }
  // hidding the books after the current page
  for (let i=limitPerPage*buttonClicked; i < books.length; i++) {
    books[i].classList.remove('displayed');
    books[i].classList.add('hidden');
  }
});
