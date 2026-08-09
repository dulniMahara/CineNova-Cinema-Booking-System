require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("../models/movie");
const tmdb = require("../utils/tmdb");

const getMovieMedia = async (movieName) => {
  try {
    const response = await tmdb.get("/search/movie", {
      params: { query: movieName }
    });

    const movie = response.data.results[0];
    if (!movie) {
      return { posterUrl: "", bannerUrl: "", trailerUrl: "" };
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    const bannerUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : "";

    let trailerUrl = "";
    try {
      const vidResponse = await tmdb.get(`/movie/${movie.id}/videos`);
      const videos = vidResponse.data.results || [];
      const trailer =
        videos.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
        videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
        videos.find(v => v.site === "YouTube" && v.type === "Teaser") ||
        videos.find(v => v.site === "YouTube");

      if (trailer && trailer.key) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    } catch (vidErr) {
      console.log("Could not fetch TMDB videos for:", movieName);
    }

    return { posterUrl, bannerUrl, trailerUrl };
  } catch (err) {
    console.error("TMDB fetch error for:", movieName, err.message);
    return { posterUrl: "", bannerUrl: "", trailerUrl: "" };
  }
};

const updateCatalogue = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // 1. Update Spider-Man to 'now' status
    const spiderManMovies = await Movie.find({ title: { $regex: /Spider-Man/i } });
    console.log(`Found ${spiderManMovies.length} Spider-Man movie(s) in DB`);

    for (const movie of spiderManMovies) {
      movie.status = "now";
      await movie.save();
      console.log(`Updated Spider-Man movie ID ${movie._id} status to 'now'`);
    }

    // 2. Add 'Avatar: Fire and Ash' to Coming Soon if it doesn't already exist
    const avatarMovie = await Movie.findOne({ title: { $regex: /Avatar/i } });
    if (!avatarMovie) {
      console.log("Adding Avatar: Fire and Ash to database...");
      const media = await getMovieMedia("Avatar: Fire and Ash");
      const newMovie = new Movie({
        title: "Avatar: Fire and Ash",
        description:
          "In the wake of the devastating war against the RDA, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na'vi tribe led by the ruthless Varang.",
        duration: 190,
        genre: ["Action", "Adventure", "Sci-Fi", "Fantasy"],
        rating: 8.5,
        status: "soon",
        posterUrl: media.posterUrl,
        bannerUrl: media.bannerUrl,
        trailerUrl: media.trailerUrl
      });
      await newMovie.save();
      console.log(`✅ Avatar: Fire and Ash created with ID ${newMovie._id} and status 'soon'`);
    } else {
      console.log(`Avatar movie already exists in DB with ID ${avatarMovie._id}, status: ${avatarMovie.status}`);
      if (avatarMovie.status !== "soon") {
        avatarMovie.status = "soon";
        await avatarMovie.save();
        console.log(`Updated Avatar movie ID ${avatarMovie._id} status to 'soon'`);
      }
    }

    // Print summary of movies in DB
    const allMovies = await Movie.find();
    console.log("\n--- CURRENT MOVIE CATALOGUE IN DB ---");
    allMovies.forEach(m => {
      console.log(`- ID: ${m._id} | Title: "${m.title}" | Status: ${m.status}`);
    });

    await mongoose.disconnect();
    console.log("✅ Catalogue update complete!");
  } catch (error) {
    console.error("❌ Catalogue update failed:", error);
    process.exit(1);
  }
};

updateCatalogue();
