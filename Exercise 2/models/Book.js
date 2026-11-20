const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  publishedYear: {
    type: Number,
  },
  genre: {
    type: String,
    trim: true,
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
