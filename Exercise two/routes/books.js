const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/booksController");

// GET - All books
router.get("/", getAllBooks);

// GET - Search by genre
router.get("/search", searchBooks);

// GET - Single book
router.get("/:id", getBookById);

// POST - Create book
router.post("/", createBook);

// PUT - Update book
router.put("/:id", updateBook);

// DELETE - Delete book
router.delete("/:id", deleteBook);

module.exports = router;
