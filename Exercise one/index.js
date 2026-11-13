const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [
  { id: 1, title: "Atomic Habits", author: "James Clear" },
  { id: 2, title: "Deep Work", author: "Cal Newport" },
];

let nextBookId = 3;

// GET - Get all books
app.get("/books", (req, res) => {
  res.status(200).json(books);
});

// GET - Search books by author
app.get("/books/search", (req, res) => {
  const author = req.query.author;

  if (typeof author !== "string" || !author.trim()) {
    return res.status(400).json({
      message: "Author query is required",
    });
  }

  const results = books.filter((book) =>
    book.author.toLowerCase().includes(author.trim().toLowerCase()),
  );

  res.status(200).json(results);
});

// GET - Get a single book
app.get("/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  const book = books.find((book) => book.id === id);

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  res.status(200).json(book);
});

// POST - Add a new book
app.post("/books", (req, res) => {
  const { title, author } = req.body || {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof author !== "string" ||
    !author.trim()
  ) {
    return res.status(400).json({
      message: "Title and author are required",
    });
  }

  const newBook = {
    id: nextBookId++,
    title: title.trim(),
    author: author.trim(),
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

// PUT - Update a book's title
app.put("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  const book = books.find((book) => book.id === id);

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  book.title = title.trim();

  res.status(200).json(book);
});

// DELETE - Delete a book
app.delete("/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid book ID",
    });
  }

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  const deletedBook = books.splice(index, 1)[0];

  res.status(200).json({
    message: "Book deleted successfully",
    book: deletedBook,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
