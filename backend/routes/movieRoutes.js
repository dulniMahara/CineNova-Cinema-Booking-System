const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const { buildMovieFilter } = require("../utils/filterMovies");

// GET all movies 
router.get("/", async (req, res) => {
  try {
    const filter = buildMovieFilter(req.query); 
    const movies = await Movie.find(filter);
    return res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET single movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json(movie);
  } catch (error) {
    console.error(`Error fetching movie with id ${req.params.id}:`, error);
    return res.status(500).json({ message: "Server error" });
  }
});

// CREATE a new movie
router.post("/", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const savedMovie = await movie.save();
    return res.status(201).json(savedMovie);
  } catch (error) {
    console.error("Error creating movie:", error);
    return res.status(400).json({ message: "Invalid movie data" });
  }
});

// UPDATE a movie by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMovie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json(updatedMovie);
  } catch (error) {
    console.error(`Error updating movie with id ${req.params.id}:`, error);
    return res.status(400).json({ message: "Invalid update data" });
  }
});

// DELETE a movie by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) return res.status(404).json({ message: "Movie not found" });
    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error(`Error deleting movie with id ${req.params.id}:`, error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;