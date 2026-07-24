const Movie = require("../models/movie");
const {buildMovieFilter} = require("../utils/filterMovies")

//Post - Create a movie
exports.createMovie = async (req, res) => {
    try{
        const movie = new Movie(req.body);
        const savedMovie = await movie.save();
        res.status(201).json(savedMovie);
    } catch (err){
        console.log("CREATE MOVIE ERROR:", err);
        res.status(400).json({message: err.message});
    }
};

//Get - Get all movies
exports.getMovies = async (req, res) => {
    try{
        const filter = buildMovieFilter(req.query);
        const movies = await Movie.find(filter);
        res.status(200).json(movies);
    } catch (err){
        res.status(500).json({message: err.message});
    }
};

//Get - Get movie by id
exports.getMovieById = async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({message: "Movie not found"});
        res.status(200).json(movie);
    } catch (err){
        res.status(500).json({message: err.message});
    }
};

//Put - Update a movie
exports.updateMovie = async (req, res) => {
    try{
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if(!updatedMovie)
            return res.status(404).json({message: "Movie not found"});
        res.status(200).json(updatedMovie);
    } catch (err){
        res.status(400).json({message: err.message});
    }
};

//Delete - Delete a movie
exports.deleteMovie = async (req, res) => {
    try{
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if(!deletedMovie)
            return res.status(404).json({message: "Movie not found"});
        res.status(200).json({message: "Movie deleted successfully"});
    } catch (err){
        res.status(500).json({message: err.message});
    }
};