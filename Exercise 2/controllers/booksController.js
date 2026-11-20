const mongoose = require("mongoose");
const Book = require("../models/Book");

// GET - Get all books and filter by year
const getAllBooks = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.year !== undefined) {
      const year = req.query.year;

      if (
        typeof year !== "string" ||
        !year.trim() ||
        !Number.isInteger(Number(year))
      ) {
        return res.status(400).json({
          message: "Invalid published year",
        });
      }

      filter.publishedYear = Number(year);
    }

    const books = await Book.find(filter);

    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

// GET - Search books by genre
const searchBooks = async (req, res, next) => {
  try {
    const { genre } = req.query;

    if (typeof genre !== "string" || !genre.trim()) {
      return res.status(400).json({
        message: "Genre is required",
      });
    }

    const safeGenre = genre.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const books = await Book.find({
      genre: {
        $regex: safeGenre,
        $options: "i",
      },
    });

    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

// GET - Get a single book
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// POST - Create a new book
const createBook = async (req, res, next) => {
  try {
    const { title, author, publishedYear, genre } = req.body || {};

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

    const newBook = await Book.create({
      title,
      author,
      publishedYear,
      genre,
    });

    res.status(201).json(newBook);
  } catch (error) {
    next(error);
  }
};

// PUT - Update a book
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const body = req.body || {};
    const updates = {};

    const allowedFields = ["title", "author", "publishedYear", "genre"];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    if (
      ("title" in updates &&
        (typeof updates.title !== "string" || !updates.title.trim())) ||
      ("author" in updates &&
        (typeof updates.author !== "string" || !updates.author.trim()))
    ) {
      return res.status(400).json({
        message: "Title and author must be valid strings",
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    next(error);
  }
};

// DELETE - Delete a book
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
